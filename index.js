const express = require("express");
const line = require("@line/bot-sdk");

const dotenv = require("dotenv");
dotenv.config();

const config = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret,
};

//FIREBASE
const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId,
};

const admin = firebase.initializeApp(firebaseConfig);
const db = admin.firestore();
const fetch = require('node-fetch');
const app = express();
const port = 3000;
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }
  // SAVE TO FIREBASE
  let chat = await db.collection("chats").add(event);
  console.log("Added document with ID: ", chat.id);

  console.log(event.message.text);
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: event.message.text + " ",
  });
}
app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.get("/test-firebase", async function (req, res) {
  let data = {
    name: "Bangkok",
    country: "Thailand",
  };
  const result = await db.collection("cities").add(data);
  console.log("Added document with ID: ", result.id);
  res.send(
    "Test firebase successfully, check your firestore for a new record !!!"
  );
});

app.get('/vaccine/fetch', async (req, res) => {
  //FETCH
  let response = await fetch('https://covid19-cdn.workpointnews.com/api/vaccine.json');
  let data = await response.json();
  console.log(data);
  //SAVE TO FIRESTORE
  let current_date = (new Date()).toISOString().split("T")[0];
  await db.collection('vaccines').doc(current_date).set(data);
  //SEND TO BROWSER AS HTML OR TEXT
  let text = JSON.stringify(data);
  res.send(text)
});


app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

