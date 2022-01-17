const aws = require("aws-sdk");
const region = "us-east-1";

function createDynamoDbClient(regionName) {
  aws.config.update({ region: regionName });
  return new aws.DynamoDB();
}
module.exports.getAll = async (tableName) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = { Statement: `select * from ${tableName};` };
  let output = await executeStatement(dynamoDbClient, statment);
  output = await bind(output.Items);
  return output;
};
const bind = async (_) => {
  for (let index = 0; index < _.length; index++) {
    const element = _[index];
    let seller = await this.getSeller(element.sellerID.S);
    element["seller"] = seller;
  }
  return _;
};
module.exports.getByID = async (tableName, id) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = { Statement: `select * from ${tableName} where id ='${id}'` };
  let output = await executeStatement(dynamoDbClient, statment);
  let seller = await this.getSeller(output.Items[0].sellerID.S);
  output.Items[0]["seller"] = seller;
  return output;
};
module.exports.getAllSellers = async () => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = {
    Statement: `select * from usersTable where seller <> NULL;`,
  };
  let output = await executeStatement(dynamoDbClient, statment);
  var arr = [];
  output.Items.forEach((element) => {
    arr.push(aws.DynamoDB.Converter.unmarshall(element));
  });
  // return arr.sort(compare).sort(compareb).slice(0, 3);
  return arr;
};
module.exports.getSeller = async (id) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = {
    Statement: `select * from sellers where id = '${id}'`,
  };
  let output = await executeStatement(dynamoDbClient, statment);
  var arr = [];
  output.Items.forEach((element) => {
    arr.push(aws.DynamoDB.Converter.unmarshall(element));
  });
  return arr;
};

async function executeStatement(dynamoDbClient, statment) {
  let executeStatementOutput = await dynamoDbClient
    .executeStatement(statment)
    .promise();
  return executeStatementOutput;
}
