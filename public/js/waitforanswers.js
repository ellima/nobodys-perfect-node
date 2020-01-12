// script to waitforanswers.html

var myName = getCookie("myname");
ifAdmin(function(){
    var classElements = document.getElementsByClassName("justAdmin");
    for (i in classElements){
        classElements[i].style = "display: block";
    }
    document.getElementById("showAnswers").style.display = "block";
});

apiRequestJson("db", ["allAnswersAdmin", myName], function (res) {
    var response = JSON.parse(res);
    document.getElementById("theQuestion").textContent = decodeURIComponent(response.shift().Answer);
    if (response[0].PlayerID == -1){
        response.shift();
        var answerAndName = "Eigene Antwort: " + decodeURIComponent(response[0].Answer);
        var listEntry = document.createElement("li");
        var entryContent = document.createTextNode(answerAndName);
        
        listEntry.appendChild(entryContent);
        document.getElementById("answers").appendChild(listEntry);
        listenToClearance();
    } else {
        var totalPlayers = response.pop()["totalCounter"];
        for (i in response){
            var nameToDisplay = decodeURIComponent(response[i].Name);
            if (myName == nameToDisplay){
                document.getElementById("correctAnswer").textContent = "Korrekte Antwort: " + decodeURIComponent(response[i].Answer);
                document.getElementById("correctAnswer").appendChild(editButton());
                continue;
            }
            var answerAndName = nameToDisplay + ": " + decodeURIComponent(response[i].Answer);
            var listEntry = document.createElement("li");
            var entryContent = document.createTextNode(answerAndName);
            
            listEntry.appendChild(entryContent);
            listEntry.appendChild(editButton());
            document.getElementById("answers").appendChild(listEntry);
        }
        var gatheredAnswers = document.getElementById("answers").childElementCount;
        if (gatheredAnswers >= totalPlayers - 1) {
            document.getElementById("hint").textContent = "Alle Spieler haben ihre Antworten abgegeben!";
        }
        listenToAnswers(totalPlayers);
    }
});

function listenToAnswers(pnumber){
    apiRequestJson("listenAnswers", null, function(res){
        response = JSON.parse(res)[0];
        if (response == ":null:"){
            window.location.href = "results.html";
        } else {
            //var response = JSON.parse(res);
            var answerAndName = decodeURIComponent(response.Name) + ": " + decodeURIComponent(response.Answer);
            var listEntry = document.createElement("li");
            var entryContent = document.createTextNode(answerAndName);
            
            listEntry.appendChild(entryContent);
            listEntry.appendChild(editButton());
            
            document.getElementById("answers").appendChild(listEntry);
            var gatheredAnswers = document.getElementById("answers").childElementCount;
            if (gatheredAnswers >= pnumber - 1) {
                document.getElementById("hint").textContent = "Alle Spieler haben ihre Antworten abgegeben!";
            }
            listenToAnswers(pnumber);
        }
    });
}

function listenToClearance(){
    apiRequestJson("showAnswers", null, function(res){
        res = JSON.parse(res);
        if (res[0] == ":null:"){
            window.location.href = "results.html";
        }
    });
}

function editButton() {
    let newButton = document.createElement("button");
    newButton.style = "margin-left: 10px";
    
    let buttonText = document.createTextNode("Bearbeiten");
    newButton.appendChild(buttonText);

    return newButton;
}
