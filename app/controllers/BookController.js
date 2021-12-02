"use strict";

const Joi = require("joi");
const util = require("util");
const fs = require("fs");
const unlinkFile = util.promisify(fs.unlink);
const path = require("path");
const { success, failure, dataResponse } = require("../../helper/response");
const uploadFile = require("../../helper/uploadS3");
const {
  capitalizeFirstLetter,
  updateOrCreate,
} = require("../../helper/common");

const {
  Sequelize,
  sequelize,
  User,
  Book,
  Category,
  Favorite,
} = require("../models");
const { QueryTypes } = require("sequelize");
const Op = Sequelize.Op;
/*REMOVE FILE FROM LOCAL STORAGE*/
const unLinkImage = async (file) => {
  if (file == null || file == "" || file == undefined) {
    throw new Error("Image is required.");
  }

  const result = await uploadFile(file);

  await unlinkFile(file.path);
  return result;
};
const likesCount = async (id) => {
  let book = await Book.findOne({ where: { id: id } });
  if (book != null) {
    let totalLikes = await Favorite.findAll({
      where: { book_id: id, status: "1" },
      attributes: [
        [sequelize.fn("sum", sequelize.col("status")), "total_likes"],
      ],
      raw: true,
    });
    console.log(totalLikes[0]);
    let updateBadge = totalLikes[0];

    await Book.update(updateBadge, { where: { id: id } });
  }
};
module.exports = class BookController {
  /**
   * UPLOAD FILE API
   */
  async fileUpload(req, res) {
    try {
      if (req.file == null || req.file == "" || req.file == undefined) {
        throw new Error("Image is required.");
      }

      const result = await unLinkImage(req.file);

      dataResponse(res, "File uploaded successfully.", result.Location);
    } catch (error) {
      return failure(res, error.message);
    }
  }

  /**
   * UPDATE DEVICE TYPE AND TOKEN API
   */
  async updateDevice(req, res) {
    try {
      const { device_type, device_token } = req.body;
      const rules = Joi.object({
        device_type: Joi.string().required(),
        device_token: Joi.string().required(),
      });
      const { error } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
      });
      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const data = {
        device_type,
        device_token,
      };
      const result = await updateOrCreate(
        User,
        { device_token: device_token },
        data
      );

      if (result) {
        dataResponse(res, "Device token and type updated successfully", data);
      } else {
        throw new Error("Unable to update device_token");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }

  /**
   * UPDATE Payment status
   */
  async updatePaymentStatus(req, res) {
    try {
      const { device_type, device_token, payment_status } = req.body;
      const rules = Joi.object({
        device_type: Joi.string().required(),
        device_token: Joi.string().required(),
        payment_status: Joi.string().valid("0", "1").required(),
      });
      const { error } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
      });
      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const data = {
        device_type,
        device_token,
        payment_status,
      };
      const result = await User.update(data, {
        where: { device_token: device_token },
      });

      if (result) {
        dataResponse(res, "Payment successfully", data);
      } else {
        throw new Error("Unable to update record,try again");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }
  /**
   * FETCH USER DETAILS WITH DEVICE TOKEN
   */
  async fetchUserDetails(req, res) {
    try {
      const { device_token } = req.body;
      const rules = Joi.object({
        device_token: Joi.string().required(),
      });
      const { error } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
      });
      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const result = await User.findOne({
        where: { device_token: device_token },
      });

      if (result) {
        dataResponse(res, "User Details", result);
      } else {
        throw new Error("No device found!");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }
  /*ADMIN API TO ADD BOOK*/

  async addBook(req, res) {
    try {
      const rules = Joi.object({
        user_id: Joi.string().required(),
        category_name: Joi.string().required(),
        topic_name: Joi.string().required(),
        title: Joi.string().required(),
        total_pages: Joi.string().required(),
        cover_photo: Joi.string().required(),
        book_url: Joi.string().required(),
      });

      const { error, value } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }
      const {
        user_id,
        category_name,
        topic_name,
        title,
        total_pages,
        cover_photo,
        book_url,
      } = req.body;

      const data = {
        user_id: user_id,
        category_name: category_name.toUpperCase(),
        topic_name: topic_name,
        book_name: title,
        total_pages: total_pages,
        cover_photo: cover_photo,
        book_url: book_url,
      };

      const book = await Book.create(data);
      const category = await Category.findOne({
        where: { category_name: category_name.toUpperCase() },
      });

      if (category == null) {
        await Category.create({
          category_name: category_name.toUpperCase(),
        });
      }
      const appResponse = {
        user_id: book.user_id,
        book_id: book.id,
        category_name: book.category_name,
        topic_name: book.topic_name,
        book_name: book.book_name,
        total_pages: book.total_pages,
        cover_photo: book.cover_photo,
        book_url: book.book_url,
      };

      dataResponse(res, "Book Uploaded Successfully.", appResponse);
    } catch (err) {
      failure(res, err.message);
    }
  }

  /**FETCH ALL CATEGORIES */
  async fetchCategoryList(req, res) {
    try {
      const result = await Category.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        order: [["id", "ASC"]],
      });
      if (result) {
        dataResponse(res, `${result.length} Categories Found`, result);
      } else {
        throw new Error("No categories found");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }

  /**ADD OR REMOVE FAVORITE API */
  async addOrRemoveFavorite(req, res) {
    try {
      const rules = Joi.object({
        user_id: Joi.string().trim().required(),
        book_id: Joi.string().trim().required(),
        status: Joi.string().valid("0", "1").required(),
      });

      const { error, value } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }
      const { user_id, book_id, status } = req.body;
      let data = {
        book_id: book_id,
        user_id: user_id,
        status: status,
      };
      const result = await updateOrCreate(
        Favorite,
        { book_id: book_id, user_id: user_id },
        data
      );

      likesCount(book_id);
      let responseName = status == "0" ? "Removed from" : "Added to";
      success(res, `${responseName} favorite`);
    } catch (err) {
      failure(res, err.message);
    }
  }
  /**FETCH ALL FAVORITES BOOKS */

  async fetchFavoriteBooks(req, res) {
    try {
      const rules = Joi.object({
        user_id: Joi.string().required(),
      });

      const { error, value } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const { user_id } = req.body;
      const user = await User.findOne({ where: { device_token: user_id } });
      if (user == null) {
        throw new Error("User not found of this token");
      }
      let sqlQuery = `SELECT favorites.book_id,favorites.user_id,books.*  FROM favorites JOIN books ON favorites.book_id = books.id WHERE favorites.user_id='${user_id}' AND favorites.status='1'`;

      let result = await sequelize.query(sqlQuery, {
        type: QueryTypes.SELECT,
      });
      dataResponse(res, `${result.length} favorites list found`, result);
    } catch (err) {
      failure(res, err.message);
    }
  }

  /**BOOK DETAILS API */
  async bookDetails(req, res) {
    try {
      const rules = Joi.object({
        book_id: Joi.string().required(),
      });

      const { error, value } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const { book_id } = req.body;
      const result = await Book.findOne({ where: { id: book_id } });

      if (result) {
        dataResponse(res, `Book Details`, result);
      } else {
        throw new Error("No Book found");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }

  /**GET BOOK LIST BY TOPIC NAME */
  async bookListByTopic(req, res) {
    try {
      const rules = Joi.object({
        topic_name: Joi.string().required(),
        user_id: Joi.string().required(),
      });

      const { error, value } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const { topic_name, user_id } = req.body;
      const result = await Book.findAll({ where: { topic_name: topic_name } });
      let appResponse = [];
      if (result) {
        await Promise.all(
          result.map(async (book, index) => {
            const liked = await Favorite.findOne({
              where: { book_id: book.id, user_id: user_id },
            });
            let likedStatus = liked == null ? "0" : liked.status;

            let response = {
              id: book.id,
              user_id: book.user_id,
              category_name: book.category_name,
              book_name: book.book_name,
              topic_name: book.topic_name,
              cover_photo: book.cover_photo,
              book_url: book.book_url,
              total_pages: book.total_pages,
              total_likes: book.total_likes,
              liked_by_you: likedStatus,
              createdAt: book.createdAt,
              updatedAt: book.updatedAt,
            };
            appResponse.push(response);
          })
        );
        dataResponse(res, `${appResponse.length} Books Found`, appResponse);
      } else {
        throw new Error("No Book found");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }

  /**FETCH TOPIC BY CATEGORY NAME */
  async getTopicList(req, res) {
    try {
      const rules = Joi.object({
        category_name: Joi.string().required(),
      });

      const { error, value } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const { category_name } = req.body;
      let topics = `SELECT id,topic_name,category_name,COUNT(*) FROM books WHERE category_name='${category_name}' GROUP BY topic_name`;

      let result = await sequelize.query(topics, {
        type: QueryTypes.SELECT,
      });

      const appResponse = [];
      const topicName = [];
      if (result) {
        await Promise.all(
          result.map(async (e) => {
            let coverPhotos = `SELECT cover_photo FROM books WHERE topic_name='${e.topic_name}' ORDER BY RAND() LIMIT 1`;
            let photos = await sequelize.query(coverPhotos, {
              type: QueryTypes.SELECT,
            });
            const data = {
              topic_id: e.id,
              topic_name: e.topic_name,
              category: e.category_name,
              cover_photo: photos[0].cover_photo,
            };
            appResponse.push(data);
          })
        );

        dataResponse(res, `${result.length} Topics Found`, appResponse);
      } else {
        throw new Error("No Topic list found related to this category");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }

  /**DELETE BOOK API */
  async removeBook(req, res) {
    try {
      const rules = Joi.object({
        book_id: Joi.string().required(),
      });

      const { error, value } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const { book_id } = req.body;
      const book = await Book.findOne({
        where: { id: book_id },
      });
      if (book == null) {
        throw new Error("No Book found");
      } else {
        let categoryName = book.category_name;

        await Book.destroy({
          where: { id: book_id },
        });
        await Favorite.destroy({
          where: { book_id: book_id },
        });
        let totalCategory = await Book.findAndCountAll({
          where: { category_name: categoryName },
        });

        if (totalCategory.count == 0) {
          await Category.destroy({
            where: { category_name: categoryName },
          });
        }
        success(res, "Book removed successfully");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }
  /**FETCH ALL BOOKS */
  async fetchAllBooks(req, res) {
    try {
      const rules = Joi.object({
        user_id: Joi.string().required(),
      });

      const { error, value } = rules.validate(req.body, {
        abortEarly: true,
        allowUnknown: true,
        stripUnknown: true,
      });

      if (error) {
        const message = error.message.replace(/['"]/g, "");
        throw new Error(capitalizeFirstLetter(message));
      }

      const { user_id } = req.body;
      const result = await Book.findAll({
        where: { user_id },
        order: [["id", "DESC"]],
      });

      if (result) {
        dataResponse(res, `${result.length} Books Found`, result);
      } else {
        throw new Error("No Book found");
      }
    } catch (err) {
      failure(res, err.message);
    }
  }
};
