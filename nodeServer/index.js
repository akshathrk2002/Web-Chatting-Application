require("dotenv").config();
const mongoose = require("mongoose");
const msgSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  select: {
    type: String,
    required: true,
  },
});
// const { MongoClient } = require('mongodb');
// const Msg = require("../models/chatModel");
// Node Server which will handle socket connections.
const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
  },
});
const MONGO_URI = process.env.URI;
console.log(MONGO_URI)
// const { name } = require('ejs');
async function run() {
  await mongoose
    .connect(MONGO_URI)
    .then(() => console.log("Successful DB connection"))
    .catch((err) => console.error("DB connection failed"));

  mongoose.model("msg", msgSchema);
  // const { Msg } = require("../models/chatModel.js");
  const users = {};
  // const client = new MongoClient(uri);

  io.on("connection", (socket) => {
    socket.on("new-user-joined", async (name) => {
      console.log("New user: ", name);
      users[socket.id] = name;
      socket.broadcast.emit("user-joined", name);
    });
    // socket.on('send',message=>{
    //     console.log(users[socket.id],":",message);
    //      socket.broadcast.emit('receive',{message:message, name:users[socket.id]})

    socket.on("send", (message) => {
      //  createListing(client,
      //     {
      //         message: message,
      //         name:users[socket.id],
      //         select:"update"
      //     }
      // );
      // updateListingBySelect(client,"update", {message:message,name:users[socket.id]});
      updateListingBySelect("update", {
        message: message,
        name: users[socket.id],
        lastUpdatedAt: new Date(),
      });
      socket.broadcast.emit("receive", {
        message: message,
        name: users[socket.id],
      });
    });

    socket.on("disconnect", (message) => {
      socket.broadcast.emit("left", users[socket.id]);
      delete users[socket.id];
    });
  });
  //console.log(users[socket.id]);
  // async function createListing(client, newListing){
  //     // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne for the insertOne() docs
  //     const result = await client.db("chat").collection("msg").insertOne(newListing);
  //     console.log(`New listing created with the following id: ${result.insertedId}`);
  // }
  // async function updateListingBySelect(client, selectName, updatedListing) {
  //     // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#updateOne for the updateOne() docs
  //     const result = await client.db("chat").collection("msg").updateOne({ select: selectName }, { $set: updatedListing });
  //     //console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  //     console.log(`${result.modifiedCount} document(s) was/were updated.`);
  // }

  const createListing = async (newListing) => {
    const result = await mongoose.model("msg").insertOne(newListing);
    console.log(
      `New listing created with the following id: ${result.insertedId}`
    );
  };

  const updateListingBySelect = async (selectName, updatedListing) => {
    const result = await mongoose
      .model("msg")
      .updateOne({ select: selectName }, { $set: updatedListing });
    // console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
  };
}
run();
