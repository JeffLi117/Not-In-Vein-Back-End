"use strict";
import express from 'express';
import { ddbDocClient } from "./dbclient.js";
import { PutCommand, QueryCommand, UpdateCommand, ScanCommand  } from "@aws-sdk/lib-dynamodb";
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { addUser } from './dbclient.js';
import { initializeApp, cert } from 'firebase-admin/app';
import { authenticateToken, userOnly } from './middleware.js';
import cors from 'cors';
import { isThisMinute } from 'date-fns';
// const morgan = require('morgan');
const PORT  = 3001;

const firebaseApp = initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

const app = express();

app.use(cors());
app.use(express.json());
// ==== middleware ====
app.use(authenticateToken);
// app.post('/', addUser);
app.post('/register', async (req, res)=>{
    // console.log(req.headers);
    console.log(req.body);
    const params = {
        TableName: "users",
        Item: {
          id: req.body.uid,
          email: req.body.email,
          name: req.body.displayName,
        }
    };
    // console.log(params.Item);
    try {
        const data = await ddbDocClient.send(new PutCommand(params));
        console.log("Success - item added", data);
        res.json(data)
    } catch(e) {
        console.log(e);
        res.status(404).send(e);
    }
});

app.get('/users/:id', userOnly, async (req, res)=>{
  
  try {
    let data = await ddbDocClient.send(new QueryCommand({TableName: "users",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues:{
        ":id": req.params.id
      }    
    }));
    if (data.Items.length === 0) {
      console.log("data.Items length is 0");
      res.send(null)
    } else {
      console.log("success", data.Items);
      res.json(data.Items);
    }
  } catch (err) {
    console.log("Error", err);
  }
})

// async function updateMultipleItems() {
//   const itemsToUpdate = [
//     { primaryKey: 'item1', updateExpression: 'SET attribute1 = :value1', expressionAttributeValues: { ':value1': 'new1' } },
//     { primaryKey: 'item2', updateExpression: 'SET attribute2 = :value2', expressionAttributeValues: { ':value2': 'new2' } },
//     // Add more items as needed
//   ];

//   const updateItemPromises = itemsToUpdate.map(async (item) => {
//     const command = new UpdateItemCommand({
//       TableName: 'YourTableName',
//       Key: {
//         PrimaryKeyAttribute: { S: item.primaryKey },
//       },
//       UpdateExpression: item.updateExpression,
//       ExpressionAttributeValues: item.expressionAttributeValues,
//     });

//     try {
//       const result = await dynamoDBClient.send(command);
//       console.log('UpdateItem succeeded:', result);
//     } catch (error) {
//       console.error('Unable to update item:', error);
//     }
//   });

//   await Promise.all(updateItemPromises);
// }

// updateMultipleItems();

app.post('/adddate/:id', userOnly, async (req, res) => {
  console.log(req.body);
  const upcomingdate = req.body.upcomingdate;
  const latestdonation = req.body?.latestdonation;

  if (!upcomingdate && !latestdonation) {
    return res.status(400).json({ error: 'No attributes to update' });
  }

  try {
    const command = new UpdateCommand({
      TableName: 'users',
      Key: {
        id: req.body.uid,
      },
      UpdateExpression: latestdonation ? 'set upcomingdonation = :upcomingDonation, latestdonation = :latestDonation' : 'set upcomingdonation = :upcomingDonation',
      ExpressionAttributeValues: latestdonation ? {
        ':upcomingDonation': upcomingdate,
        ':latestDonation': latestdonation,
      } : {':upcomingDonation': upcomingdate},
      ReturnValues: 'ALL_NEW',
    });

    const data = await ddbDocClient.send(command);
    console.log('UpdateItem succeeded:', data);
    res.json(data);
  } catch (error) {
    console.error('Unable to update item:', error);
    // res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.post('/adddate/:id', userOnly, async (req, res) => {
//   console.log(req.body);
//   const upcomingdate = req.body.upcomingdate;
//   const latestdonation = req.body?.latestdonation;
//   let itemsToUpdate;

//   if (upcomingdate && latestdonation) {
//     itemsToUpdate = [
//       { Key: req.body.uid, updateExpression: 'set upcomingdonation = :upcomingDonation', expressionAttributeValues: { ':upcomingDonation': upcomingdate } },
//       { Key: req.body.uid, updateExpression: 'set latestdonation = :latestDonation', expressionAttributeValues: { ':latestDonation': latestdonation } },
//       // Add more items as needed
//     ];
//     // console.log("itmesToUpdate is ", itemsToUpdate);
//   }

//     // console.log(params.Item);
//     try {
//         let data;
//         if (itemsToUpdate) {
//           itemsToUpdate.map(async (item) => {
//             const command = new UpdateCommand({
//               TableName: 'users',
//               Key: {
//                 id: item.Key,
//               },
//               UpdateExpression: item.updateExpression,
//               ExpressionAttributeValues: item.expressionAttributeValues,
//               ReturnValues: "ALL_NEW",    
//             });
        
//             try {
//               data = await ddbDocClient.send(command);
//               console.log('UpdateItem succeeded:', data);
//             } catch (error) {
//               console.error('Unable to update item:', error);
//             }
//           });
//         } else {
//           // upcomingdate & latestdonation are both type string
//           data = await ddbDocClient.send(new UpdateCommand({TableName: "users",
//             Key: { id: req.body.uid },
//             UpdateExpression: "set upcomingdonation = :upcomingDonation",
//             ExpressionAttributeValues:{
//               ":upcomingDonation": upcomingdate,
//             },
//             ReturnValues: "ALL_NEW",    
//           }));
//         }
//         console.log("Success - date added ", data);
//         res.json(data)
//     } catch(e) {
//         console.log(e);
//         res.status(404).send(e);
//     }
// })


/** == Handle 404 errors == */
// app.use(function (req, res, next) {
//     return next(new NotFoundError());
//   });

/** == Generic error handler; anything unhandled goes here. == */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== 'test') console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
  
    return res.status(status).json({
      error: { message, status },
    });
  });

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});

// export app;