"use strict";
/** Database setup for dynamoDB */
// const { getDatabaseUri } = require("./config");
import dotenv from 'dotenv'
dotenv.config();
// Create service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// require('dotenv').config()
// Set the AWS Region.
const REGION = "us-east-1";
// Create an Amazon DynamoDB service client object.

export const ddbClient = new DynamoDBClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// module.exports = {
//   aws_table_name: 'users',
//   aws_local_config: {
//     //Provide details for local configuration
//   },
//   aws_remote_config: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: 'us-west-2',
//   }
// };