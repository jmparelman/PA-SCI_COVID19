
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
 'Positive.1': 'incarcerated_person_positive',
 'Negative.1': 'incarcerated_person_negative',
 'Pending.1': 'incarcerated_person_pending',
 'Death*.1': 'incarcerated_person_death',
 'Recovered.1': 'incarcerated_person_recovered',
    
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

def add_deltas(all_data):
    doc2_df = all_data.copy()
    doc2_df=doc2_df.drop(columns='date').reset_index()

    print(doc2_df.head())

    exclude_cols = ['SCI', 'date', 'date.1']

    cols_to_use = [c for c in doc2_df.columns if c not in exclude_cols]

    for col in cols_to_use:
       print('Calculating delta for', col)
       doc2_df[f'{col}_new'] = doc2_df.groupby('SCI')[col].diff()
    
    doc2_df=doc2_df.set_index(doc2_df['date'])

    return doc2_df


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
   
    agg = pd.read_csv(agg_filename)

    cols_to_drop = [c for c in agg.columns if c.endswith('_new') or c.endswith('_D') or c=='date.1']

    agg = agg.drop(columns=cols_to_drop)

    new_df = pd.concat([agg,new_df])

    new_df=new_df.set_index(pd.to_datetime(new_df['date']))

    new2_df = add_deltas(new_df)

    new2_df.to_csv(agg_filename,index=False)
