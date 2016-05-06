/**
 * Created by linfeiyang on 3/1/16.
 */
'use strict';
var request = require('request');
var async = require('async');
var config = require('../../config');
var Util = require('../Util');
var log = require('../log');

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
                log.info("response statusCode = " + response.statusCode);
                if (response.statusCode != 200) return next(new Error('获取登录状态失败:' + response.statusCode));
                if (!body) return next(new Error('获取登录状态失败,body为空'));
                var window = {};
                eval(body);
                if (window.code == 408) {
                    next();
                } else if (window.code == 201) {
                    log.info('已扫描,请在手机上允许登录.');
                    tip = 0;
                    next();
                } else if (window.code == 200) {
                    log.info('允许登录成功');
                    Client.cookieUrl = window.redirect_uri;
                    Client.baseUri = Client.cookieUrl.substr(0, Client.cookieUrl.lastIndexOf('/'));
                    log.info('baseuri = ' + Client.baseUri);
                    ok = true;
                    next(ok);
                } else if (window.code == 400) {
                    log.info('超时重新获取');
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
        Client.BaseRequest = {
            Uin: Client.cookies.wxuin,
            Sid: Client.cookies.wxsid,
            Skey: Client.cookies.skey,
            DeviceID: Client.deviceId
        };
        var body = {
            BaseRequest: Client.BaseRequest
        };
        Util.formPost(Client.baseUri + '/webwxinit?r=' + Date.now() + '&pass_ticket=' + Client.cookies.pass_ticket +
            "&skey=" + Client.cookies.Skey, body, (err, res) => {
            if (err) return callback(err);
            let SyncKey = '';
            Client.SyncKeyObj = res.SyncKey;
            res.SyncKey.List.forEach((item) => {
                SyncKey+='|' + item.Key + '_' + item.Val;
            });
            Client.SyncKey = SyncKey;
            Client.User = res.User;
            callback();
        });
    };


};