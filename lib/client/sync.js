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
                        if (err) return next(err);
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
                            switch (~~selector){
                                case 2:
                                    log.info('有消息啦...');
                                    Client.getMessage((err, res) => {
                                        if(err) return next(err);
                                        if(!!res && res.length > 0){
                                            res.forEach(function(item){
                                                if(item.MsgType == 1){
                                                    if(!!Client.plugins){
                                                        Client.plugins.forEach((p) => {
                                                            p.run(item, (err, result)=>{
                                                                log.info('plugin-' + p.name + ',error:' + err + 'result:' + result);
                                                            });
                                                        });
                                                    }
                                                    log.info('昵称 = ' + Client.getUserName(item.FromUserName));
                                                    log.info('内容 = ' + item.Content);
                                                    next();
                                                } else if(item.MsgType == 51){
                                                    log.info('忽略的消息类型,MsgType=51');
                                                 //   log.info('用户在手机上操作了');
                                                    next();
                                                }
                                            });
                                        } else {
                                            log.info('忽略的消息类型,没有具体的消息内容');
                                            //log.info('用户在手机上操作了');
                                            next();
                                        }
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
                                    next(new Error('发现错误的状态码1101,请重新登录.'));
                                    break;
                                default:
                                    log.info('default');
                                    next();
                            }
                            Client.errorCount = 0;
                        } else {
                            next(new Error("返回的状态码不正确,retcode=" + retcode));
                        }
                    } catch (e) {
                        next(e);
                    }
                }
            ],(err) => {
                if(err) {
                    Client.errorCount++;
                    if(Client.errorCount >=5){
                        Client.errorCount = 0;
                        return next(new Error("错误次数过多,请重新登录"));
                    } else {
                        log.info('发现错误,进行下次重试,' + err.message);
                        return next();
                    }
                }
                setTimeout(next, 1000);
            });
        }, function(err){
            callback(err);
        });
    };

};
