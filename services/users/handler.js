'use strict';
const parser = require("body-parser-for-serverless");
module.exports.hello = async (event) => {
  const parsedBody = await parser(event);


  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: parsedBody,
        input: event,
      },
      null,
      2
    ),
  };
};
