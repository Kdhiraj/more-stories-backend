let { sequelize, Sequelize, Model, DataTypes } = require("./Connection");

class Favorite extends Model {}
Favorite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    book_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM,
      values: ["1", "0"],
      defaultValue: "0",
    },
  },
  {
    sequelize,
    modelName: "favorites",
  }
);

sequelize.sync().then(() => {});

module.exports = Favorite;
