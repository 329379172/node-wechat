/**
 * Created by linfeiyang on 3/2/16.
 */
var config = {
    uuidUrl: 'https://login.weixin.qq.com/jslogin?appid=wx782c26e4c19acffb&fun=new&lang=zh_CN&_' + Date.now(),
    qrcodeUrl: 'https://login.weixin.qq.com/qrcode/',
    loginUrl: 'https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&r=' + ~Date.now() + '&_='
                + Date.now() + '&',
    retryTimes: 5,
    usersUrl: 'https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact',
    webpush_url: "https://webpush.weixin.qq.com/cgi-bin/mmwebwx-bin"
};

module.exports = config;