"use strict";

const express = require("express");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sessionConfig = require("./sessionConfig");
const fs = require("file-system");
const expressValidator = require("express-validator");
const app = express();
const port = process.env.PORT || 7500;
const words = fs
  .readFileSync("/usr/share/dict/words", "utf-8")
  .toLowerCase()
  .split("\n");

// --- set view engine:

app.engine("mustache", mustacheExpress());
app.set("views", "./public");
app.set("view engine", "mustache");

// --- middleware

app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session(sessionConfig));

// --- game variables

const mysteryWord = words[Math.floor(Math.random() * 200000)]
  .toUpperCase()
  .split("");
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
  userDisplayGuessed: "",
  displayArray: displayArray,
  userDisplayString: displayArray.join(" "),
  statusMessage: ""
};

console.log(game);

// --- INPUT VALIDATION

// --- ROUTES

app.get("/", function(req, res) {
  res.render("index", { game: game });
});

app.post("/guess", function(req, res) {
  var userGuess = req.body.guess.toUpperCase();
  game.statusMessage = " ";

  function inputValidator() {
    req.checkBody(userGuess).isAlpha();

    if (userGuess.length == 0) {
      game.statusMessage = "You must enter a character";
      res.redirect("/");
    } else if (game.lettersGuessed.indexOf(userGuess) >= 0) {
      game.statusMessage = "Letter already guessed, enter different letter";
      res.redirect("/");
    } else if (mysteryWord.indexOf(userGuess) < 0) {
      game.guessAmount -= 1;
      game.lettersGuessed.push(userGuess);
      res.redirect("/");
    } else {
      game.lettersGuessed.push(userGuess);
      mysteryWord.forEach(function(letter, index) {
        if (userGuess === letter) {
          game.displayArray[index] = mysteryWord[index];
        }
      });
    }

    var errors = req.validationErrors();
    console.log("errors: ", errors);
  }

  inputValidator();
  console.log(game);
  game.userDisplayString = game.displayArray.join(" ");
  game.userDisplayGuessed = game.lettersGuessed.join(" ");
  res.redirect("/");
});

// LISTENER

app.listen(port, function(req, res) {
  console.log("Server running on port", port);
});
