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
    output = bind(output.Items).then((data) => {
      return data;
    });
    return output;
  } catch (error) {
    return error;
  }
};
const bind = async (_) => {
  for (let index = 0; index < _.length; index++) {
    const element = _[index];
    let seller = await this.getSeller(element.sellerID.S).then((data) => {
      return data;
    });
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
  let reviews = await this.getByIDR("reviews", id);
  output.Items[0]["reviews"] = reviews;
  return output;
};
module.exports.getByIDR = async (tableName, id) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = {
    Statement: `select * from ${tableName} where product_id ='${id}'`,
  };
  let output = await executeStatement(dynamoDbClient, statment);
  return output.Items;
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
module.exports.incrementReviews = async (id) => {
  const dynamoDbClient = createDynamoDbClient(region);
  const itemInput = {
    TableName: "ProductsTable",
    Key: {
      id: {
        S: id,
      },
    },
    UpdateExpression: "SET #1c0f0 = #1c0f0 + :1c0f0",
    ExpressionAttributeValues: {
      ":1c0f0": {
        N: "1",
      },
    },
    ExpressionAttributeNames: {
      "#1c0f0": "numReviews",
    },
  };

  try {
    const updateItemOutput = await dynamoDbClient
      .updateItem(itemInput)
      .promise();
    let data = await this.getRatings(id).then((data) => {
      return data;
    });
    data = await this.setRating(id, data);
    return data;
  } catch (err) {
    return err;
  }
};
module.exports.setRating = async (id, rating) => {
  const dynamoDbClient = createDynamoDbClient(region);
  const itemInput = {
    TableName: "ProductsTable",
    Key: {
      id: {
        S: id,
      },
    },
    UpdateExpression: "SET #05f60 = :05f60",
    ExpressionAttributeValues: {
      ":05f60": {
        N: `${rating}`,
      },
    },
    ExpressionAttributeNames: {
      "#05f60": "rating",
    },
  };

  try {
    const updateItemOutput = await dynamoDbClient
      .updateItem(itemInput)
      .promise();
    return itemInput;
  } catch (err) {
    return err;
  }
};
module.exports.getRatings = async (id) => {
  const dynamoDbClient = createDynamoDbClient(region);
  let statment = {
    Statement: `select rating from reviews where product_id ='${id}'`,
  };
  let output = await executeStatement(dynamoDbClient, statment);
  var arr = [];
  output.Items.forEach((element) => {
    arr.push(aws.DynamoDB.Converter.unmarshall(element));
  });
  var rating = 0;
  var counter = output.Items.length;
  arr.forEach((element) => {
    rating += element.rating;
  });

  return rating / counter;
};
async function executeStatement(dynamoDbClient, statment) {
  let executeStatementOutput = await dynamoDbClient
    .executeStatement(statment)
    .promise();
  return executeStatementOutput;
}
