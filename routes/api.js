const express = require("express");
const multer = require("multer");
const Router = express.Router();
const BookController = require("../app/controllers/BookController");
const book = new BookController();

/**multer storage */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
let upload = multer({ storage: storage });
Router.get("/", (req, res) => {
  res.end("hello world");
});
Router.post("/upload_file", upload.single("file"), book.fileUpload);
Router.post("/save_device_id", book.updateDevice);
Router.post("/payment_status", book.updatePaymentStatus);
Router.post("/add_books", book.addBook);
Router.get("/category_list", book.fetchCategoryList);
Router.post("/add_or_remove_favorite", book.addOrRemoveFavorite);
Router.post("/favorite_books", book.fetchFavoriteBooks);
Router.post("/book_details", book.bookDetails);
Router.post("/book_lists_by_topic", book.bookListByTopic);
Router.post("/topic_list_by_category", book.getTopicList);
Router.post("/all_books", book.fetchAllBooks);
Router.post("/remove_book", book.removeBook);
Router.post("/user_details", book.fetchUserDetails);
Router.get("privacy", (req, res) => {
  res.render("privacy.ejs");
});

module.exports = Router;
