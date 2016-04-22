/**
 * Created by linfeiyang on 3/2/16.
 */
"use strict";
var request = require('request');
var gen_deviceid = () => {
    let deviceId = 'e';
    for(var i = 0; 15 > i; i++){
        deviceId += Math.floor(10 * Math.random());
    }
    return deviceId;
};

var formPost = (url , body, callback) => {
    var Client = require('./Client');
    var options = {
        url: url,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(body)
    };
    Client.cookie = Client.cookie || request.jar();
    var tmpRequest = request.defaults({jar: Client.cookie});
    tmpRequest.post(options, (err, httpResponse, body)=> {
        if (err) return callback(err);
        try {
            var bodyJson = JSON.parse(body);
            if (bodyJson.BaseResponse.Ret == 0) {
                callback(null, bodyJson);
            } else {
                return callback(new Error("初始化失败,错误代码:") + bodyJson.BaseResponse.Ret);
            }
        } catch (e) {
            return callback(e);
        }
    });
};

var httpGet = (url, callback) => {
    var Client = require('./Client');
    Client.cookie = Client.cookie || request.jar();
    var tmpRequest = request.defaults({jar: Client.cookie});
    tmpRequest.get(url, (err, httpResponse, body) => {
        console.log(body);
        if (err) return callback(err);
        try {
            var bodyJson = JSON.parse(body);
            if (bodyJson.BaseResponse.Ret == 0) {
                callback(null, bodyJson);
            } else {
                return callback(new Error("初始化失败,错误代码:") + bodyJson.BaseResponse.Ret);
            }
        } catch (e) {
            return callback(e);
        }
    });
};


module.exports = {
    deviceId: gen_deviceid,
    formPost: formPost,
    httpGet: httpGet
};