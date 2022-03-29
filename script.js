var connected_flag = 0
var mqtt;
var reconnectTimeout = 2000;

function onConnectionLost() {
    console.log("connection lost");
    document.getElementById("status").innerHTML = "Disconnected";
    document.getElementById("messages").innerHTML = "";
    connected_flag = 0;
}
function onFailure(msg) {
    console.log("Failed");
    document.getElementById("messages").innerHTML = "Connection Failed - Retrying";
    setTimeout(MQTTconnect, reconnectTimeout);
}
function onMessageArrived(rec_msg) {
    //var rec = rec_msg.payloadString;
    if(isJson(rec_msg.payloadString)){
        
        updateMap(rec_msg.payloadString);
    } else {
        message = tmpVar;
        document.getElementById("messages").innerHTML = message;
        console.log("Received: " + message);
    }
}

function isJson(msg) {
    console.log(msg);
    msg = typeof msg !== "string"
        ? JSON.stringify(msg)
        : msg;

    try {
        msg = JSON.parse(msg);
    } catch (e) {
        return false;
    }

    if (typeof msg === "object" && msg !== null) {
        return true;
    }

    return false;
}
function onConnect() {
    document.getElementById("messages").innerHTML = "Connected to " + host + " on port " + port;
    connected_flag = 1
    document.getElementById("status").innerHTML = "Connected";
    console.log("Connected Flag = " + connected_flag);

}
function disconnect() {
    if (connected_flag == 1)
        document.getElementById("status").innerHTML = "Disconnected";
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
    var ranNum = Math.floor(Math.random() * 1000);
    var cname = "ClientName-" + ranNum;
    mqtt = new Paho.MQTT.Client(host, port, cname);
   
    var options = {
        useSSL: true,
        timeout: 4000,
        
        onSuccess: onConnect,
        onFailure: onFailure,

    };

    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;


    mqtt.connect(options);
    return false;


}
function sub_topics() {
    document.getElementById("messages").innerHTML = "";
    if (connected_flag == 0) {
        out_msg = "Not Connected: so can't subscribe"
        console.log(out_msg);
        document.getElementById("messages").innerHTML = out_msg;
        return false;
    }
    var stopic = document.forms["subs"]["Stopic"].value;
    console.log("Subscribe to topic = " + stopic);
    mqtt.subscribe(stopic);
    
    return false;
}
function send_message() {
    document.getElementById("messages").innerHTML = "";
    if (connected_flag == 0) {
        out_msg = "Not Connected: can't send"
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

const mapDiv = document.getElementById("mapid");
var map = L.map('mapid').setView([51.05, -114.07], 10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicmF5ZWhlIiwiYSI6ImNrbHZ5NHMyejBkdXcyc214OHlvNmhrZG0ifQ.KXVOh3T-0PdiPnVQ5iMCCQ'
}).addTo(map);
const resizeObserver = new ResizeObserver(() => {
    map.invalidateSize();
});

resizeObserver.observe(mapDiv);

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
        
        var temp = JSON.parse(msg);
        var lat = temp.latitude;
        var lon = temp.longitude;
        var temp = temp.temperature;
        document.getElementById("messages").innerHTML = "Published Location: {Latitude: " + lat + "Longitude: " + lon + " Temperature: " + temp +"}";

        if (temp < 10) {
            //Blue
            var marker = L.marker([lat, lon], { icon: blueIcon });
        } else if (temp > 29) {
            //Red
            var marker = L.marker([lat, lon], { icon: redIcon });
        } else {
            //Green
            var marker = L.marker([lat, lon], { icon: greenIcon });
        }
        marker.bindPopup("Temperature: " + temp + String.fromCharCode(176));
        marker.addTo(map);
    } catch (e) {
        console.log(e);
        document.getElementById("messages").innerHTML = "Invalid JSON file for app map.";
        console.log("Invalid JSON file for app map.");
    }
}

function shareStatus() {
    const message = document.querySelector('#mapStatus');

    // check if the Geolocation API is supported
    if (!navigator.geolocation) {
        message.textContent = `Your browser doesn't support Geolocation`;
        message.classList.add('error');
        return;
    }

    // handle click event
    const btn = document.querySelector('#shareMyStatus');
    btn.addEventListener('click', function () {
        
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });
    //Get randome temperature
    
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
      }
    //If navigator get location is successful
    function onSuccess(position) {

        const {
            latitude,
            longitude
        } = position.coords;
        const min = -40;
        const max = 60;
        var temperature = getRndInteger(min,max)

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
        
        mqtt.subscribe(topic);
        mqtt.send(msgjson);
        console.log("Message: " + geojson + " sent to topic: " + topic)
        document.getElementById("messages").innerHTML = "GeoJSON: " + geojson + " sent to " + topic;
       
        
    }

    // handle error case
    function onError() {
        message.classList.add('error');
        message.textContent = `Failed to get your location!`;
    }
};