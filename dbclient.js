
// const AWS = require('aws-sdk');
// const config = require('./dbconfig.js')
import { PutCommand } from "@aws-sdk/lib-dynamodb";

// AWS.config.update(config.aws_remote_config);

// const docClient = new AWS.DynamoDB.DocumentClient();

// const params = {
//     TableName: config.aws_table_name
// };

export const addUser = async function (req, res) {
    // console.log("config is ", config);
    console.log("req ", req);
    console.log("req.body ", req.body);
    const params = {
        TableName: "users",
        Item: {...req.body},
    };
    try {
      const data = await ddbDocClient.send(new PutCommand(params));
      console.log("Success - item added", data);
      res.status(200).send({message:"Success - item added", data});
    } catch(err){
      res.status(404).send(err)
  }
    // AWS.config.update(config.aws_remote_config);
    // const docClient = new AWS.DynamoDB.DocumentClient();
    // const Item = { ...req.body };
    // // Item.userid = 123;
    // var params = {
    //     TableName: config.aws_table_name,
    //     Item: Item
    // };

    // Call DynamoDB to add the item to the table
    // docClient.put(params, function (err, data) {
    // docClient.putItem(params, function (err, data) {
    //     if (err) {
    //         res.send({
    //             success: false,
    //             message: err
    //         });
    //     } else {
    //         res.send({
    //             success: true,
    //             message: 'Added user',
    //             userData: data
    //         });
    //     }
    // });
}

// module.exports = {
//     addUser
// }

// Create a service client module using ES6 syntax.
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ddbClient } from "./dbconfig.js";

const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

// Create the DynamoDB document client.
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions,
  unmarshallOptions,
});

export { ddbDocClient };