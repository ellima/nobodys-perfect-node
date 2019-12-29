// script to index.html

function request(){
    var nameEntry = encodeURIComponent(document.getElementById("name_entry").value);
    apiRequestJson("startPlayers", nameEntry, function(res){
        var response = JSON.parse(res)[0];
        if (response["PlayerID"] == -1) {
            document.getElementById("name_out").innerHTML = "Name schon vergeben. Bitte neuen wählen.";
        } else {
            document.cookie = "myid=" + response["PlayerID"] + ";path=/";
            document.cookie = "myname=" + response["Name"] + ";path=/";
            document.cookie = "admin=" + response["Admin"] + ";path=/"
            window.location.href = "waitplayers.html";
        }
    });
}
