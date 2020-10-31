// dotenv configuration
require("dotenv").config({ path: "./config/config.env" });
// express setup
const express = require("express");
const app = express();
// npm packages
const chalk = require("chalk");

const ejs = require("ejs");
const bodyParser = require("body-parser");
const socketio = require("socket.io");

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// Template engine setup
app.set("view engine", "html");
app.engine("html", ejs.renderFile);
// Public folder setup
app.use(express.static(__dirname + "/public"));

// app.use middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// Home routes setup
app.get("/", (req, res) => {
  res.render("index");
});
// post data from submit form
app.post("/", (req, res) => {
  res.send(req.body);
  console.log(req.body);
  const { number, text } = req.body;
  client.messages
    .create({
      body: text,
      from: "+12563986239",
      to: `+91${number}`
    })
    .then((message) => console.log(message.sid))
    .done();
  // Get data from response
  const data = {
    number: `+91${number}`,
    error
  };
  // Emit to the client
  io.emit("smsStatus", data);
});

// sever port
let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 4000;
}

const server = app.listen(PORT, () => {
  console.log(
    chalk.blue.bold(
      `server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  );
});
// Connect to socket.io
const io = socketio(server);
io.on("connection", (socket) => {
  console.log("Connected");
  io.on("disconnect", () => {
    console.log("Disconnected");
  });
});
const error = chalk.bold.red;
process.on("unhandledRejection", (err, promise) => {
  console.log(error(`Error: ${err.message}`));
  // Close server and Exist process
  server.close(() => process.exit(1));
});
