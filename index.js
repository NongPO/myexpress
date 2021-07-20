const express = require("express");
const line = require("@line/bot-sdk");

const config = {
  channelAccessToken:
    "K7Ue4/FSpRwSB01cx+RKyvM1xZzg/VHaf0nL+KapJ6rRecN0nT4Z0tQzq7UxIzIC0q5H3xcXeZi912aKYA1dH5RHTjz7UvMYdEw5FosnVvJfKcAbArtx2OCycyRsXL46eOsahQykNDvHrzfKHDsyNwdB04t89/1O/w1cDnyilFU=N",
  channelSecret: "4ccb4d00c21f846bea8824daab5a73ad",
};

//FIREBASE
const firebase = require("firebase");
require("firebase/firestore");
const firebaseConfig = {
  apiKey: "AIzaSyC6KJelijxdNlI4xmHPYx-AV08p_aYH6AU",
    authDomain: "lineoa-1a3ab.firebaseapp.com",
    projectId: "lineoa-1a3ab",
    storageBucket: "lineoa-1a3ab.appspot.com",
    messagingSenderId: "396653329324",
    appId: "1:396653329324:web:fdf868369311baa7689809",
    measurementId: "G-B32B2FBEQ6"
    
};

const admin = firebase.initializeApp(firebaseConfig);
const db = admin.firestore();
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
  let chat = await db.collection('chats').add(event);
  console.log('Added document with ID: ', chat.id);

  console.log(event.message.text);
  return client.replyMessage(event.replyToken, {
    type: "text",
    text: event.message.text + " ",
  });
}
app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.get('/test-firebase', async function (req, res) {
  let data = {
      name: 'Bangkok',
      country: 'Thailand'
  }
  const result = await db.collection('cities').add(data);
  console.log('Added document with ID: ', result.id);
  res.send('Test firebase successfully, check your firestore for a new record !!!')
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
