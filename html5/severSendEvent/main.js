/**
 * Created by Administrator on 2016/4/26.
 */
var serverData,statusDiv;
var SERVER_URL="index.php";
window.onload=function(){
    serverData=document.getElementById("serverData");
    statusDiv=document.getElementById("statusDiv");
    startlistenServer();
}

function startlistenServer(){
    statusDiv.innerHTML="start Connect Server:";
    var es=new EventSource(SERVER_URL);
    es.onopen=openHandler;
    es.onerror=errorHandler;
    es.onmessage=messageHandler;
}
function openHandler(e){
    statusDiv.innerHTML="Server open:";
}
function errorHandler(e){
    status.innerHTML="Error";
}
function messageHandler(e){
    serverData.innerHTML= e.data;
    console.log(e.data);
}