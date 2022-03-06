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
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};
module.exports.deleteOrder = async (event) => {
  let data = await parser(event);
  let id = data.id;
  try {
    let op = await dynamoAction.delete({
      TableName: "orders",
      Key: {
        id: {
          S: id,
        },
      },
    });
  } catch (error) {}
};

module.exports.updateOrder = async (event) => {
  let order = await parser(event);
  order = qs.parse(order);
  order = aws.DynamoDB.Converter.marshall(order);
  let item = {};
  item["TableName"] = tableName;
  item["Item"] = order;
  item["Item"].itemsPrice = {
    N: `${order.itemsPrice.S}`,
  };
  item["Item"].shippingPrice = {
    N: `${order.shippingPrice.S}`,
  };
  item["Item"].taxPrice = {
    N: `${order.taxPrice.S}`,
  };
  item["Item"].totalPrice = {
    N: `${order.totalPrice.S}`,
  };
  item["Item"].paidAt = {
    N: `${order.paidAt.S}`,
  };
  item["Item"].deliveredAt = {
    N: "0",
  };
  item["Item"].createdAt = {
    N: `${order.createdAt.S}`,
  };
  try {
    let id = item["Item"].id.S;
    const op = await dynamoAction.put(item);
    if (!op) {
      return Responses._400({ message: `not added for ${id}` });
    }
    const op2 = await dynamoAction.get("id", id, tableName);
    if (!op2) {
      return Responses._400({ message: `not added for ${id}` });
    }
    return Responses._200(op2);
  } catch (error) {
    return Responses._400(error);
  }
};

module.exports.ordersForSeller = async (event) => {
  let data = await parser(event);
  let id = data.id;
  try {
    let op = await dynamoAction.scan({
      TableName: "orders",
      ConsistentRead: false,
    });
    var arr = [];
    op.Items.forEach((element) => {
      element = aws.DynamoDB.Converter.unmarshall(element);
      if (element.seller.id === id) {
        arr.push(element);
      }
    });
    return Responses._200(arr);
  } catch (error) {}
};
module.exports.getOrdersForCurrentUser = async (event) => {
  let data = await parser(event);
  let id = data.id;
  let itemInput = {
    TableName: "orders",
    ConsistentRead: false,
    FilterExpression: "#12de0 = :12de0",
    ExpressionAttributeValues: {
      ":12de0": {
        S: `${id}`,
      },
    },
    ExpressionAttributeNames: {
      "#12de0": "user",
    },
  };
  try {
    let op = await dynamoAction.scan(itemInput);
    if (!op) {
      return Responses._400({ message: "something went wrong" });
    }
    return Responses._200(op);
  } catch (error) {
    return Responses._400({ message: "something went wrong" });
  }
};
module.exports.getOrder = async (event) => {
  let data = await parser(event);
  let id = data.id;
  const op = await dynamoAction.get("id", id, tableName);
  return Responses._200(op);
};
module.exports.postOrder = async (event) => {
  let order = await parser(event);
  order = qs.parse(order);
  order = aws.DynamoDB.Converter.marshall(order);
  let item = {};
  item["TableName"] = tableName;
  item["Item"] = order;
  item["Item"].id = {
    S: uuid.v4(),
  };
  item["Item"].itemsPrice = {
    N: `${order.itemsPrice.S}`,
  };
  item["Item"].shippingPrice = {
    N: `${order.shippingPrice.S}`,
  };
  item["Item"].taxPrice = {
    N: `${order.taxPrice.S}`,
  };
  item["Item"].totalPrice = {
    N: `${order.totalPrice.S}`,
  };
  item["Item"].isPaid = {
    BOOL: false,
  };
  item["Item"].paidAt = {
    N: "0",
  };
  item["Item"].isDelivered = {
    BOOL: false,
  };
  item["Item"].deliveredAt = {
    N: "0",
  };
  item["Item"].createdAt = {
    N: `${Date.now()}`,
  };
  try {
    let id = item["Item"].id.S;
    const op = await dynamoAction.put(item);
    if (!op) {
      return Responses._400({ message: `not added for ${id}` });
    }
    const op2 = await dynamoAction.get("id", id, tableName);
    order = aws.DynamoDB.Converter.unmarshall(order);
    for (let index = 0; index < order.orderItems.length; index++) {
      await dynamoAction.updateItem({
        TableName: "ProductsTable",
        Key: {
          id: { S: order.orderItems[index].product },
        },
        UpdateExpression: "SET #42a90 = #42a90 - :42a90",
        ExpressionAttributeNames: { "#42a90": "countInStock" },
        ExpressionAttributeValues: {
          ":42a90": { N: `${order.orderItems[index].qty}` },
        },
      });
    }
    if (!op2) {
      return Responses._400({ message: `not added for ${id}` });
    }
    return Responses._200(op2);
  } catch (error) {
    return Responses._400(error);
  }
};
