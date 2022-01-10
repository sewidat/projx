const Responses = require("./common/apiRes");
const dynamo = require("./common/dynamoP");
const uuid = require("uuid");
const genUsername = require("unique-username-generator");
const parser = require("body-parser-for-serverless");
const aws = require("aws-sdk");
let tableName = process.env.tableName;
module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v2.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};
module.exports.getAllProducts = async (event) => {
  try {
    let op = await dynamo.getAll(tableName);
    if (op) {
      return Responses._200(op);
    }
    return Responses._400("something went wrong!");
  } catch (error) {
    return Responses._400({ message: error });
  }
};
module.exports.getByID = async (event) => {
  try {
    let data = await parser(event);
    let id = data.id;
    let op = await dynamo.getByID(tableName, id);
    if (op) {
      return Responses._200(op);
    }
    return Responses._400(`not found for ${id}`);
  } catch (error) {
    return Responses._400(error);
  }
};
