import subprocess
import re

# remove_custom_emoji
# 絵文字IDは読み上げない
def remove_custom_emoji(text):
    pattern = r'<:[a-zA-Z0-9_]+:[0-9]+>'    # カスタム絵文字のパターン
    return re.sub(pattern,'',text)   # 置換処理

# urlAbb
# URLなら省略
def urlAbb(text):
    pattern = "https?://[\w/:%#\$&\?\(\)~\.=\+\-]+"
    return re.sub(pattern,'URLは省略するのデス！',text)   # 置換処理

# creat_WAV
# message.contentをテキストファイルに書き込み
def creat_WAV(inputText):
        # message.contentをテキストファイルに書き込み

    inputText = remove_custom_emoji(inputText)   # 絵文字IDは読み上げない
    inputText = urlAbb(inputText)   # URLなら省略
    input_file = 'input.txt'

    with open(input_file,'w',encoding='utf-8') as file:
        file.write(inputText)

    command = 'open_jtalk -x {x} -m {m} -r {r} -ow {ow} {input_file}'

    #辞書のPath
    x = '/var/lib/mecab/dic/open-jtalk/naist-jdic'

    #ボイスファイルのPath
    m = '/usr/share/hts-voice/mei/mei_normal.htsvoice'
    #m = 'C:/open_jtalk/bin/mei/mei_sad.htsvoice'
    #m = 'C:/open_jtalk/bin/mei/mei_angry.htsvoice'
    #m = 'C:/open_jtalk/bin/mei/mei_bashful.htsvoice'
    #m = 'C:/open_jtalk/bin/mei/mei_happy.htsvoice'
    #m = 'C:/open_jtalk/bin/mei/mei_normal.htsvoice'

    #発声のスピード
    r = '1.0'

    #出力ファイル名　and　Path
    ow = 'output.wav'

    args= {'x':x, 'm':m, 'r':r, 'ow':ow, 'input_file':input_file}

    cmd= command.format(**args)
    print(cmd)

    subprocess.run(cmd, shell=True)
    return True

if __name__ == '__main__':
    creat_WAV('テスト')
