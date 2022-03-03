const aws = require("aws-sdk");
const region = "us-east-1";

function createDynamoDbClient(regionName) {
  aws.config.update({ region: regionName });
  return new aws.DynamoDB();
}
module.exports.getAll = async (tableName) => {
  try {
    const dynamoDbClient = createDynamoDbClient(region);
    let statment = { Statement: `select * from ${tableName}` };
    let output = await executeStatement(dynamoDbClient, statment);
    output = await bind(output.Items);
    return output;
  } catch (error) {
    return error;
  }
};
const bind = async (_) => {
  try {
    // for (let index = 0; index < _.length; index++) {
    //   const element = _[index];
    //   let seller = await this.getSeller(element.sellerID.S);
    //   element["seller"] = seller;
    // }
    return _;
  } catch (error) {
    return error;
  }
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
    Statement: `select * from sellers`,
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
  statment = {
    Statement: `select email from usersTable where id = '${id}'`,
  };
  let output2 = await executeStatement(dynamoDbClient, statment);
  var arr = [];
  output.Items.forEach((element) => {
    arr.push(aws.DynamoDB.Converter.unmarshall(element));
  });
  arr[0].email = aws.DynamoDB.Converter.unmarshall(output2.Items[0]).email;
  return arr;
};
module.exports.getAllForSeller = async (tableName, id) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = {
    Statement: `select * from ${tableName} where sellerID ='${id}'`,
  };
  let output = await executeStatement(dynamoDbClient, statment);
  output = await bind(output.Items);
  return output;
};
module.exports.getCategories = async (tableName) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = {
    Statement: `select category from ${tableName}`,
  };
  let output = await executeStatement(dynamoDbClient, statment);
  let arr = [];
  output.Items.forEach((element) => {
    arr.push(aws.DynamoDB.Converter.unmarshall(element));
  });
  const uniqueAddresses = Array.from(new Set(arr.map((a) => a.category))).map(
    (category) => {
      return arr.find((a) => a.category === category);
    }
  );

  return uniqueAddresses;
};
module.exports.deleteProduct = async (tableName, att1) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = {
    Statement: `DELETE FROM "${tableName}" where "id" = '${att1}'`,
  };
  let output = await executeStatement(dynamoDbClient, statment);
  return output;
};
module.exports.getAllByCategory = async (tableName, category) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = {
    Statement: `select * from ${tableName} where category ='${category}'`,
  };
  let output = await executeStatement(dynamoDbClient, statment);
  output = await bind(output.Items);
  return output;
};
async function executeStatement(dynamoDbClient, statment) {
  let executeStatementOutput = await dynamoDbClient
    .executeStatement(statment)
    .promise();
  return executeStatementOutput;
}
