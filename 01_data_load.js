// Indus Basin Rainfall Validation
// Script 1: Load data and view on map

// Full Indus Basin using country boundary approach
var indus = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
  .filter(ee.Filter.inList('country_na', 
    ['Pakistan', 'India', 'Afghanistan', 'China']));

// Define Indus Basin as a rectangle covering the basin area
var indus_basin = ee.Geometry.Rectangle([66.0, 23.0, 82.0, 37.5]);

var chirps   = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY");
var imerg    = ee.ImageCollection("NASA/GPM_L3/IMERG_V06");
var gsmap    = ee.ImageCollection("JAXA/GPM_L3/GSMaP/v6/operational");
var persiann = ee.ImageCollection("NOAA/PERSIANN-CDR");
var era5     = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR");

// Show basin as filled red rectangle
Map.centerObject(indus_basin, 5);
Map.addLayer(indus_basin, {color: 'FF0000'}, 'Indus Basin Area');

// Show CHIRPS mean rainfall over basin
var chirps_mean = chirps
  .filterDate('2010-01-01', '2020-12-31')
  .filterBounds(indus_basin)
  .mean()
  .clip(indus_basin);

Map.addLayer(chirps_mean, 
  {min: 0, max: 10, 
   palette: ['white','lightblue','blue','darkblue']}, 
  'CHIRPS Mean Rainfall');

print('Basin defined. Datasets loaded.');
print('CHIRPS images:', chirps.size());
