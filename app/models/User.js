let { sequelize, Sequelize, Model, DataTypes } = require("./Connection");

class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    device_type: {
      type: DataTypes.ENUM,
      values: ["a", "i"],
      allowNull: true,
    },
    device_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM,
      values: ["0", "1"],
      defaultValue: "0",
    },
  },
  {
    sequelize,
    modelName: "users",
  }
);

sequelize.sync().then(() => {});

module.exports = User;
