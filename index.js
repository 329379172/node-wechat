/**
 * Created by linfeiyang on 3/1/16.
 */
'use strict';
var Client = require('./lib/Client');
var async = require('async');
var log = require('./lib/log');
var dockerPlugin = require('./lib/plugin/Docker');
Client.plugins = Client.plugins || [];
Client.plugins.push(dockerPlugin);
async.forever((next) => {
    async.waterfall([
        (next) => {
            Client.qrcode((err) => {
                if (err) return next(err);
                log.info('二维码地址:'　+　Client.qrcodeImage);
                next();
            });
        },
        (next) => {
            Client.login((err, result) => {
                if (err) return next(err);
                if (!result) return next(new Error('login fail'));
                next();
            });
        },
        (next) => {
            Client.getCookie((err) => {
                if (err) return next(err);
                log.info('登录成功,开始初始化程序...');
                next();
            });
        },
        (next) => {
            Client.init((err) => {
                if(err) return next(err);
                log.info('初始化程序成功,Nickme:' + Client.User.NickName + ',开始开启微信状态通知');
                next();
            });
        },
        (next) => {
            Client.statusNotify((err) => {
                if(err) return next(err);
                log.info('开启微信状态通知成功,开始获取用户信息');
             next();
            });
        },
        (next) => {
            Client.loadUser((err) => {
                if(err) return next(err);
                log.info('获取用户信息成功,用户数量:' + Client.users.length);
                next();
            });
        },
        (next) => {
            Client.syncCheck((err) => {
                if(err) return next(err);
                next();
            });
        }
    ], (err) => {
        log.error(err);
        next();
    });
});



