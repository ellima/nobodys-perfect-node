// script to waitforquestion.html

ifAdmin(function(){
    document.getElementById("inputAnswer").placeholder = "Bitte die korrekte Antwort eintragen...";
    document.getElementById("inputAnswer").style.backgroundColor = "lightgreen";
    document.getElementById("adminHint").style.display = "block";
    document.getElementById("adminHint").textContent = "Du bist Spielleiter*In, also bitte die korrekte Antwort eintragen.";
});
apiRequestJson("listenQuestion", null, function(res){
    document.getElementById("ueberschrift").textContent = "Bitte beantworten:";
    document.getElementById("ueberschrift").style.color = "black";
    document.getElementById("thequestion").textContent = decodeURIComponent(res);

    document.getElementById("sendit").style.display = "block";
});

function sendIt() {
    var answer = encodeURIComponent(document.getElementById("inputAnswer").value);
    var ownName = getCookie("myname");
    apiRequestJson("startAnswer", [ownName, answer], function(){
        window.location.href = "waitforanswers.html";
    });
}
