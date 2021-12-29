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
  //create put item input will be implemented in the calling method
  const putItemInput = obj;

  var data;
  await executePutItem(dynamoDbClient, putItemInput).then((value) => {
    data = value;
  });
  return data;
};
module.exports.delete = async function f(tableName, params) {
  const region = "us-east-1";
  const dynamoDbClient = createDynamoDbClient(region);
  const deleteItemInput = params;
  const deleteItemOutput = await dynamoDbClient
    .deleteItem(deleteItemInput)
    .promise();
  return deleteItemOutput;
};
module.exports.scan = async function f(tableName, scanInput) {
  const region = "us-east-1";
  const dynamoDbClient = createDynamoDbClient(region);
  var data;
  await executeScan(dynamoDbClient, scanInput).then((value) => {
    data = value;
  });
  return data;
};
async function executeScan(dynamoDbClient, scanInput) {
  try {
    const scanOutput = await dynamoDbClient.scan(scanInput).promise();
    return scanOutput;
  } catch (err) {
    return err;
  }
}
function createDynamoDbClient(regionName) {
  AWS.config.update({ region: regionName });
  return new AWS.DynamoDB();
}
function createPutItemInput(
  primaryKeyName,
  primaryKeyValue,
  sortKeyName,
  sortKeyValue,
  tableName
) {
  const obj = {};
  obj["TableName"] = tableName;
  const item = {};
  item[primaryKeyName] = { S: primaryKeyValue };
  item[sortKeyName] = { N: sortKeyValue };
  obj["Item"] = item;
  return obj;
}
function createDeleteItemInput(
  primaryKeyName,
  primaryKeyValue,
  sortKeyName,
  sortKeyValue,
  tableName
) {
  const obj = {};
  obj["TableName"] = tableName;
  const key = {};
  key[primaryKeyName] = { S: primaryKeyValue };
  key[sortKeyName] = { N: sortKeyValue };
  obj["Key"] = key;
  return obj;
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
async function executeDeleteItem(dynamoDbClient, deleteItemInput) {
  // Call DynamoDB's deleteItem API
  try {
    const deleteItemOutput = await dynamoDbClient
      .deleteItem(deleteItemInput)
      .promise();
    return deleteItemOutput;
    console.info("Successfully deleted item.");
    // Handle deleteItemOutput
  } catch (err) {}
}
