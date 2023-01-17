mapboxgl.accessToken = 'pk.eyJ1Ijoic3FuZ3V5ZW4iLCJhIjoiY2w5eXd1YXc0MDk3MjNucDg2cDhyN3JrbyJ9.aMzoD2AZBPUtaVP2yV5N-A'
const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v10', // stylesheet location; feel free to change this if you prefer another style, but choose something simple that includes the road network. 
  center: [-122.4443, 47.2529], // starting position
  zoom: 10 // starting zoom
});

map.on('load', function() {
  map.addLayer({
    id: 'hospitals',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: hospitalPoints
    },
    layout: {
      'icon-image': 'hospital-15',
      'icon-allow-overlap': true
    },
    paint: { }
  });
  map.addLayer({
    id: 'libraries',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: libraryPoints
    },
    layout: {
      'icon-image': 'library-15',
      'icon-allow-overlap': true
    },
    paint: { }
  });
  map.addSource('nearest-hospital', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
      ]
    }
  });
});

var popup = new mapboxgl.Popup();
map.on('click', 'hospitals', function(e) {
  var feature = e.features[0];
  popup.setLngLat(feature.geometry.coordinates)
    .setHTML("<p1>" + feature.properties.NAME + "</p1><br><p2>" + feature.properties.ADDRESS + "</p2>")
    .addTo(map);
});

map.on('click', 'libraries', function(f) {

      // Using Turf, find the nearest hospital to library clicked
  var refLibrary = f.features[0];
  var nearestHospital = turf.nearest(refLibrary, hospitalPoints);

  	// Update the 'nearest-hospital' data source to include the nearest library
	map.getSource('nearest-hospital').setData({
    type: 'FeatureCollection',
    features: [
       nearestHospital
    ]
  });

// Create a new circle layer from the 'nearest-hospital' data source
  map.addLayer({
    id: 'nearestHospitalLayer',
    type: 'circle',
    source: 'nearest-hospital',
    paint: {
    'circle-radius': 12,
    'circle-color': '#486DE0'
  }
  }, 'hospitals');

  var from = refLibrary;
  var to = nearestHospital;
  var options = {units: 'miles'};
  var distance = turf.distance(from, to, options);

//Add popup that gives name of the library and the name and address of the nearest hospital
  popup.setLngLat(refLibrary.geometry.coordinates)
    .setHTML('<p1>' + refLibrary.properties.NAME + '</p1><br>The nearest hospital is <p2>' + nearestHospital.properties.NAME + '</p2>, located at <p2>' + nearestHospital.properties.ADDRESS + '</p2>. It is <p2>' + distance.toFixed(2) + '</p2> miles away.')
    .addTo(map);
});