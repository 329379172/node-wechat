/**
 * Created by linfeiyang on 3/1/16.
 */
'use strict';
var Client = require('./lib/Client');
var async = require('async');
var log = require('./lib/log');

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
            Client.cookie((err) => {
                if (err) return next(err);
                log.info('登录成功,开始初始化程序...');
                next();
            });
        },
        (next) => {
            Client.init(next);
        }
    ], (err) => {
        log.error(err);
        next();
    });
});



