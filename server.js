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
const gameWords = require("./data/gameWords");
const affirmations = require("./data/affirmations");
const consolations = require("./data/consolations");

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
    game.displayArray = game.mysteryWord.join(" ");
    game.endingMessage = "You have been defeated.";
    res.redirect("/gameover");
  } else if (game.guessAmount >= 1 && game.displayArray.indexOf("_") < 0) {
    game.displayArray = game.mysteryWord.join(" ");
    game.endingMessage = "You are Victorious!";
    res.redirect("/gameover");
  } else {
    next();
  }
}

function affirmativeWords() {
  return affirmations[Math.floor(Math.random() * 8)];
}

function consolationWords() {
  return consolations[Math.floor(Math.random() * 5)];
}

function mysteryWordGen() {
  // return words[Math.floor(Math.random() * 234936)].toUpperCase().split("");
  return gameWords[Math.floor(Math.random() * 20)].toUpperCase().split("");
}

// --- game variables

var game = {};
var mysteryWord;
var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";

function gameGenerator() {
  mysteryWord = mysteryWordGen();
  var displayArray = (function() {
    var dummyArray = [];
    var arrayLength = mysteryWord.length;
    for (var i = 0; i < arrayLength; i++) {
      dummyArray.push("_");
    }
    return dummyArray;
  })();

  game = {
    guessAmount: 8,
    mysteryWord: mysteryWord,
    lettersGuessed: [],
    userDisplayGuessed: " ",
    displayArray: displayArray,
    userDisplayString: displayArray.join(" "),
    statusMessage: "Type To Begin",
    endingMessage: ""
  };

  console.log("Game word:", game.mysteryWord.join(""));
}

function gameReset() {
  game.GuessAmount = 8;
  game.mysteryWord = mysteryWord;
  game.lettersGuessed = [];
  game.userDisplayGuessed = " ";
  game.statusMessage = "Type To Begin";
  game.endingMessage = "";
}

// --- ROUTES

app.get("/", function(req, res) {
  gameGenerator();
  res.render("index");
});

app.get("/game", gameValidator, function(req, res) {
  res.render("game", { game: game });
});

app.post("/guess", function(req, res) {
  var userGuess = req.body.guess.toUpperCase();
  game.statusMessage = " ";

  function alreadyGuessed() {
    if (game.lettersGuessed.indexOf(userGuess) > -1) {
      return true;
    } else {
      return false;
    }
  }

  function gameEngine() {
    if (userGuess.length == 0) {
      game.statusMessage = "You Must Enter A Character.";
      res.redirect("/game");
    } else if (specialChars.indexOf(userGuess) >= 0) {
      game.statusMessage = "Special Characters Not Permitted!";
    } else if (alreadyGuessed() == true) {
      game.statusMessage = "Letter Already Guessed...";
      res.redirect("/game");
    } else if (mysteryWord.indexOf(userGuess) < 0) {
      game.guessAmount -= 1;
      game.lettersGuessed.push(userGuess);
      game.statusMessage = consolationWords();
      res.redirect("/game");
    } else {
      mysteryWord.forEach(function(letter, index) {
        if (userGuess === letter) {
          game.displayArray[index] = mysteryWord[index];
        }
      });
      game.lettersGuessed.push(userGuess);
      game.statusMessage = affirmativeWords();
    }

    var errors = req.validationErrors();
  }

  gameEngine();
  game.userDisplayString = game.displayArray.join(" ");
  game.userDisplayGuessed = game.lettersGuessed.join(" ");
  res.redirect("/game");
});

app.get("/gameover", function(req, res) {
  res.render("gameover", { game: game });
});

app.get("/gamereset", function(req, res) {
  mysteryWordGen();
  gameGenerator();
  gameReset();
  res.redirect("/game");
});

// LISTENER

app.listen(port, function(req, res) {
  console.log("Server running on port", port);
});
