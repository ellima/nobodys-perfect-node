// script to waitplayers.html

var href = "waitforquestion.html";
ifAdmin(function(){
    document.getElementById("letsgo").style.display = "block";
    href = "questionprompt.html";
})

apiRequestJson("db", "allPlayers", function (res) {
    var response = JSON.parse(res);
    var resText = "";
    for (i in response) {
        if (i == 0) {
            resText += response[i]["Name"];
        } else {
            resText += ", " + response[i]["Name"];
        }
    }
    document.getElementById("firstName").textContent = decodeURIComponent(resText);
    listenToPlayers();
})

function listenToPlayers() {
    apiRequestJson("listenPlayer", null, function(res) {
        console.log(res);
        res = JSON.parse(res);
        if (res[0] != ":null:"){
            document.getElementById("firstName").textContent += ", " + decodeURIComponent(res[0]);
            listenToPlayers();
        } else {
            // cookie set to identify weather browser is already at question stage
            document.cookie = "quest=yes" + ";path=/";
            window.location.href = href;
        }
    });
};
