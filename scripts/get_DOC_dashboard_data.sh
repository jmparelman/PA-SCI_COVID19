

d=`date | tr ' ' '_'`

cd ../data/DOC_dashboard_export

curl -o DOC-COVID-19-Dashboard-Data-${d}.xlsx https://www.cor.pa.gov/Documents/DOC-COVID-19-Dashboard-Data.xlsx?t=${d}
