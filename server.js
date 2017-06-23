"use strict";

const express = require("express");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sessionConfig = require("./sessionConfig");
const fs = require("file-system");
const app = express();
const port = process.env.PORT || 7500;
const words = fs
  .readFileSync("/usr/share/dict/words", "utf-8")
  .toLowerCase()
  .split("\n");

const mysteryWord = words[Math.floor(Math.random() * 45000)];
var displayArray = (function() {
  var dummyArray = [];
  var arrayLength = mysteryWord.length;
  for (var i = 0; i < arrayLength; i++) {
    dummyArray.push("_");
  }
  return dummyArray;
})();

var game = {
  guessAmount: 8,
  mysteryWord: mysteryWord,
  lettersGuessed: [],
  correctGuesses: [],
  displayArray: displayArray.join(" ")
};

console.log(game);

// set view engine:

app.engine("mustache", mustacheExpress());
app.set("views", "./public");
app.set("view engine", "mustache");

// middleware

app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionConfig));

// app.use("/", function(req, res, next) {
//   next();
// });

// ROUTES

app.get("/", function(req, res) {
  res.render("index", { game: game });
});

app.post("/guess", function(req, res) {
  res.redirect("/");
});

// LISTENER

app.listen(port, function(req, res) {
  console.log("Server running on port", port);
});
