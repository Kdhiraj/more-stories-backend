const { Sequelize, Model, DataTypes } = require("sequelize");
const { DB_DATABASE, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_CONNECTION } =
  process.env;

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_CONNECTION,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error.message);
  });

module.exports = { sequelize, Sequelize, Model, DataTypes };
