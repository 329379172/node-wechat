/**
 * Created by linfeiyang on 3/2/16.
 */
"use strict";
var request = require('request');
var async = require('async');
var config = require('../../config');
var Util = require('../Util');
var log = require('../log');
module.exports = (Client) => {
    Client.syncCheck = (callback) =>{
        async.forever((next) => {
            var url = config.webpush_url + "/synccheck?r=" + (Date.now() + Math.round(Math.random() * 5) + '&skey=' + Client.cookies.skey +
                '&uin=' + Client.cookies.wxuin + '&sid=' + Client.cookies.wxsid + '&deviceid=' + Client.deviceId +
                '&synckey=' + Client.SyncKey + '&_=' + Date.now());
            async.waterfall([
                (next) => {
                    Client.cookie = Client.cookie || request.jar();
                    var tmpRequest = request.defaults({jar: Client.cookie});
                    tmpRequest.get(url, (err, httpResponse, body) => {
                        if (err) return callback(err);
                        next(null, body);
                    });
                },
                (body, next) => {
                    if(!body) return next(new Error('async error, body is empty!~'));
                    try {
                        var window = {};
                        eval(body);
                        if(!window.synccheck) return next(new Error('async error, parse body fail,' + body));
                        var retcode = window.synccheck.retcode;
                        var selector = window.synccheck.selector;
                        log.info('retcode:' + retcode);
                        if(retcode == 1100) return next();
                        if(retcode == 0) {
                            log.info('selector:' + selector);
                            switch (~~selector){
                                case 2:
                                    log.info('有消息啦...');
                                    Client.getMessage((err, res) => {
                                        if(err) return next(err);
                                        res.forEach(function(item){
                                            if(item.MsgType == 1){
                                                Client.sendMessage({ToUserName: item.FromUserName}, (err) => {
                                                    if(err) log.error(err);
                                                });
                                            }
                                        });
                                        next();
                                    });
                                    break;
                                case 7:
                                    next();
                                    break;
                                case 6:
                                    next();
                                    break;
                                case 3:
                                    next();
                                    break;
                                case 0:
                                    next();
                                    break;
                                case 1101:
                                    Client.errorCount++;
                                    next(new Error('发现错误的状态码1101,请重新登录.'));
                                    break;
                                default:
                                    log.info('default');
                                    next();
                            }
                            Client.errorCount = 0;
                        } else {
                            setTimeout(next, 1000);
                        }
                    } catch (e) {
                        if(Client.errorCount >=5){
                            return next(e);
                        } else {
                            log.error(e);
                            Client++;
                            setTimeout(next, 1000);
                        }
                    }
                }
            ],(err) => {
                if(err) {
                    log.info('over' + err);
                    return next(err);
                }
                next();
            });
        }, function(err){
            callback(err);
        });
    };

};