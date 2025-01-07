// Store API endpoint for earthquakes
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Store tectonic plates GeoJSON URL
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the earthquake API
d3.json(queryURL).then(function(earthquakeData) {
    // Perform a GET request to the tectonic plates GeoJSON
    d3.json(tectonicPlatesURL).then(function(tectonicData) {
        // Create features for earthquakes and tectonic plates
        createFeatures(earthquakeData.features, tectonicData);
    });
});

// Function to create features for earthquakes and tectonic plates
function createFeatures(earthquakeData, tectonicData) {
    // Earthquake layer
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<strong>Location: </strong>${feature.properties.place}
        <p><strong>Time: </strong>${new Date(feature.properties.time)}</p>
        <p><strong>Magnitude: </strong>${feature.properties.mag}</p>
        <p><strong>Depth: </strong>${feature.geometry.coordinates[2]} km</p>`);
    }

    function createCircleMarker(feature, latlng) {
        let options = {
            radius: feature.properties.mag * 5,
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            color: chooseColor(feature.geometry.coordinates[2]),
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.35
        };
        return L.circleMarker(latlng, options);
    }

    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Tectonic plates layer
    let tectonicPlates = L.geoJSON(tectonicData, {
        style: {
            color: "orange",
            weight: 2
        }
    });

    // Create the map
    createMap(earthquakes, tectonicPlates);
}

// Function to create the map
function createMap(earthquakes, tectonicPlates) {
    // Define base maps
    let satellite = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    });

    let grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    });

    let outdoors = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© OpenTopoMap, © OpenStreetMap contributors'
    });

    // Define baseMaps object
    let baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    // Define overlayMaps object
    let overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // Create the map
    let myMap = L.map("map", {
        center: [39.8282, -98.5795],
        zoom: 4,
        layers: [satellite, earthquakes, tectonicPlates]
    });

    // Add layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let grades = [-10, 10, 30, 50, 70, 90];
        let labels = [];
        let legendInfo = "<h3>Depth (km)</h3>";

        div.innerHTML = legendInfo;

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };
    legend.addTo(myMap);
}

// Function to choose color based on depth
function chooseColor(depth) {
    switch (true) {
        case depth <= 10:
            return "#1E90FF"; // Dodger Blue
        case depth <= 30:
            return "#32CD32"; // Lime Green
        case depth <= 50:
            return "#FFD700"; // Gold
        case depth <= 70:
            return "#FF8C00"; // Dark Orange
        case depth <= 90:
            return "#B22222"; // Firebrick
        default:
            return "#8B0000"; // Dark Red
    }
}