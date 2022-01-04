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
        message: "hello",
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
  let { email, name, password, isSeller, isAdmin, seller } = parserBody;
  let username = genUsername.generateFromEmail(email, 4);
  if (isSeller === undefined && isAdmin === undefined) {
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
    return Responses._200(params.Item);
  } catch (error) {
    return Responses._400(error);
  }
  return Responses._200({ message: email });
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
module.exports.editUser = async (event) => {
  let email = event.queryStringParameters.email;
  let name = event.queryStringParameters.name;
  let newPassword = event.queryStringParameters.newPassword;
  let scanParams = makeScanParams("email", email);
  let currentData = await dynamoAction.scan(tableName, scanParams);

  currentData = currentData.Items[0];
  let params = createUpdateItemInput(
    currentData.email.S,
    currentData.name.S,
    newPassword
  );
  try {
    let data = await dynamoAction.updateItem(params);
    return Responses._200(data);
  } catch (error) {
    return Responses._400(error);
  }
};
module.exports.editUserx = async (event) => {
  const parserBody = await parser(event);
  return Responses._200(event);
};
module.exports.scanByID = async (event) => {
  let parserBody = await parser(event);
  let id = parserBody.id;
  let params = makeIdscanInput("id", id);
  // return Responses._200(params);
  try {
    let op = await dynamoAction.scan(params);
    if (op) {
      return Responses._200(op.Items[0]);
    }
    return Responses._400({ message: "something went wrong!" });
  } catch (error) {
    return Responses._400(error);
  }
};
function makeScanParams(valueName, value) {
  return {
    TableName: tableName,
    ConsistentRead: false,
    FilterExpression: "#a88b0 = :a88b0",
    ExpressionAttributeValues: {
      ":a88b0": {
        S: value,
      },
    },
    ExpressionAttributeNames: {
      "#a88b0": valueName,
    },
  };
}
function createUpdateItemInput(email, name, newPass) {
  return {
    TableName: tableName,
    Key: {
      email: {
        S: email,
      },
      name: {
        S: name,
      },
    },
    UpdateExpression: "SET #51410 = :51410",
    ExpressionAttributeValues: {
      ":51410": {
        S: newPass,
      },
    },
    ExpressionAttributeNames: {
      "#51410": "password",
    },
  };
}
function makeIdscanInput(valueName, value) {
  return {
    TableName: tableName,
    ConsistentRead: false,
    FilterExpression: "#87ea0 = :87ea0",
    ExpressionAttributeValues: {
      ":87ea0": {
        S: value,
      },
    },
    ExpressionAttributeNames: {
      "#87ea0": valueName,
    },
  };
}
