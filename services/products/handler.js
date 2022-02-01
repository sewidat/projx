const Responses = require("./common/apiRes");
const dynamo = require("./common/dynamoP");
const dynamoAction = require("./common/dynamoActions");
const uuid = require("uuid");
const qs = require("qs");
const genUsername = require("unique-username-generator");
const parser = require("body-parser-for-serverless");
const aws = require("aws-sdk");
const bodyParser = require("body-parser-for-serverless");
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
module.exports.getCategories = async (event) => {
  try {
    let op = await dynamo.getCategories(tableName);
    if (op) {
      return Responses._200(op);
    } else {
      return Responses._400({ message: "something went wrong" });
    }
  } catch (error) {
    return Responses._400({ massage: error });
  }
};
module.exports.addProduct = async (event) => {
  let product = await parser(event);
  product = qs.parse(product);
  product = aws.DynamoDB.Converter.marshall(product);
  let item = {};
  try {
    item["TableName"] = tableName;
    item["Item"] = product;
    let op = await dynamoAction.put(item);
    if (op) return Response._200(op);
  } catch (error) {
    return Responses._400({ message: item });
  }
};
