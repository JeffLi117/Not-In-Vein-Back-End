"use strict";
import express from 'express';
import { ddbDocClient } from "./dbclient.js";
import { PutCommand, QueryCommand, ScanCommand  } from "@aws-sdk/lib-dynamodb";
import { addUser } from './dbclient.js';
import { initializeApp, cert } from 'firebase-admin/app';
import cors from 'cors';
// const morgan = require('morgan');
const PORT  = 3001;

const firebaseApp = initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
});

const app = express();

app.use(cors());
app.use(express.json());
// ===========

// app.post('/', addUser);
app.post('/register', async (req, res)=>{
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
    } catch(e){
        console.log(e);
        res.status(404).send(e);
    }
});

app.get('/users/:id', async (req, res)=>{
  console.log(req.params.id)
  console.log(typeof req.params.id)
  try {
    let data = await ddbDocClient.send(new QueryCommand({TableName: "users",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues:{
      ":id": req.params.id
    }    
  }));
    console.log("success", data.Items);
    res.json(data.Items);
  } catch (err) {
    console.log("Error", err);
  }
})


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