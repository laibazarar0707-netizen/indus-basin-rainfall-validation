// Script 7: Export all charts as images to Drive

var indus_basin = ee.Geometry.Rectangle([66.0, 23.0, 82.0, 37.5]);
var year = '2015';

// ─────────────────────────────────
// FIGURE 1: Mean rainfall map
// all 5 products side by side
// ─────────────────────────────────

var chirps_mean = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filterDate(year+'-01-01', year+'-12-31')
  .select('precipitation').mean();

var imerg_mean = ee.ImageCollection("NASA/GPM_L3/IMERG_V06")
  .filterDate(year+'-01-01', year+'-12-31')
  .select('precipitationCal').mean().multiply(24);

var gsmap_mean = ee.ImageCollection("JAXA/GPM_L3/GSMaP/v6/operational")
  .filterDate(year+'-01-01', year+'-12-31')
  .select('hourlyPrecipRateGC').mean().multiply(24);

var persiann_mean = ee.ImageCollection("NOAA/PERSIANN-CDR")
  .filterDate(year+'-01-01', year+'-12-31')
  .select('precipitation').mean();

var era5_mean = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
  .filterDate(year+'-01-01', year+'-12-31')
  .select('total_precipitation_sum').mean().multiply(1000);

// Visualisation parameters
var viz = {
  min: 0, max: 8,
  palette: ['white','lightblue','blue','darkblue','purple']
};

// Show all on map
Map.centerObject(indus_basin, 5);
Map.addLayer(chirps_mean.clip(indus_basin),   viz, 'CHIRPS');
Map.addLayer(imerg_mean.clip(indus_basin),    viz, 'IMERG');
Map.addLayer(gsmap_mean.clip(indus_basin),    viz, 'GSMaP');
Map.addLayer(persiann_mean.clip(indus_basin), viz, 'PERSIANN');
Map.addLayer(era5_mean.clip(indus_basin),     viz, 'ERA5');

// Export each map to Drive
var products = {
  'CHIRPS':    chirps_mean,
  'IMERG':     imerg_mean,
  'GSMaP':     gsmap_mean,
  'PERSIANN':  persiann_mean,
  'ERA5':      era5_mean
};

// Export CHIRPS map
Export.image.toDrive({
  image: chirps_mean.clip(indus_basin).visualize(viz),
  description: 'Fig1_CHIRPS_mean_2015',
  folder: 'IndusBasin',
  region: indus_basin,
  scale: 5000,
  crs: 'EPSG:4326'
});

// Export IMERG map
Export.image.toDrive({
  image: imerg_mean.clip(indus_basin).visualize(viz),
  description: 'Fig1_IMERG_mean_2015',
  folder: 'IndusBasin',
  region: indus_basin,
  scale: 10000,
  crs: 'EPSG:4326'
});

// Export GSMaP map
Export.image.toDrive({
  image: gsmap_mean.clip(indus_basin).visualize(viz),
  description: 'Fig1_GSMaP_mean_2015',
  folder: 'IndusBasin',
  region: indus_basin,
  scale: 10000,
  crs: 'EPSG:4326'
});

// Export PERSIANN map
Export.image.toDrive({
  image: persiann_mean.clip(indus_basin).visualize(viz),
  description: 'Fig1_PERSIANN_mean_2015',
  folder: 'IndusBasin',
  region: indus_basin,
  scale: 25000,
  crs: 'EPSG:4326'
});

// Export ERA5 map
Export.image.toDrive({
  image: era5_mean.clip(indus_basin).visualize(viz),
  description: 'Fig1_ERA5_mean_2015',
  folder: 'IndusBasin',
  region: indus_basin,
  scale: 10000,
  crs: 'EPSG:4326'
});

 
print('Click RUN on each export');
print('5 maps will save to Drive/IndusBasin/');
print('White=dry  Blue=moderate  Purple=very wet');
