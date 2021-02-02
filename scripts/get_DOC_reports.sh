

d=`date | tr ' ' '_'`

cd ../data/DOC_daily_counts


curl -o PA-DOC-WW-Report_${d}.pdf https://www.cor.pa.gov/Documents/WW-Report.pdf

curl -o PA-DOC-COVID-19-Daily-Count-${d}.pdf https://www.cor.pa.gov/Documents/DOC-COVID-19-Daily-Count.pdf

