"use strict";
// require('dotenv').config()
// import dotenv from 'dotenv'
// dotenv.config();
/* == dependencies == */
// const express = require('express');
import express from 'express';
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./dbclient.js";
// const { addUser } = require('./dbclient.js');
import { addUser } from './dbclient.js';
import cors from 'cors';
// const morgan = require('morgan');
const PORT  = 3001;

const app = express();

app.use(cors());
app.use(express.json());
// ===========

// app.post('/', addUser);
app.post('/register', async (req, res)=>{
    const params = {
        TableName: "users",
        Item: {...req.body}
      };
    try{
        const data = await ddbDocClient.send(new PutCommand(params));
        console.log("Success - item added", data);
        res.json(data)
    } catch(e){
        console.log(e);
        res.status(404).send(e);
    }
});

    // const params = {
    //     TableName: "Users",
    //     Item: {
    //       id: ,
    //       name: firebaseInfo.name,
    //       email: firebaseInfo.email,
    //       upcomingDonation: upcomingDate,
    //       latestDonation: latestDate,
    //       allDonations: firebaseInfo.allDonations
    //     },
    //   };
//     try {
//         // const data = await ddbDocClient.send(new PutCommand(params));
//         // console.log("Success - item added", data);
//         res.send('data sent');
//     } catch(err) {
//         console.log('error', err);
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