/**
 * Created by linfeiyang on 3/2/16.
 */
'use strict';
var request = require('request');
var async = require('async');
var config = require('../../config');

module.exports = (Client) => {

    /**
     * get login qrcode
     * @param callback
     */
    Client.qrcode = (callback) => {
        async.waterfall([
            (next) => {
                request(config.uuidUrl
                    , (error, response, body) => {
                        if (error) return next(error);
                        if (response.statusCode != 200) return next(new Error('获取uuid失败,返回状态码:' + response.statusCode));
                        if (!body) return next(new Error('获取uuid失败,body为空'));
                        var window = {QRLogin: {}};
                        eval(body);
                        if (window.QRLogin.code != 200) {
                            return next(new Error('获取uuid erroerror msg:' + window.QRLogin.error));
                        }
                        next(null, window.QRLogin.uuid);
                    })
            },
            (uuid, next) => {
                if (!uuid) return next(new Error('uuid is null'));
                Client.uuid = uuid;
                Client.qrcodeImage = config.qrcodeUrl + uuid + '?t=webwx';
                request(Client.qrcodeImage, () => {
                    next();
                });
            }
        ], (err) => {
            callback(err);
        });
    };

};

