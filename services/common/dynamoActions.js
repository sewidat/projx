const AWS = require("aws-sdk");

module.exports.get = async function f(
  primaryKeyName,
  primaryKeyValue,
  tableName
) {
  const region = "us-east-1";
  const dynamoDbClient = createDynamoDbClient(region);
  const queryInput = createQueryInput(
    primaryKeyName,
    primaryKeyValue,
    tableName
  );
  var data;
  await executeQuery(dynamoDbClient, queryInput).then((value) => {
    data = value.Items;
  });
  return data;
};
module.exports.put = async function f(obj) {
  const region = "us-east-1";
  const dynamoDbClient = createDynamoDbClient(region);
  const putItemInput = obj;
  try {
    var data;
    await executePutItem(dynamoDbClient, putItemInput).then((value) => {
      data = value;
    });
    return data;
  } catch (error) {
    return error;
  }
};
module.exports.delete = async function f(params) {
  const region = "us-east-1";
  const dynamoDbClient = createDynamoDbClient(region);
  const deleteItemInput = params;
  const deleteItemOutput = await dynamoDbClient
    .deleteItem(deleteItemInput)
    .promise();
  return deleteItemOutput;
};
module.exports.scan = async (scanInput) => {
  const region = "us-east-1";
  const dynamoDbClient = createDynamoDbClient(region);
  try {
    const scanOutput = await dynamoDbClient.scan(scanInput).promise();
    return scanOutput;
  } catch (err) {
    return err;
  }
};
function createDynamoDbClient(regionName) {
  AWS.config.update({ region: regionName });
  return new AWS.DynamoDB();
}

function createQueryInput(primaryKeyName, primaryKeyValue, tableName) {
  return {
    TableName: tableName,
    ScanIndexForward: true,
    ConsistentRead: false,
    KeyConditionExpression: "#948b0 = :948b0",
    ExpressionAttributeValues: {
      ":948b0": {
        S: primaryKeyValue,
      },
    },
    ExpressionAttributeNames: {
      "#948b0": primaryKeyName,
    },
  };
}
async function executePutItem(dynamoDbClient, putItemInput) {
  try {
    const putItemOutput = await dynamoDbClient.putItem(putItemInput).promise();
    return putItemOutput;
  } catch (err) {
    return err;
  }
}

async function executeQuery(dynamoDbClient, queryInput) {
  try {
    const queryOutput = await dynamoDbClient.query(queryInput).promise();
    console.info("Query successful.");
    return queryOutput;
  } catch (err) {
    return err;
  }
}
module.exports.updateItem = async function updateItem(updateItemInput) {
  const region = "us-east-1";
  const dynamoDbClient = createDynamoDbClient(region);
  // Call DynamoDB's updateItem API
  try {
    const updateItemOutput = await dynamoDbClient
      .updateItem(updateItemInput)
      .promise();
    console.info("Successfully updated item.");
    return updateItemOutput;
  } catch (err) {
    return err;
  }
};
