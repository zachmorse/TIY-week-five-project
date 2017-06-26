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

// --- game variables

const mysteryWord = words[Math.floor(Math.random() * 200000)].split("");
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
  displayArray: displayArray,
  userDisplayString: displayArray.join(" ")
};

console.log(game);

// ROUTES

app.get("/", function(req, res) {
  res.render("index", { game: game });
});

app.post("/guess", function(req, res) {
  var userGuess = req.body.guess;

  mysteryWord.forEach(function(letter, index) {
    if (userGuess === letter) {
      game.displayArray[index] = mysteryWord[index];

      console.log("LINE 67, game.displayArray: ", game.displayArray);
    }
  });

  if (mysteryWord.indexOf(userGuess) < 0) {
    game.guessAmount -= 1;
  }
  game.userDisplayString = game.displayArray.join(" ");
  game.userDisplayString = game.userDisplayString.toUpperCase();
  game.lettersGuessed.push(req.body.guess);
  res.redirect("/");
});

// LISTENER

app.listen(port, function(req, res) {
  console.log("Server running on port", port);
});
