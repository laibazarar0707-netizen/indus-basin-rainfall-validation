// Script 4: Compare satellite products vs ground stations
// This is the CORE RESULT of your paper

var indus_basin = ee.Geometry.Rectangle([66.0, 23.0, 82.0, 37.5]);

// Same 10 stations
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

var stations = ee.FeatureCollection(
  station_list.map(function(s) {
    return ee.Feature(
      ee.Geometry.Point([s.lon, s.lat]),
      {name: s.name}
    );
  })
);

// Extract mean annual rainfall at stations from each product
var year = '2015';

// CHIRPS
var chirps_stations = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filterDate(year+'-01-01', year+'-12-31')
  .mean()
  .reduceRegions({
    collection: stations,
    reducer: ee.Reducer.mean(),
    scale: 5000
  }).map(function(f) {
    return f.set('product', 'CHIRPS');
  });

// PERSIANN
var persiann_stations = ee.ImageCollection("NOAA/PERSIANN-CDR")
  .filterDate(year+'-01-01', year+'-12-31')
  .mean()
  .reduceRegions({
    collection: stations,
    reducer: ee.Reducer.mean(),
    scale: 25000
  }).map(function(f) {
    return f.set('product', 'PERSIANN');
  });

// ERA5
var era5_stations = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
  .filterDate(year+'-01-01', year+'-12-31')
  .select('total_precipitation_sum')
  .mean()
  .multiply(1000)
  .reduceRegions({
    collection: stations,
    reducer: ee.Reducer.mean(),
    scale: 10000
  }).map(function(f) {
    return f.set('product', 'ERA5');
  });

// IMERG
var imerg_stations = ee.ImageCollection("NASA/GPM_L3/IMERG_V06")
  .filterDate(year+'-01-01', year+'-12-31')
  .select('precipitationCal')
  .mean()
  .multiply(24)
  .reduceRegions({
    collection: stations,
    reducer: ee.Reducer.mean(),
    scale: 10000
  }).map(function(f) {
    return f.set('product', 'IMERG');
  });

// GSMaP
var gsmap_stations = ee.ImageCollection("JAXA/GPM_L3/GSMaP/v6/operational")
  .filterDate(year+'-01-01', year+'-12-31')
  .select('hourlyPrecipRateGC')
  .mean()
  .multiply(24)
  .reduceRegions({
    collection: stations,
    reducer: ee.Reducer.mean(),
    scale: 10000
  }).map(function(f) {
    return f.set('product', 'GSMaP');
  });

// Merge all products
var all_products = chirps_stations
  .merge(persiann_stations)
  .merge(era5_stations)
  .merge(imerg_stations)
  .merge(gsmap_stations);

// Chart: all products per station
var comparison_chart = ui.Chart.feature.groups(
  all_products, 'name', 'mean', 'product')
  .setChartType('ColumnChart')
  .setOptions({
    title: 'Satellite Products vs Stations - Indus Basin 2015',
    hAxis: {title: 'Station'},
    vAxis: {title: 'Mean Rainfall (mm/day)'},
    colors: ['blue','red','green','orange','purple']
  });

print('=== CORE COMPARISON RESULT ===');
print(comparison_chart);
print('All product values at stations:', all_products);
