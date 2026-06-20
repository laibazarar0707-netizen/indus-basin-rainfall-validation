// Script 3: Pakistan Ground Stations
// Using known PMD station coordinates

var indus_basin = ee.Geometry.Rectangle([66.0, 23.0, 82.0, 37.5]);

// Major Pakistan rainfall stations with coordinates
var station_list = [
  {name: 'Islamabad',  lon: 73.10, lat: 33.62},
  {name: 'Lahore',     lon: 74.34, lat: 31.55},
  {name: 'Peshawar',   lon: 71.52, lat: 34.01},
  {name: 'Karachi',    lon: 67.01, lat: 24.86},
  {name: 'Quetta',     lon: 66.94, lat: 30.18},
  {name: 'Multan',     lon: 71.43, lat: 30.20},
  {name: 'Faisalabad', lon: 73.09, lat: 31.41},
  {name: 'Hyderabad',  lon: 68.37, lat: 25.38},
  {name: 'Sargodha',   lon: 72.67, lat: 32.08},
  {name: 'Sialkot',    lon: 74.53, lat: 32.49}
];

// Convert to GEE FeatureCollection
var stations = ee.FeatureCollection(
  station_list.map(function(s) {
    return ee.Feature(
      ee.Geometry.Point([s.lon, s.lat]),
      {name: s.name}
    );
  })
);

// Show on map
Map.centerObject(indus_basin, 5);
Map.addLayer(indus_basin, {color: 'FF000033'}, 'Indus Basin');
Map.addLayer(stations, {color: 'yellow'}, 'PMD Stations');

print('Stations loaded:', stations.size());
print('Station names:', stations.aggregate_array('name'));

// Extract CHIRPS rainfall at each station for 2015
var chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filterDate('2015-01-01', '2015-12-31');

// Get annual mean rainfall at each station
var station_rainfall = chirps.mean().reduceRegions({
  collection: stations,
  reducer: ee.Reducer.mean(),
  scale: 5000
});

print('Annual mean CHIRPS at each station (mm/day):',
  station_rainfall.select(['name','mean']));

// Chart - rainfall per station
var station_chart = ui.Chart.feature.byFeature(
  station_rainfall, 'name', 'mean')
  .setChartType('ColumnChart')
  .setOptions({
    title: 'Mean CHIRPS Rainfall per Station 2015',
    hAxis: {title: 'Station'},
    vAxis: {title: 'mm/day'},
    colors: ['blue']
  });

print(station_chart);
