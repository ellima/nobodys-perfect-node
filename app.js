/*
'Nobody's perfect' server application,
2019 by Maximilian J. Ellinger

* install node dependencies '~$ npm install'
* Run with '~$ node app.js'

Will start a server you can connect to with any browser. For local network use, the local IP-address is displayed on startup.
*/

// use path tools, always serves files for correct location
const path = require("path");
// import expressjs framework
const express = require("express");
const app = new express();
const port = 8080;
// init database
const sqlite3 = require("better-sqlite3");
const db = new sqlite3(":memory:");
// add event listener
const events = require("events");
const eventEmitter = new events.EventEmitter();

// initialize static fileserver
app.use( express.static(path.join(__dirname, "public")) );

// handle api requests
app.get("/api", function (req, res) {
  var request = encodeURIComponent(req.query.key); // encodes request key to route the request correctly
  res.set("Content-Type", "text/plain"); // lets reciever know the transferred datatype, text is most supported
  // handle requests depending on request key
  switch (request) {
    case "startPlayers": // routes initial request with name input to the database handler
      var startRequest = encodeURIComponent(req.query.opt);
      var toSend = startHandler(startRequest);
      res.send(toSend); // send the received information back to the browser
      break;
    case "inputQuestion": // routes question input accordingly
      var inputRequest = encodeURIComponent(req.query.opt);
      answerHandler(":newQuestion:", inputRequest, function(){
        eventEmitter.emit("pushQuestions", inputRequest); // fires event to browsers, that are waiting to recieve the question
        res.end(); // don't send information, browser redirects after input is complete
      });
      break;
    case "startAnswer": // directs answers to the handler
      var questRequest = encodeURIComponent(req.query.opt);
      var questOption = encodeURIComponent(req.query.altopt);
      answerHandler(questRequest, questOption, () => res.end());
      break;
    case "db": // accesses database to retreive stored information
      var dbRequest = encodeURIComponent(req.query.opt);
      var dbOption = encodeURIComponent(req.query.altopt);
      var toSend = "";
      if (dbOption === undefined) { // if a list of option is sent, multiple arguments are passed
        toSend = dbHandler(dbRequest);
      } else {
        toSend = dbHandler(dbRequest, dbOption);
      }
      res.send(toSend);
      break;
    // the listeners will be reduced to one listener depending on a request option to simplify the code
    case "listenPlayer": // sets event listener to recieve name of joining player
      eventEmitter.once("pushPlayers", (name) => res.send(name) );
      break;
    case "listenQuestion": // the same as above for questions
      try { // if table with answers and question exists in db, get it from there
        let loadQuestion = db.prepare("SELECT Answer FROM " + "Quests" + " WHERE Name='" + ":questioneer:" + "';");
        var theQuestion = loadQuestion.all();
        var toSend = theQuestion[0]["Answer"];
        res.send(toSend);
      }
      catch { // otherwise, wait for question to be pushed in the moment of entering the question by the questioneer
        eventEmitter.once("pushQuestions", (quest) => res.send(quest) );
      }
      break;
    case "listenAnswers": // same same
        eventEmitter.once("pushAnswers", (answer) => { res.send(answer) });
      break;
    case "showAnswers": // same same same
        eventEmitter.once("showMe", (toSend) => res.send(toSend) );
      break;
    case "launch": // used to fire starting events, usually triggert by the press of a button 
        var fireEmitter = encodeURIComponent(req.query.opt);
        var fireEmitterAlt = encodeURIComponent(req.query.altopt);
        eventEmitter.emit(fireEmitter, JSON.stringify([":null:"])); // object with string because browsers will deal with objects rather than plane strings
        if (fireEmitterAlt !== undefined) { // possibility to fire second event
          eventEmitter.emit(fireEmitterAlt, JSON.stringify([":null:"]));
        };
      break;
    case "newRound": // special request to reset databases and set new game admin
        var toSend = nextRound();
        res.send(toSend);
      break;
    default: // error case
        console.log("Something went wrong...");
      break;
  }
});

// run server on port "port", shows message under which ip the server is accessible (in a local network)
app.listen(port, function(){
  const iface = require("os").networkInterfaces();
  let ips = "";
  let printPort = ":" + port.toString();
  if (port == 80) {
    printPort = "";
  }
  for (i in iface) {
    for (j in iface[i]){
      if (iface[i][j].family == "IPv4"){
        if (iface[i][j].internal == false){
          if (ips.length > 0){
            ips += ", " + iface[i][j].address + printPort;
          } else {
            ips += iface[i][j].address + printPort;
          }
        }
      }
    }
  }
  if (ips == "") {
    console.log("Couldn't find an external network interface. Only accessible via localhost:" + port.toString());
  } else {
    console.log("Server is running on: " + ips);
  }
});

// handles the name entries
function startHandler(name){
  name = encodeURIComponent(decodeURIComponent(name).trim()); // remove leading and closing whitespaces from input
  var result = JSON.stringify([{"PlayerID":-1}]); // standard return, will throw 'name exists' error on webpage
  var check = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='" + "Players" + "';").all();
  if (check.length == 0){ // check if table for players already exists
    // if not, create it and add first player's name to it
    db.prepare("CREATE TABLE " + "Players" + " (PlayerID INTEGER PRIMARY KEY , Name TEXT, Admin INT) ").run();
    db.prepare("INSERT INTO " + "Players" + " (Name, Admin) VALUES (?, ?)").run(name, 1);
    // get all informtion from db, including PlayerID and send it to the website
    var thisEntry = db.prepare("SELECT * FROM " + "Players" + ";").all(); // all() command always return list
    result = JSON.stringify(thisEntry); // uses string since text transmission is most widely supported

  } else {
    let checkName = db.prepare("SELECT * FROM " + "Players" + " WHERE Name='" + name + "';"); // all entries with name 'name'
    if (checkName.all().length == 0) { // conditional makes sure, the same name is used just once
      db.prepare("INSERT INTO " + "Players" + " (Name, Admin) VALUES (?, ?);").run(name, 0); // no admin, since it already exists
      // same idea as above
      var thisEntry = checkName.all();
      // fires event for all other browsers. Listening starts after they got redirected to waiting page
      eventEmitter.emit("pushPlayers", JSON.stringify([name])); // this server always transmits lists for handling purposes on the corresponding site
      result = JSON.stringify(thisEntry);
    }
  }
  return result;
};

// handles the answers and the question
function answerHandler(entry, content, callback) {
  if (entry == ":newQuestion:") { // admin will first enter the question. ':newQuestion:' comes from command above
    // create table for questions. Similar to existing 'Players' table. Random order ensures random answer order in the result section
    db.prepare("CREATE TABLE " + "Quests" + " AS SELECT * FROM " + "Players ORDER BY RANDOM()" + ";").run();
    // add new column for answers and the question
    db.prepare("ALTER TABLE " + "Quests" + " ADD Answer TEXT;").run();
    // the question is also stored among the answers by the virtual 'questioneer' user
    db.prepare("INSERT INTO " + "Quests" + " (PlayerID, Name, Answer) VALUES (?,?,?);").run(0, ":questioneer:", content);
  } else {
    // adds user's answer to the database. Admin always types correct answer
    db.prepare("UPDATE " + "Quests" + " SET Answer=? WHERE Name='" + entry + "';").run(content);
    var sendMe = [{ "Answer": content , "Name": entry }]; // sets up list with JSON object to send to waiting players
    eventEmitter.emit("pushAnswers", JSON.stringify(sendMe)); // waiting players recieve entered data
  }
  callback(); // used to response to browser that started the request
}

// handles request to existing entries in the databases
function dbHandler(request, from){
  var result = "";
  switch (request) {
    case "allPlayers": // simply returns alls players
      var res = db.prepare("SELECT Name FROM " + "Players" + ";").all();
      result = JSON.stringify(res);
      break;
    case "allAnswersAdmin": // returns all answers depending on your admin status. No admin -> only own answer
      var res = [];
      var checkAdmin = db.prepare("SELECT Admin FROM " + "Quests" + " WHERE Name='" + from + "';").get();
      if (checkAdmin.Admin == 1){
        var allAnswers = db.prepare("SELECT * FROM " + "Quests" + " WHERE PlayerID != 0 AND Answer IS NOT NULL ORDER BY PlayerID ASC;").all(); //PlayerID!=0 And
        var numberOfPlayers = db.prepare("SELECT COUNT() FROM " + "Quests" + " WHERE PlayerID!=0;").get()["COUNT()"];
        // additionally return number of answers
        allAnswers.push({"totalCounter": numberOfPlayers}); // enables to see when all players entered their answer
        res = allAnswers;
      } else {
        var ownInfo = db.prepare("SELECT * FROM " + "Quests" + " WHERE Name='" + from + "';").all();
        // only selects own answer (not admin)
        ownInfo.unshift({"PlayerID":-1}); // add special object for the browser to know weather one got all entries or just one answer
        res = ownInfo;
      }
      var obtainQuestion = db.prepare("SELECT Answer FROM " + "Quests" + " WHERE PlayerID=0;").get();
      res.unshift(obtainQuestion); // adds the question to the object to send
      result = JSON.stringify(res);
      break;
    case "randomAnswers": // will return the already random ordered list of answers
      var res = [];
      var sqlQuery = "SELECT PlayerID, Answer FROM " + "Quests" + " WHERE PlayerID!=0;";
      var whosAdmin = db.prepare("SELECT Admin FROM " + "Quests" + " WHERE Name='" + from + "';").get();
      if (whosAdmin.Admin == 1){ // admin also recieves corresponding names and IDs
        sqlQuery = "SELECT PlayerID, Name, Answer FROM " + "Quests" + " WHERE PlayerID!=0;";
      }
      var selectAnswers = db.prepare(sqlQuery).all();
      res = selectAnswers; // retrieve answers

      var getQuestion = db.prepare("SELECT Answer FROM " + "Quests" + " WHERE PlayerID=0;").get();
      res.push(getQuestion); // also add question to be displayed

      result = JSON.stringify(res);
      break;
    default:
      result = "Just,...no!"; // error in case no case is matched
  };
  return result;
};

// prepares database for the next round
function nextRound(){ // admin player needs to be moved to the next player or to the first after the last player in the list
  let listPlayers = db.prepare("SELECT PlayerID, Admin FROM " + "Players" + " ORDER BY PlayerID ASC"); // enforce order by ID. Its the order they signed up
  let insertAdmin = db.prepare("UPDATE " + "Players" + " SET Admin=? WHERE PlayerID=?");
  var thePlayers = listPlayers.all(); // object that contains all players
  for (i in thePlayers) { // loop through that list
    i = parseInt(i);
    if(thePlayers[i].Admin == 1) { // current admin player is set to 'normal' player
      insertAdmin.run(0, thePlayers[i].PlayerID);
      if (i+1 == thePlayers.length) { // if current admin is the last player in the list, first player becomes admin again
        insertAdmin.run(1, thePlayers[0].PlayerID);
      } else { // next player becomes admin
        insertAdmin.run(1, thePlayers[i+1].PlayerID);
      }
      break;
    }
  }
  var send = listPlayers.all(); // contains new credentials to browsers. Let them set new cookies
  send.push(":null:"); // special string for browsers. Makes them start over again
  eventEmitter.emit("pushPlayers", JSON.stringify(send)); // send info to waiting browsers
  db.prepare("DROP TABLE " + "Quests" + ";").run(); // Table with questions gets dropped and created again with the new question
  return JSON.stringify(send);
};
