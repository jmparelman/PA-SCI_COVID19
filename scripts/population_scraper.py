import pandas as pd
from datetime import datetime
import pytz

date = datetime.now(pytz.timezone('US/Eastern'))
date_str = datetime.strftime(date,"%Y%m%d")

colmapper = {"INSTITUTION":"SCI",
            "TODAY'S POPULATION":"population",
            "REPRIEVE RELEASES":"reprieve_releases",
            "TODAY'S POPULATION AFTER REPRIEVE RELEASES":"population_after_reprieve",
            "INCREASE/ DECREASE FROM YESTERDAY":"population_change_one_day",
            "INCREASE/ DECREASE FROM LAST WEEK":"population_change_one_week",
            "INCREASE/ DECREASE FROM LAST MONTH":"population_change_one_month",
            "date":"date"}

html_frames = pd.read_html(f"https://web.archive.org/web/{date_str}/https:/www.cor.pa.gov/Pages/COVID-19.aspx")
for frame in html_frames:
    if frame.loc[0,0] == "INSTITUTION": # find population count frame

        # clean dataframe
        frame.columns = frame.loc[0]
        frame = frame.loc[1:,]
        frame.iloc[:,1:] = frame.iloc[:,1:].astype(float)
        frame['date'] = date
        frame = frame.rename(columns=colmapper)
        frame.to_csv(f'../data/Daily_Populations/Daily_Populations_{datetime.strftime(date,"%m-%d")}.csv',index=False)


agg = pd.read_csv("../data/latest_data/Daily_Populations_aggregated.csv")
new_df= pd.concat([agg,frame])

new_df.set_index(pd.to_datetime(new_df['date']))

new_df.to_csv("../data/latest_data/Daily_Populations_aggregated.csv")
