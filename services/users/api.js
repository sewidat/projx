const Responses = require("./common/apiRes");
const dynamoAction = require("./common/dynamoActions");
const uuid = require("uuid");
const genUsername = require("unique-username-generator");
const parser = require("body-parser-for-serverless");

let tableName = process.env.tableName;
module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: event,
        input: event,
      },
      null,
      2
    ),
  };
};
module.exports.getUser = async (event) => {
  if (!event.queryStringParameters || !event.queryStringParameters.email) {
    // failed without an ID
    return Responses._400({ message: "missing the email" });
  }
  let primaryKeyValue = event.queryStringParameters.email;
  const primaryKeyName = "email";
  const object = await dynamoAction.get(
    primaryKeyName,
    primaryKeyValue,
    tableName
  );
  if (!object) {
    return Responses._400({ message: "nothing" });
  }

  return Responses._200(object);
};
module.exports.putUser = async (event) => {
  const parserBody = await parser(event);
  let { email, name, password, isAdmin, isSeller, seller } = parserBody;
  let username = genUsername.generateFromEmail(email, 4);
  if (isSeller === "false" && isAdmin === "false") {
    isSeller = false;
    isAdmin = false;
    seller = null;
  }
  const params = {
    TableName: tableName,
    Item: {
      id: {
        S: uuid.v4(),
      },
      email: {
        S: email,
      },
      name: {
        S: name,
      },
      username: {
        S: username,
      },
      password: {
        S: password,
      },
      isSeller: {
        BOOL: isSeller,
      },
      isAdmin: {
        BOOL: isAdmin,
      },
      seller: {
        NULL: true,
      },
    },
  };
  try {
    const op = await dynamoAction.put(params);
    if (!op) {
      return Responses._400({ message: `not added for ${email}` });
    }
    return Responses._200(op.statusCode);
  } catch (error) {
    return Responses._400(error);
  }
};
module.exports.rmUser = async (event) => {
  try {
    const scanParams = {
      TableName: tableName,
      ConsistentRead: false,
      FilterExpression: "#a88b0 = :a88b0",
      ExpressionAttributeValues: {
        ":a88b0": {
          S: event.queryStringParameters.email,
        },
      },
      ExpressionAttributeNames: {
        "#a88b0": "email",
      },
    };
    let op = await dynamoAction.scan(tableName, scanParams);
    op = op.Items[0];
    if (op) {
      const primaryKeyValue = op.email.S;
      const sortKeyValue = op.name.S;
      const deleteParams = {
        TableName: tableName,
        Key: {
          email: {
            S: primaryKeyValue,
          },
          name: {
            S: sortKeyValue,
          },
        },
      };
      try {
        const data = await dynamoAction.delete(tableName, deleteParams);
        return Responses._200(deleteParams);
      } catch (error) {
        return Responses_400(error);
      }
    } else {
      return Responses._400({ message: "connot find element" });
    }
  } catch (error) {
    return Responses._400(error);
  }
};
