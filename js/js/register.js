var form1 = document.forms.namedItem("register");
form1.addEventListener('submit', function(ev) {

    //var oOutput = document.querySelector("div")
    oData1 = new FormData(form1);

    //oData.append("CustomField", "This is some extra data");

    var oReq1 = new XMLHttpRequest();
    oReq1.open("POST", "phps/register.php", false);
    oReq1.onload = function(oEvent) {
    if (oReq1.status == 200) {
        //oOutput.innerHTML = "Uploaded!";
        alert("Done!");
        oReq1.open("GET","j.php",false);
        oReq1.send();
        return false;
    } else {
        //oOutput.innerHTML = "Error " + oReq.status + " occurred when trying to upload your file.<br \/>";
        alert("Error " + oReq1.status + " occurred. \n\nPlease Try It Again");
    }
    };

    oReq1.send(oData1);
    ev.preventDefault();
}, false);