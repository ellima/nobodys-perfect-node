// script to results.html

var myName = getCookie("myname");
var myId = getCookie("myid");
var admin = getCookie("admin");

apiRequestJson("db", ["randomAnswers", myName], function(res){
    var response = JSON.parse(res);
    document.getElementById("questions").textContent = decodeURIComponent(response.pop().Answer);

    for (i in response) {
        var answer = decodeURIComponent(response[i].Answer);
        var listEntry = document.createElement("li");
        var entryContent = document.createTextNode(answer);
        if (response[i].PlayerID == myId) {
            if (admin == 0) {
                listEntry.style = "color: grey";
            } else {
                listEntry.style = "color: limegreen";
            }
        }
        listEntry.appendChild(entryContent);
        if (admin == 1 && response[i].Name != myName){
            answer = " — (von " + decodeURIComponent(response[i]["Name"]) + ")";
            let span = document.createElement("span");
            span.appendChild(document.createTextNode(answer));
            span.style = "color: grey; font-style: italic";
            listEntry.appendChild(span);
        }
        document.getElementById("randAnswers").appendChild(listEntry);
        document.getElementById("randAnswers").appendChild(document.createElement("br"));
    }
    if (admin == 0) {
        apiRequestJson("listenPlayer", null, function(res){
            res = JSON.parse(res);
            if (res.pop() == ":null:"){
                for (i in res) {
                    if (res[i].PlayerID == myId){
                        document.cookie = "admin=" + res[i].Admin + ";path=/";
                        if (res[i].Admin == 1) {
                            window.location.href = "questionprompt.html";
                        } else {
                            window.location.href = "waitforquestion.html";
                        }
                        break;
                    }
                }
            }
        });
    } else {
        document.getElementById("nextRound").style.display = "block";
    }
});

function nextRound() {
    apiRequestJson("newRound", null, function(res){
        res = JSON.parse(res);
        if (res.pop() == ":null:"){
            for (i in res) {
                if (res[i].PlayerID == myId){
                    document.cookie = "admin=" + res[i].Admin + ";path=/";
                    if (res[i].Admin == 1) {
                        window.location.href = "questionprompt.html";
                    } else {
                        window.location.href = "waitforquestion.html";
                    }
                    break;
                }
            }
        }
    });
}
