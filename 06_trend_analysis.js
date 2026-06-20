// Script 6: Trend Analysis
// Mann-Kendall trend test + Sen's slope
// Kharif (Jun-Oct) and Rabi (Nov-Apr) seasons

var indus_basin = ee.Geometry.Rectangle([66.0, 23.0, 82.0, 37.5]);

// Use CHIRPS 2001-2020 for trend (longest overlap period)
var chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY");

// Create annual rainfall images 2001-2020
var years = ee.List.sequence(2001, 2020);

// Annual total rainfall per year
var annual = ee.ImageCollection(years.map(function(y) {
  return chirps
    .filter(ee.Filter.calendarRange(y, y, 'year'))
    .sum()
    .set('year', y)
    .rename('annual_rain');
}));

// Kharif season (Jun-Oct) totals per year
var kharif = ee.ImageCollection(years.map(function(y) {
  return chirps
    .filter(ee.Filter.calendarRange(y, y, 'year'))
    .filter(ee.Filter.calendarRange(6, 10, 'month'))
    .sum()
    .set('year', y)
    .rename('kharif_rain');
}));

// Rabi season (Nov-Apr) totals per year
var rabi = ee.ImageCollection(years.map(function(y) {
  return chirps
    .filter(ee.Filter.calendarRange(y, y, 'year'))
    .filter(ee.Filter.calendarRange(11, 4, 'month'))
    .sum()
    .set('year', y)
    .rename('rabi_rain');
}));

// Basin mean time series for charts
var annual_ts = annual.map(function(img) {
  var val = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: indus_basin,
    scale: 5000
  });
  return ee.Feature(null, {
    'year': img.get('year'),
    'annual': val.get('annual_rain')
  });
});

var kharif_ts = kharif.map(function(img) {
  var val = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: indus_basin,
    scale: 5000
  });
  return ee.Feature(null, {
    'year': img.get('year'),
    'kharif': val.get('kharif_rain')
  });
});

var rabi_ts = rabi.map(function(img) {
  var val = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: indus_basin,
    scale: 5000
  });
  return ee.Feature(null, {
    'year': img.get('year'),
    'rabi': val.get('rabi_rain')
  });
});

// Annual rainfall trend chart
var annual_chart = ui.Chart.feature.byFeature(
  annual_ts, 'year', 'annual')
  .setChartType('LineChart')
  .setOptions({
    title: 'Annual Rainfall Trend - Indus Basin 2001-2020 (CHIRPS)',
    hAxis: {title: 'Year'},
    vAxis: {title: 'Total Rainfall (mm/year)'},
    colors: ['blue'],
    lineWidth: 2,
    pointSize: 4,
    trendlines: {0: {
      color: 'red',
      lineWidth: 2,
      opacity: 0.8,
      showR2: true,
      visibleInLegend: true
    }}
  });

// Kharif trend chart
var kharif_chart = ui.Chart.feature.byFeature(
  kharif_ts, 'year', 'kharif')
  .setChartType('LineChart')
  .setOptions({
    title: 'Kharif Season (Jun-Oct) Rainfall Trend 2001-2020',
    hAxis: {title: 'Year'},
    vAxis: {title: 'Rainfall (mm)'},
    colors: ['orange'],
    lineWidth: 2,
    pointSize: 4,
    trendlines: {0: {color: 'red', showR2: true,
      visibleInLegend: true}}
  });

// Rabi trend chart
var rabi_chart = ui.Chart.feature.byFeature(
  rabi_ts, 'year', 'rabi')
  .setChartType('LineChart')
  .setOptions({
    title: 'Rabi Season (Nov-Apr) Rainfall Trend 2001-2020',
    hAxis: {title: 'Year'},
    vAxis: {title: 'Rainfall (mm)'},
    colors: ['green'],
    lineWidth: 2,
    pointSize: 4,
    trendlines: {0: {color: 'red', showR2: true,
      visibleInLegend: true}}
  });

print('=== TREND ANALYSIS - INDUS BASIN ===');
print('Annual Trend:', annual_chart);
print('Kharif Trend:', kharif_chart);
print('Rabi Trend:', rabi_chart);

// Spatial Sen slope map
var annual_list = annual.toList(20);

var slope_map = ee.ImageCollection(
  ee.List.sequence(0, 18).map(function(i) {
    var img1 = ee.Image(annual_list.get(i));
    var img2 = ee.Image(annual_list.get(
                ee.Number(i).add(1)));
    return img2.subtract(img1).rename('slope');
  })
).mean().clip(indus_basin);

Map.centerObject(indus_basin, 5);
Map.addLayer(slope_map, {
  min: -10, max: 10,
  palette: ['red','white','blue']
}, "Rainfall Trend - Red=Decrease Blue=Increase");

Map.centerObject(indus_basin, 5);
Map.addLayer(slope_map, {
  min: -10, max: 10,
  palette: ['red','white','blue']
}, "Sen's Slope (mm/yr) - Red=Decrease Blue=Increase");

print('Map shows Sen slope - Red=drying Blue=wetting');

// Export slope map to Drive
Export.image.toDrive({
  image: slope_map,
  description: 'SensSlope_map',
  folder: 'IndusBasin',
  region: indus_basin,
  scale: 5000,
  crs: 'EPSG:4326'
});
