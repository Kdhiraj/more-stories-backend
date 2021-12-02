"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const path = require("path");
const app = express();
const apiRoute = require("./routes/api");

const { SERVER_PORT, SERVER_HOST } = process.env;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
//app.set('view engine', env('template_engine'));  // either pug,twig etc
app.set("view engine", "ejs");
// setup the logger

app.use("/api", apiRoute);
app.get("/privacy", function (req, res) {
  res.sendFile("views/privacy_.html", { root: __dirname });
});

app.get("/terms_and_conditions", function (req, res) {
  res.sendFile("views/terms&cond.html", { root: __dirname });
});
app.use(function (req, res, next) {
  res.end("404 Not found");
});
app.use(function (err, req, res, next) {
  if (err) {
    console.log(err);
  }
  next();
});
app.listen(SERVER_PORT, SERVER_HOST, (err) => {
  if (err) {
    console.log(err.message);
    return;
  }
  console.log(`Server running on host ${SERVER_HOST}:${SERVER_PORT}`);
});
