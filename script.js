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

var map = L.map('mapid').setView([51.05, -114.07], 10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicmF5ZWhlIiwiYSI6ImNrbHZ5NHMyejBkdXcyc214OHlvNmhrZG0ifQ.KXVOh3T-0PdiPnVQ5iMCCQ'
}).addTo(map);

//Icons are from
//https://github.com/pointhi/leaflet-color-markers

var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function updateMap(msg) {
    try {
        var tmpStr = JSON.stringify(msg);
        document.getElementById("messages").innerHTML = tmpStr;
        var tmpJSON = JSON.parse(msg);
        var la = tmpJSON.latitude;
        var lo = tmpJSON.longitude;
        var t = tmpJSON.temperature;
        document.getElementById("messages").innerHTML = "Received GeoJSON - Latitude: " + la + " | Longitude: " + lo + " | Temperature: " + t;

        if (t < 10) {
            //Blue
            var marker = L.marker([la, lo], { icon: blueIcon });
        } else if (t > 29) {
            //Red
            var marker = L.marker([la, lo], { icon: redIcon });
        } else {
            //Green
            var marker = L.marker([la, lo], { icon: greenIcon });
        }
        marker.bindPopup("Temperature: " + t + " degrees");
        marker.addTo(map);
    } catch (e) {
        console.log(e);
        document.getElementById("messages").innerHTML = "Invalid JSON file for app map.";
        console.log("Invalid JSON file for app map.");
    }
}

function shareStatus() {
    const status = document.querySelector('status')

    function success(pos) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        status.textContent = '';
        var temperature = Math.floor((Math.random() * 101) - 40);

        var lat = latitude.toString();
        var lon = longitude.toString();
        var temp = temperature.toString();

        var geojson = '{"latitude": ' + lat + ', "longitude": ' + lon + ', "temperature": ' + temp + '}';

        document.getElementById("status").innerHTML = "";


        var name = document.forms["mapStatus"]["yName"].value;
        if (name == "") {
            name = "Marissa_Hamilton";
        }
        var course = document.forms["mapStatus"]["crsName"].value;
        if (course == "") {
            course = "ENGO651";
        }
        var topic = course + "/" + name + "/My_Temperature";
        var msgjson = new Paho.MQTT.Message(geojson);
        msgjson.destinationName = topic;

        mqtt.send(msgjson);
        console.log("Message: " + geojson + " sent to " + topic)
        document.getElementById("mstatus").innerHTML = "GeoJSON: " + geojson + " sent to " + topic;
    }

    function error() {
        status.textContent = 'Unable to retrieve your location';
    }

    if (!navigator.geolocation) {
        status.textContent = 'Geolocation is not supported by your browser';
    } else {
        status.textContent = 'Locating…';
        navigator.geolocation.getCurrentPosition(success, error);
    }
}