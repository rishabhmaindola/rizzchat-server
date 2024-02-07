const http = require("http");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

let connectedUsernames = [];

const io = new Server(server, {
  cors: {
    origin: `https://rizzchat.vercel.app`,
    methods: ["GET", "POST"],
  },
});
app.get("/", (req, res) => {
  res.send("SERVER IS LIVE");
});

const port = process.env.port || 5000;

server.listen(port, () => {
  console.log(`Server is started on port ${port}`);
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("send-message", (message) => {
    io.emit("received-message", message);
    console.log(message);
  });

  socket.on("hasJoined", (username) => {
    io.emit("received-message", {
      user: "Admin",
      message: `${username} has joined the chat`,
      time:
      new Date(Date.now()).getHours() +
      ":" +
      new Date(Date.now()).getMinutes(),
    });
    console.log(`${username} has joined the chat`);
    connectedUsernames.push(username);
    io.emit("userList", connectedUsernames);
    console.log(connectedUsernames);
  });

  socket.on("hasLeft", (username) => {
    io.emit("received-message", {
      user: "Admin",
      message: `${username} has left the chat`,
      time:
      new Date(Date.now()).getHours() +
      ":" +
      new Date(Date.now()).getMinutes(),
    });
    console.log(`${username} has left the chat`);
    connectedUsernames = connectedUsernames.filter((user) => user !== username);
    io.emit("userList", connectedUsernames);
    console.log(connectedUsernames);
  });


  socket.on("disconnect", () => {
    console.log(`${socket.id} user disconnected!`)
  });
});
