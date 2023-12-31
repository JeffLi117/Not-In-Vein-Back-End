"use strict";
import express from 'express';
import { ddbDocClient } from "./dbclient.js";
import { PutCommand, QueryCommand, UpdateCommand, ScanCommand  } from "@aws-sdk/lib-dynamodb";
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

/* == Register a new user =====
   receives - id, email, name
   returns no info
   create new user.
*/
app.post('/register', async (req, res)=>{
    // console.log(req.headers);
    console.log(req.body);
    const params = {
        TableName: "users",
        Item: {
          id: req.body.uid,
          email: req.body.email,
          name: req.body.displayName,
          allDonations: [],
          latestDonation: null,
          upcomingDonation: null,
        },
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

/* == get user info =====
   params: id 
   returns {id, email, name, latestDonation*, upcomingDonation* (*if exists)}
   search user by id and returns user's information 
*/
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

/* == add donation dates =====
   params: id (should match with current user's id)
   receive: upcomingDonation and/or latestDonation
   returns {id, email, name, latestDonation*, upcomingDonation* (*if exists)} 
   accept upcomingDonation and/or latestDonation to add those info to DB.
*/
app.post('/adddonation/:id', userOnly, async (req, res) => {
  console.log(req.body);
  const upcomingDonation = req.body.upcomingDonation;
  const latestDonation = req.body?.latestDonation;

  if (!upcomingDonation && !latestDonation) {
    return res.status(400).json({ error: 'No attributes to update' });
  }

  try {
    const command = new UpdateCommand({
      TableName: 'users',
      Key: {
        id: req.body.uid,
      },
      UpdateExpression: latestDonation ? 'set upcomingDonation = :upcomingDonation, latestDonation = :latestDonation' : 'set upcomingDonation = :upcomingDonation',
      ExpressionAttributeValues: latestDonation ? {
        ':upcomingDonation': upcomingDonation,
        ':latestDonation': latestDonation,
      } : {':upcomingDonation': upcomingDonation},
      ReturnValues: 'ALL_NEW',
    });

    const data = await ddbDocClient.send(command);
    console.log('UpdateItem succeeded:', data);
    res.json(data.Attributes);
  } catch (error) {
    console.error('Unable to update item:', error);
    // res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* == update upcoming donation dates =====
   params: id (should match with current user's id)
   receive: upcomingDonation
   returns {id, email, name, latestDonation*, upcomingDonation* (*if exists)} 
   add upcomingDonation to DB.
*/
app.patch('/updatedonation/:id', userOnly, async (req, res) => {
  console.log(req.body);
  const upcomingDonation = req.body.upcomingDonation;

  if (!upcomingDonation) {
    return res.status(400).json({ error: 'No attributes to update' });
  }

  try {
    const command = new UpdateCommand({
      TableName: 'users',
      Key: {
        id: req.params.id,
      },
      UpdateExpression: 'set upcomingDonation = :upcomingDonation',
      ExpressionAttributeValues: {':upcomingDonation': upcomingDonation},
      ReturnValues: 'ALL_NEW',
    });

    const data = await ddbDocClient.send(command);
    console.log('UpdateItem succeeded:', data);
    res.json(data.Attributes);
  } catch (error) {
    console.error('Unable to update item:', error);
    // res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* == update email notification settings =====
   params: id (should match with current user's id)
   receive: upcomingDonation
   returns {id, email, name, latestDonation*, upcomingDonation* (*if exists)} 
   add upcomingDonation to DB.
*/
app.patch('/updateemailsettings/:id', userOnly, async (req, res) => {
  console.log("updateemailsettings hit, received ", req.body);

  const emailSettings = req.body.emailSettings;

  if (!emailSettings) {
    return res.status(400).json({ error: 'No email setting to update' });
  }

  try {
    const command = new UpdateCommand({
      TableName: 'users',
      Key: {
        id: req.params.id,
      },
      UpdateExpression: 'set emailSettings = :emailSettings',
      ExpressionAttributeValues: {':emailSettings': emailSettings},
      ReturnValues: 'ALL_NEW',
    });

    const data = await ddbDocClient.send(command);
    console.log('UpdateItem succeeded:', data);
    res.json(data.Attributes);
  } catch (error) {
    console.error('Unable to update item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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


