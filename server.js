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

function gameValidator(req, res, next) {
  if (game.guessAmount == 0 && game.displayArray.indexOf("_") >= 0) {
    game.endingMessage = "You have been defeated.";
    res.redirect("/gameover");
  } else if (game.guessAmount >= 1 && game.displayArray.indexOf("_") < 0) {
    game.endingMessage = "You are Victorious!";
    res.redirect("/gameover");
  } else {
    next();
  }
}

// --- game variables

const mysteryWord = words[Math.floor(Math.random() * 200000)]
  .toUpperCase()
  .split("");
var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
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
  statusMessage: "Type To Begin!",
  endingMessage: ""
};

console.log("Game word: ", game.mysteryWord.join(""));

// --- ROUTES

app.get("/", gameValidator, function(req, res) {
  res.render("index", { game: game });
});

app.get("/gameover", function(req, res) {
  res.render("gameover", { game: game });
});

app.post("/guess", function(req, res) {
  var userGuess = req.body.guess.toUpperCase();
  game.statusMessage = " ";

  function inputValidator() {
    if (userGuess.length == 0) {
      game.statusMessage = "You must enter a character";
      res.redirect("/");
    } else if (game.lettersGuessed.indexOf(userGuess) >= 0) {
      game.statusMessage = "Letter Already Guessed...";
      res.redirect("/");
    } else if (specialChars.indexOf(userGuess) >= 0) {
      game.statusMessage = "Special Characters Not Permitted";
    } else if (mysteryWord.indexOf(userGuess) < 0) {
      game.guessAmount -= 1;
      game.lettersGuessed.push(userGuess);
      game.statusMessage = "Sorry, Try Again.";
      res.redirect("/");
    } else {
      game.lettersGuessed.push(userGuess);
      game.statusMessage = "Good Job!";
      mysteryWord.forEach(function(letter, index) {
        if (userGuess === letter) {
          game.displayArray[index] = mysteryWord[index];
        }
      });
    }
    var errors = req.validationErrors();
    // console.log("errors: ", errors);
  }

  inputValidator();
  game.userDisplayString = game.displayArray.join(" ");
  game.userDisplayGuessed = game.lettersGuessed.join(" ");
  res.redirect("/");
});

// LISTENER

app.listen(port, function(req, res) {
  console.log("Server running on port", port);
});
