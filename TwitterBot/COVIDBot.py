import requests
import json
import datetime
import tweepy
import os

client = tweepy.Client(os.environ.get("TW_BEARER_TOKEN"), os.environ.get("TW_CONSUMER_KEY"), os.environ.get("TW_CONSUMER_SECRET"), os.environ.get("TW_ACCESS_TOKEN"), os.environ.get("TW_ACCESS_TOKEN_SECRET"))

urlPatient = "https://data.corona.go.jp/converted-json/covid19japan-npatients.json"
urlDeath = "https://data.corona.go.jp/converted-json/covid19japan-ndeaths.json"
responsePatient = requests.get(urlPatient)
responseDeath = requests.get(urlDeath)
dataPatient = responsePatient.json()
dataDeath = responseDeath.json()
dataPatient = json.loads(responsePatient.text)
dataDeath = json.loads(responseDeath.text)

idxPatient = len(dataPatient) - 1
idxDeath = len(dataDeath) - 1
dt=datetime.datetime.strptime(dataPatient[idxPatient]["date"], '%Y-%m-%d')

txt = "全国の"+dt.strftime('%Y年%m月%d日')+"のCOVID情報\n"
txt += "累計感染者数は"+str(dataPatient[idxPatient]["npatients"])+"人で、1日で"+str(dataPatient[idxPatient]["adpatients"])+"人増えました。\n"
txt += "死者数の累計は"+str(dataDeath[idxDeath]["ndeaths"])+"人で、1日で"+str(dataDeath[idxDeath]["ndeaths"]-dataDeath[idxDeath-1]["ndeaths"])+"人増えました。\n"
txt += "内閣官房データ https://corona.go.jp/dashboard/ より\n"

client.create_tweet(text=txt)