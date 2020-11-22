

d=`date | tr ' ' '_'`

cd ../data/PA_DOC_testing_data

curl -o PA-DOC-COVID-19-Testing_${d}.xlsx https://www.cor.pa.gov/Documents/PA-DOC-COVID-19-Testing.xlsx


