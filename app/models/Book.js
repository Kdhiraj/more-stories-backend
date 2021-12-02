let { sequelize, Sequelize, Model, DataTypes } = require("./Connection");

class Book extends Model {}
Book.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    book_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    topic_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cover_photo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    book_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    total_pages: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    total_likes: {
      type: DataTypes.BIGINT,

      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "books",
  }
);

sequelize.sync().then(() => {});

module.exports = Book;
