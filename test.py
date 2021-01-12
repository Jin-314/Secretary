import os
from discord.ext import commands
import discord
import logging
import requests
import json
import numpy as np

BOT_PREFIX = ('!!')

client = commands.Bot(command_prefix=BOT_PREFIX)

activity = discord.Activity(name='テストモード', type=discord.ActivityType.playing)

formatter = '%(asctime)s:%(levelname)s:%(name)s: %(message)s'

logging.basicConfig(filename='/var/log/Maindiscord.log', level=logging.DEBUG, format=formatter)
logger = logging.getLogger('discord')

def getLatitude(city_name):
    key = os.environ.get("API_KEY_Y")
    url = "https://map.yahooapis.jp/geocode/V1/geoCoder?appid=" + key + "&output=json&query=" + city_name

    response = requests.get(url)
    data = response.json()

    print(url)

    return data["Feature"][0]["Geometry"]["Coordinates"]

@client.command(description="後に続く数の和を求めます。",
                brief="数の合計")
async def add(ctx, *num: float):
    await ctx.send(np.sum(num))

@client.command(description="お天気を出します。",
                brief="お天気")
async def weather(ctx, city_name):

    latitudeList = getLatitude(city_name).split(",")
    key = os.environ.get("API_KEY")
    url = "http://api.openweathermap.org/data/2.5/weather?APPID=" + key + "&lat=" + latitudeList[1] + "&lon=" + latitudeList[0] + "&units=metric"

    response=requests.get(url)
    data=response.json()
    data=json.loads(response.text)

    print(url)
    imgurl = "http://openweathermap.org/img/w/" + data["weather"][0]["icon"] + ".png"

    embed = discord.Embed(title=city_name+"のお天気情報",color=0xff7f50)
    embed.set_image(url=imgurl)
    embed.add_field(name="天気",value=data["weather"][0]["main"])
    embed.add_field(name="気温",value=data["main"]["temp"])
    embed.add_field(name="気圧",value=data["main"]["pressure"])
    embed.add_field(name="湿度",value=data["main"]["humidity"])
    embed.add_field(name="最高気温",value=data["main"]["temp_max"])
    embed.add_field(name="最低気温",value=data["main"]["temp_min"])

    await ctx.send(embed=embed)

@client.event
async def on_message(message):
    await client.process_commands(message)

    #Botとメッセージの送信者が同じ場合は何もしない
    if client.user == message.author:
        return
    if message.content.startswith("こんにちは"):
        m = "こんにちは！" + message.author.name + "さん！\n"
        await message.channel.send(m)

@client.event
async def on_command_error(ctx, error):
    print(error)

@client.event
async def on_ready():
    logger.info('ユーザー名：' + client.user.name)
    logger.info('ユーザーid：' + str(client.user.id))
    await client.change_presence(activity=activity)

client.run(os.environ.get("DISCORD_TOKEN"))
