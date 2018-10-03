const utils = require("./utils");
const validator = require('validator');
const qs = require('qs');

const isJsonHeader = (headers) => {
  return (headers && headers['Content-Type'] && headers['Content-Type'] === 'application/json');
}
const isJsonBody = (body) => {
  return !utils.isNull(body) && validator.isJSON(body)  
}

const parseData = (event) => {
  let param = {};
  
  if (isJsonHeader(event.headers) && isJsonBody(event.body)) {
    JSON.parse(event.body);
  }
  
  if(event.body !== null && event.body !== undefined) {
    param = (validator.isJSON(event.body)) ? JSON.parse(event.body) : qs.parse(event.body);
  }
  return param;
}

module.exports = {
  parseData,
  isJsonHeader,
  isJsonBody,
};
