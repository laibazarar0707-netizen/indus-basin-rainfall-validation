// Script 2: ALL 5 products - FINAL WORKING VERSION
var indus_basin = ee.Geometry.Rectangle([66.0, 23.0, 82.0, 37.5]);

// Time periods
var start = '2015-01-01';
var end   = '2015-12-31';
var days  = ee.List.sequence(0, 364);

// 1. CHIRPS
var chirps_ts = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filterDate(start, end)
  .map(function(img) {
    var val = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: indus_basin,
      scale: 5000
    });
    return ee.Feature(null, {
      'date': img.date().format('YYYY-MM-dd'),
      'CHIRPS': val.get('precipitation')
    });
  });

// 2. PERSIANN
var persiann_ts = ee.ImageCollection("NOAA/PERSIANN-CDR")
  .filterDate(start, end)
  .map(function(img) {
    var val = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: indus_basin,
      scale: 25000
    });
    return ee.Feature(null, {
      'date': img.date().format('YYYY-MM-dd'),
      'PERSIANN': val.get('precipitation')
    });
  });

// 3. ERA5
var era5_ts = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
  .filterDate(start, end)
  .map(function(img) {
    var val = img.select('total_precipitation_sum')
               .multiply(1000)
               .reduceRegion({
                 reducer: ee.Reducer.mean(),
                 geometry: indus_basin,
                 scale: 10000
               });
    return ee.Feature(null, {
      'date': img.date().format('YYYY-MM-dd'),
      'ERA5': val.get('total_precipitation_sum')
    });
  });

// 4. IMERG (mm/hr x 24 = mm/day)
var imerg_daily = days.map(function(d) {
  var start_day = ee.Date(start).advance(d, 'day');
  var end_day   = start_day.advance(1, 'day');
  var daily = ee.ImageCollection("NASA/GPM_L3/IMERG_V06")
    .filterDate(start_day, end_day)
    .select('precipitationCal')
    .mean()
    .multiply(24);
  var val = daily.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: indus_basin,
    scale: 10000,
    maxPixels: 1e9
  });
  return ee.Feature(null, {
    'date': start_day.format('YYYY-MM-dd'),
    'IMERG': val.get('precipitationCal')
  });
});
var imerg_ts = ee.FeatureCollection(imerg_daily);

// 5. GSMaP (mm/hr x 24 = mm/day)
var gsmap_daily = days.map(function(d) {
  var start_day = ee.Date(start).advance(d, 'day');
  var end_day   = start_day.advance(1, 'day');
  var daily = ee.ImageCollection("JAXA/GPM_L3/GSMaP/v6/operational")
    .filterDate(start_day, end_day)
    .select('hourlyPrecipRateGC')
    .mean()
    .multiply(24);
  var val = daily.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: indus_basin,
    scale: 10000,
    maxPixels: 1e9
  });
  return ee.Feature(null, {
    'date': start_day.format('YYYY-MM-dd'),
    'GSMaP': val.get('hourlyPrecipRateGC')
  });
});
var gsmap_ts = ee.FeatureCollection(gsmap_daily);

// CHARTS
print('=== ALL 5 PRODUCTS - INDUS BASIN 2015 ===');

print(ui.Chart.feature.byFeature(chirps_ts, 'date', 'CHIRPS')
  .setChartType('LineChart')
  .setOptions({
    title: '1. CHIRPS (mm/day)',
    colors: ['blue'], lineWidth: 1,
    vAxis: {title: 'mm/day'},
    hAxis: {title: 'Date'}
  }));

print(ui.Chart.feature.byFeature(persiann_ts, 'date', 'PERSIANN')
  .setChartType('LineChart')
  .setOptions({
    title: '2. PERSIANN (mm/day)',
    colors: ['red'], lineWidth: 1,
    vAxis: {title: 'mm/day'},
    hAxis: {title: 'Date'}
  }));

print(ui.Chart.feature.byFeature(era5_ts, 'date', 'ERA5')
  .setChartType('LineChart')
  .setOptions({
    title: '3. ERA5 (mm/day)',
    colors: ['green'], lineWidth: 1,
    vAxis: {title: 'mm/day'},
    hAxis: {title: 'Date'}
  }));

print(ui.Chart.feature.byFeature(imerg_ts, 'date', 'IMERG')
  .setChartType('LineChart')
  .setOptions({
    title: '4. IMERG (mm/day)',
    colors: ['orange'], lineWidth: 1,
    vAxis: {title: 'mm/day'},
    hAxis: {title: 'Date'}
  }));

print(ui.Chart.feature.byFeature(gsmap_ts, 'date', 'GSMaP')
  .setChartType('LineChart')
  .setOptions({
    title: '5. GSMaP (mm/day)',
    colors: ['purple'], lineWidth: 1,
    vAxis: {title: 'mm/day'},
    hAxis: {title: 'Date'}
  }));

print('All 5 done!');
