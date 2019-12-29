// script to questionprompt.html

function sendIt(){
    var toSend = encodeURIComponent(document.getElementById("inputQuestion").value);
    ifAdmin(function(){
        apiRequestJson("inputQuestion", toSend, function(res){
            window.location.href = "waitforquestion.html";
        })
    });
};
