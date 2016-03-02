/**
 * Created by linfeiyang on 3/1/16.
 */
'use strict';
var Client = require('./lib/Client');
var async = require('async');

async.forever((next) => {
    async.waterfall([
        (next) => {
            Client.qrcode((err) => {
                if (err) return next(err);
                console.log(Client.qrcodeImage);
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
                console.log(err);
                if (err) return next(err);
                console.log('登录成功');
                next();
            });
        },
        (next) => {
            Client.init(next);
        }
    ], (err) => {
        console.log(err);
        next();
    });
});



