# Indus Basin Multi-Product Rainfall Validation

## Overview
This study validates five global satellite rainfall products over the Indus Basin, Pakistan using Google Earth Engine (GEE).

## Products Evaluated
| Product | Agency | Resolution |
|---------|--------|------------|
| CHIRPS | UC Santa Barbara | 0.05° |
| IMERG | NASA | 0.1° |
| GSMaP | JAXA | 0.1° |
| PERSIANN-CDR | NOAA | 0.25° |
| ERA5 | ECMWF | 0.1° |

## Study Area
Indus Basin, Pakistan (66°E–82°E, 23°N–37.5°N)

## Methods
- Basin-mean time series extraction (2015)
- Validation against 10 PMD ground stations
- Statistical metrics: R, RMSE, PBIAS
- Seasonal trend analysis (Kharif/Rabi) 2001–2020
- Mann-Kendall trend test + Sen's slope

## Key Findings
- CHIRPS showed best agreement with observations
- Both Kharif and Rabi seasons show increasing trends
- Spatial trend map shows wetting over Indus Basin

## Scripts
| Script | Description |
|--------|-------------|
| 01_data_load.js | Load datasets and define study area |
| 02_validation.js | Time series extraction all 5 products |
| 03_ground_stations.js | PMD station locations and data |
| 04_comparison.js | Satellite vs station comparison |
| 05_statistics.js | Validation table export |
| 06_trend_analysis.js | Trend analysis Kharif/Rabi |
| 07_export_charts.js | Export maps to Google Drive |

## Data
All analysis runs entirely in Google Earth Engine.
No local downloads required.
Results saved to Google Drive/IndusBasin/

## Tools
- Google Earth Engine (JavaScript API)
- Google Drive (outputs)
- GitHub (code repository)

## Author
Laiba Zarar Noor
