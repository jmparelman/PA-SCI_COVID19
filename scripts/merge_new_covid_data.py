
import pandas as pd
import os
import re


column_mapping = {
 'Unnamed: 0': 'SCI',
 'Positive': 'staff_positive',
 'Negative': 'staff_negative',
 'Pending': 'staff_pending',
 'Death*': 'staff_death',
 'Recovered': 'staff_recovered',
 'Positive.1': 'inmate_positive',
 'Negative.1': 'inmate_negative',
 'Pending.1': 'inmate_pending',
 'Death*.1': 'inmate_death',
 'Recovered.1': 'inmate_recovered',
    
  # test purpose columns added 
  # 'Transfer', 'Transfer (+)', 'Release', 'Release (+)', 'Hospital',
  # 'Hospital (+)', 'Surveilance', 'Surveilance (+)', 'Symptomatic',
  # 'Symptomatic (+)'

 'Transfer': 'test_transfer', 
 'Transfer (+)': 'test_transfer_positive', 
 'Release': 'test_release',
 'Release (+)': 'test_release_positive', 
 'Hospital': 'test_hospital', 
 'Hospital (+)': 'test_hospital_positive', 
 'Surveilance': 'test_surveilance',
 'Surveilance (+)': 'test_surveilance_positive', 
 'Symptomatic': 'test_symptomatic', 
 'Symptomatic (+)': 'test_symptomatic_positive' 
    
}


def process_testing_report(fname, date):

    df = pd.read_excel(os.path.join(fname), skiprows=1)
    df.rename(columns=column_mapping, inplace=True)
    df2=df.iloc[1:26][column_mapping.values()]
    df2['date']=date
    
    return df2
    
    
if __name__ == "__main__":
    
    
    data_files = [{'filename': f, 'date_str': f[28:-5].replace('__','_')} for f in os.listdir('../data/DOC_downloads/') if f.endswith('.xlsx')]

    df=pd.DataFrame(data_files)
    df=df.set_index(pd.to_datetime(df['date_str'], format='%b_%d_%H:%M:%S_%Z_%Y'))
    
    new_filename = '../data/DOC_downloads/{}'.format(df.loc[df.index.max()]['filename'])
    new_date = df.index.max().strftime('%Y-%m-%d')
    
    new_df = process_testing_report(new_filename, new_date)


    agg_filename = '../data/latest_data/PA_DOC_testing_data.csv'


    agg = pd.read_csv(agg_filename).drop(columns='date.1')
    pd.concat([agg,new_df]).to_csv(agg_filename.replace('.csv','TESTING.csv'),index=False)

