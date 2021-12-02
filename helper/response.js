const success = (response, message) => {
  response.status(200).json({
    status: true,
    message: message,
  });
};
const failure = (response, message) => {
  response.status(400).json({
    status: false,
    message: message,
  });
};
const dataResponse = (response, message, data) => {
  response.status(200).json({
    status: true,
    message: message,
    data: data,
  });
};

module.exports = { success, failure, dataResponse };
