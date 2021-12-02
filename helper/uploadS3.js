"use strict";
require("dotenv").config();
const AWS = require("aws-sdk");
const fs = require("fs");
var {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_DEFAULT_REGION,
  AWS_BUCKET,
  AWS_URL,
} = process.env;

const s3 = new AWS.S3({
  AWS_DEFAULT_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
});

function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: AWS_BUCKET + "/books",
    Body: fileStream,
    Key: file.filename + "",
  };
  return s3.upload(uploadParams).promise();
}
module.exports = uploadFile;
