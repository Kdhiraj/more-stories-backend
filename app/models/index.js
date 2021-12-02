"use strict";

const { sequelize, Sequelize, Model, DataTypes } = require("./Connection");
const User = require("./User");
const Book = require("./Book");
const Category = require("./Category");
const Favorite = require("./Favorite");

// Connect all the models/tables in the database to a models object, so everything is accessible via one object
const models = {};
models.Sequelize = Sequelize;
models.sequelize = sequelize;
models.User = User;
models.Book = Book;
models.Category = Category;
models.Favorite = Favorite;

//Relations

module.exports = models;
