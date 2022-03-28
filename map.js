src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
integrity = "sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
crossorigin = "" 

src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
integrity = "sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
crossorigin = ""




var map = L.map('mapid').setView([51.04, -114.05], 10);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibW1hcnIiLCJhIjoiY2tsaDloN3diMGswNjJ2cXBxNXlnODdieSJ9.SpAD42Te3ZwK3j0C46fyMA'
}).addTo(map);

