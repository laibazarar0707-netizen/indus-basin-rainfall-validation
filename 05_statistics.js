// Script 5: Simple clean statistics table

var year = '2015';
var indus_basin = ee.Geometry.Rectangle([66.0, 23.0, 82.0, 37.5]);

var stations = ee.FeatureCollection([
  ee.Feature(ee.Geometry.Point([73.10,33.62]),{name:'Islamabad', obs:3.8}),
  ee.Feature(ee.Geometry.Point([74.34,31.55]),{name:'Lahore',    obs:1.8}),
  ee.Feature(ee.Geometry.Point([71.52,34.01]),{name:'Peshawar',  obs:2.1}),
  ee.Feature(ee.Geometry.Point([67.01,24.86]),{name:'Karachi',   obs:0.3}),
  ee.Feature(ee.Geometry.Point([66.94,30.18]),{name:'Quetta',    obs:0.5}),
  ee.Feature(ee.Geometry.Point([71.43,30.20]),{name:'Multan',    obs:0.8}),
  ee.Feature(ee.Geometry.Point([73.09,31.41]),{name:'Faisalabad',obs:1.2}),
  ee.Feature(ee.Geometry.Point([68.37,25.38]),{name:'Hyderabad', obs:0.4}),
  ee.Feature(ee.Geometry.Point([72.67,32.08]),{name:'Sargodha',  obs:1.4}),
  ee.Feature(ee.Geometry.Point([74.53,32.49]),{name:'Sialkot',   obs:3.5})
]);

// Get mean image for each product
var chirps_img = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filterDate(year+'-01-01',year+'-12-31')
  .select('precipitation').mean();

var persiann_img = ee.ImageCollection("NOAA/PERSIANN-CDR")
  .filterDate(year+'-01-01',year+'-12-31')
  .select('precipitation').mean();

var era5_img = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
  .filterDate(year+'-01-01',year+'-12-31')
  .select('total_precipitation_sum').mean().multiply(1000);

var imerg_img = ee.ImageCollection("NASA/GPM_L3/IMERG_V06")
  .filterDate(year+'-01-01',year+'-12-31')
  .select('precipitationCal').mean().multiply(24);

var gsmap_img = ee.ImageCollection("JAXA/GPM_L3/GSMaP/v6/operational")
  .filterDate(year+'-01-01',year+'-12-31')
  .select('hourlyPrecipRateGC').mean().multiply(24);

// Stack all into one image with named bands
var stacked = chirps_img.rename('CHIRPS')
  .addBands(persiann_img.rename('PERSIANN'))
  .addBands(era5_img.rename('ERA5'))
  .addBands(imerg_img.rename('IMERG'))
  .addBands(gsmap_img.rename('GSMaP'));

// Extract all bands at all stations in one shot
var table = stacked.reduceRegions({
  collection: stations,
  reducer: ee.Reducer.mean(),
  scale: 25000
});

// Print table
print('=== TABLE 1: All Products vs Observed (mm/day) ===');
print(table.select(
  ['name','obs','CHIRPS','PERSIANN','ERA5','IMERG','GSMaP']));

// Chart
var chart = ui.Chart.feature.byFeature(
  table, 'name',
  ['obs','CHIRPS','PERSIANN','ERA5','IMERG','GSMaP'])
  .setChartType('ColumnChart')
  .setOptions({
    title: 'All Products vs Observed - Indus Basin 2015',
    hAxis: {title: 'Station'},
    vAxis: {title: 'Rainfall (mm/day)'},
    colors: ['black','blue','red','green','orange','purple']
  });

print(chart);

// Export to Drive
Export.table.toDrive({
  collection: table.select(
    ['name','obs','CHIRPS','PERSIANN','ERA5','IMERG','GSMaP']),
  description: 'Table1_validation',
  folder: 'IndusBasin',
  fileFormat: 'CSV'
});
 
