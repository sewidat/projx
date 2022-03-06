const AWS = require("aws-sdk");
const region = "us-east-1";

function createDynamoDbClient(regionName) {
  AWS.config.update({ region: regionName });
  return new AWS.DynamoDB();
}
async function executeStatement(dynamoDbClient, statment) {
  let executeStatementOutput = await dynamoDbClient
    .executeStatement(statment)
    .promise();
  return executeStatementOutput;
}
