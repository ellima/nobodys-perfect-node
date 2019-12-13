// global scripts

function getCookie(name){
  var result = "";
  var clist = document.cookie.split(";")
  for (let i in clist){
    var subCookie = clist[i].trim().split("=");
    if (subCookie[0] == name) {
      result = subCookie[1];
      break;
    }
  }
  return result;
}


function apiRequestJson(key, option, callback) {
  if (typeof(option) != "string" && option != null){
    option = option[0] + "&altopt=" + option[1];
  }
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/api" + "?key=" + key.toString() + "&opt=" + option, true);
  xhr.send();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(this.responseText);
    }
  };
}


function ifAdmin(callback) {
  var state = getCookie("admin");
  if (state.toString() == "1") {
    callback();
  }
};
