/**
 * Created by linfeiyang on 3/1/16.
 */
'use strict';
var request = require('request');
var async = require('async');
var config = require('../../config');
var Util = require('../Util');

module.exports = (Client) => {

    /**
     * process login
     * @param callback
     */
    Client.login = (callback) => {
        var ok = '';
        var tip = 1;
        async.forever((next) => {
            var url = config.loginUrl + 'uuid=' + Client.uuid + '&tip=' + tip;
            request(url, (error, response, body) => {
                if (error) return next(error);
                if (response.statusCode != 200) return next(new Error('获取登录状态失败:' + response.statusCode));
                if (!body) return next(new Error('获取登录状态失败,body为空'));
                var window = {};
                eval(body);
                if (window.code == 408) {
                    next();
                } else if (window.code == 201) {
                    console.log('已扫描,请在手机上允许登录.');
                    tip = 0;
                    next();
                } else if (window.code == 200) {
                    console.log('允许成功');
                    Client.cookieUrl = window.redirect_uri;
                    ok = true;
                    next(ok);
                } else if (window.code == 400) {
                    console.log('超时重新获取');
                    next(new Error('登录超时'));
                }
            });
        }, () => {
            callback(null, ok);
        });
    };

    /**
     * init login
     * @param callback
     */
    Client.init = (callback) => {
        Client.deviceId = Util.deviceId();
        console.log(Client.deviceId);
        request.post({url: config.initUrl, form: {
            BaseRequest:{
                Uin: Client.wxuin,
                Sid: Client.wxsid,
                Skey: Client.skey,
                DeviceID: Client.deviceId
            }
        }}, (err, httpResponse, body)=> {
            console.log(body);
            callback();
        });
    };

};