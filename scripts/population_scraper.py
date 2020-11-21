import pandas as pd
import urllib
from datetime import datetime
import os
import glob

date = datetime.today()
date_str = datetime.strftime(date,"%Y%m%d")

html_frames = pd.read_html(f"https://web.archive.org/web/{date_str}/https:/www.cor.pa.gov/Pages/COVID-19.aspx")
for frame in html_frames:
    if frame.loc[0,0] == "INSTITUTION": # find population count frame

        # clean dataframe
        frame.columns = frame.loc[0]
        frame = frame.loc[1:,]
        frame.iloc[:,1:] = frame.iloc[:,1:].astype(float)
        frame['date'] = date
        frame.to_csv(f'../data/Daily_Populations/Daily_Populations_{datetime.strftime(date,"%m-%d")}.csv',index=False)


agg = pd.read_csv("../data/Daily_Populations/Daily_Populations_aggregated.csv")
pd.concat([agg,frame]).to_csv("../data/Daily_Populations/Daily_Populations_aggregated.csv",index=False)