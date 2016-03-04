/**
 * Created by linfeiyang on 3/2/16.
 */
'use strict';
var request = require('request');
var config = require('../../config');
var parser = require('xml2json');


module.exports = (Client) => {

    /**
     * get login cookie
     * @param callback
     */
    Client.cookie = (callback) => {
        request(Client.cookieUrl + '&fun=new&version=v2&lang=zh_CN', (error, response, body) => {
            if (error) return callback(error);
            if (response.statusCode != 200) return callback(new Error('获取cookie失败,返回状态码:' + response.statusCode));
            if (!body) return callback(new Error('获取cookie失败,body为空'));
            //console.log(body);
            var cookies = JSON.parse(parser.toJson(body));
            if(!cookies) return callback(new Error('解析cookie失败'));
            //console.log(cookies.error);
            if(typeof cookies.error == 'string'){
                return callback(new Error('获取cookie失败:' + cookies.error));
            }
            if(~~cookies.error.ret > 0){
                return callback(new Error('获取cookie失败'));
            }
            Client.cookies = {
                skey: cookies.error.skey,
                wxsid: cookies.error.wxsid,
                wxuin: cookies.error.wxuin,
                pass_ticket: cookies.error.pass_ticket,
                isgrayscale: cookies.error.isgrayscale
            };
            callback();
        });
    };

};