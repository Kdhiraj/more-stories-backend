let { sequelize, Sequelize, Model, DataTypes } = require("./Connection");

class Category extends Model {}
Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    category_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "categories",
  }
);

sequelize.sync().then(() => {});

module.exports = Category;
