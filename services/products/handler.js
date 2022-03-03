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
    } else {
      return Responses._400("something went wrong!");
    }
  } catch (error) {
    return Responses._400({ message: error });
  }
};
module.exports.getProductsForSeller = async (event) => {
  try {
    let data = await parser(event);
    let id = data.id;
    let op = await dynamo.getAllForSeller(tableName, id);
    if (op) {
      return Responses._200(op);
    }
    return Responses._400(`not found for ${id}`);
  } catch (error) {
    return Responses._400(error);
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
  item["TableName"] = tableName;
  item["Item"] = product;
  item["Item"].id = {
    S: uuid.v4(),
  };
  try {
    const op = await dynamoAction.put(item);
    if (!op) {
      return Responses._400({ message: `not added for ${email}` });
    }
    return Responses._200(item.Item);
  } catch (error) {
    return Responses._400(error);
  }
};
module.exports.updateProduct = async (event) => {
  let data = await parser(event);
  let id = data.id;
  let brand = data.brand;
  let category = data.category;
  let countInStock = data.countInStock;
  let description = data.description;
  let imageUrl = data.imageUrl;
  let name = data.name;
  let price = data.price;
  let updateInputItem = {
    TableName: "ProductsTable",
    Key: {
      id: {
        S: id,
      },
    },
    UpdateExpression:
      "SET #cd460 = :cd460, #cd461 = :cd461, #cd462 = :cd462, #cd463 = :cd463, #cd464 = :cd464, #cd465 = :cd465, #cd466 = :cd466",
    ExpressionAttributeValues: {
      ":cd460": {
        S: brand,
      },
      ":cd461": {
        S: category,
      },
      ":cd462": {
        N: countInStock,
      },
      ":cd463": {
        S: description,
      },
      ":cd464": {
        S: imageUrl,
      },
      ":cd465": {
        N: price,
      },
      ":cd466": {
        S: name,
      },
    },
    ExpressionAttributeNames: {
      "#cd460": "brand",
      "#cd461": "category",
      "#cd462": "countInStock",
      "#cd463": "description",
      "#cd464": "imageUrl",
      "#cd465": "price",
      "#cd466": "name",
    },
  };
  try {
    let op = await dynamoAction.updateItem(updateInputItem);

    if (op) {
      return Responses._200(updateInputItem);
    }
    return Responses._400(updateInputItem);
  } catch (error) {
    return Responses._400({ message: "error" });
  }
};
module.exports.deleteProduct = async (event) => {
  let data = await parser(event);
  let id = data.id;
  try {
    let op = await dynamo.deleteProduct(tableName, id);
    if (op) {
      return Responses._200(op);
    }
    return Responses._400(`not found for ${id}`);
  } catch (error) {
    return Responses._400(error);
  }
};
module.exports.getAllByCategory = async (event) => {
  try {
    let data = await parser(event);
    let category = data.category;
    let op = await dynamo.getAllByCategory(tableName, category);
    if (op) {
      return Responses._200(op);
    }
    return Responses._400(`not found for ${id}`);
  } catch (error) {
    return Responses._400(error);
  }
};
