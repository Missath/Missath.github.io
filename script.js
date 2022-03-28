var connected_flag = 0
var mqtt;
var reconnectTimeout = 2000;

function onConnectionLost() {
    console.log("connection lost");
    document.getElementById("status").innerHTML = "Connection Lost";
    document.getElementById("messages").innerHTML = "Connection Lost";
    connected_flag = 0;
}
function onFailure(message) {
    console.log("Failed");
    document.getElementById("messages").innerHTML = "Connection Failed- Retrying";
    setTimeout(MQTTconnect, reconnectTimeout);
}
function onMessageArrived(rec_message) {
    out_msg = "Message received " + rec_message.payloadString + "<br>";
    out_msg = out_msg + "Message received Topic " + rec_message.destinationName;
    //console.log("Message received ",r_message.payloadString);
    console.log(out_msg);
    document.getElementById("messages").innerHTML = out_msg;
}

function onConnect() {
    // Once a connection has been made, make a subscription and send a message.
    document.getElementById("messages").innerHTML = "Connected to " + host + "on port " + port;
    connected_flag = 1
    document.getElementById("status").innerHTML = "Connected";
    console.log("on Connect " + connected_flag);

}
function disconnect() {
    if (connected_flag == 1)
        mqtt.disconnect();
}
function MQTTconnect() {
    document.getElementById("messages").innerHTML = "";
    var s = document.forms["connform"]["server"].value;
    var p = document.forms["connform"]["port"].value;
    if (p != "") {
        console.log("ports");
        port = parseInt(p);
        console.log("port" + port);
    }
    if (s != "") {
        host = s;
        console.log("host");
    }
    console.log("connecting to " + host + " " + port);
    var x = Math.floor(Math.random() * 10000);
    var cname = "orderform-" + x;
    mqtt = new Paho.MQTT.Client(host, port, cname);
    //document.write("connecting to "+ host);
    var options = {
        useSSL: true,
        timeout: 4000,
        onSuccess: onConnect,
        onFailure: onFailure,

    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;
    //mqtt.onConnected = onConnected;

    mqtt.connect(options);
    return false;


}
function sub_topics() {
    document.getElementById("messages").innerHTML = "";
    if (connected_flag == 0) {
        out_msg = "Not Connected so can't subscribe"
        console.log(out_msg);
        document.getElementById("messages").innerHTML = out_msg;
        return false;
    }
    var stopic = document.forms["subs"]["Stopic"].value;
    console.log("Subscribe to topic =" + stopic);
    mqtt.subscribe(stopic);
    return false;
}
function send_message() {
    document.getElementById("messages").innerHTML = "";
    if (connected_flag == 0) {
        out_msg = "<b>Not Connected so can't send</b>"
        console.log(out_msg);
        document.getElementById("messages").innerHTML = out_msg;
        return false;
    }
    var msg = document.forms["smessage"]["message"].value;
    console.log(msg);

    var topic = document.forms["smessage"]["Ptopic"].value;
    message = new Paho.MQTT.Message(msg);
    if (topic == "")
        message.destinationName = "test-topic"
    else
        message.destinationName = topic;
    mqtt.send(message);
    return false;
}

