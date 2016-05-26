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


var httpUploadFile2 = (url, file, type, size) => {
    let msgId = getMsgIdFromTimeStamp();
    let Client = require('./Client');
    var uploadMediaRequest = JSON.stringify({
        BaseRequest: Client.BaseRequest,
        ClientMediaId: msgId,
        TotalLen: size,
        StartPos: 0,
        DataLen: size,
        MediaType: 4
    });
    var FormData = require('form-data');
    var form = new FormData();
    form.append('id', 'WU_FILE_0');
    form.append('name', 'filename');
    form.append('type', 'image/png');
    form.append('lastModifieDate', new Date().toString());
    form.append('size', size);
    form.append('mediatype', 'pic');
    form.append('uploadmediarequest', uploadMediaRequest);
    form.append('webwx_data_ticket', Client.cookies.webwx_data_ticket);
    form.append('pass_ticket', encodeURI(Client.cookies.pass_ticket));
    form.append('filename', file, {
        filename: 'webstorm.png',
        contentType: 'image/png',
        knownLength: size
    });
    console.log('fetch:' + url);
    console.log('type:' + type);
    console.log('size:' + size);
  /*  fetch(url, { method: 'POST', body: form })
        .then(function(res) {
            console.log(res);
            return res.json();
        }).then(function(json) {
        console.log(json);
    });*/
    console.log(form);
    form.submit(url, function(err, res, body){
        console.log(err);
        console.log(res);
        console.log(body);
    });

  /*  console.log(form);
    request.post(url, {formData: form}, function(err, httpResponse, body){
        console.log(err);
        console.log(httpResponse);
        console.log(body);
    });*/
/*
    request({
        url: url,
        method: 'POST',
        params: params,
        data: form
    }).then(function(res){
        console.log(res);
        var mediaId = res.data.MediaId;
        if (!mediaId) {
            throw new Error('MediaId获取失败');
        }
        return mediaId;
    }).catch(function (err) {
        debug(err);
        throw new Error('上传图片失败');
    });*/
};


var httpUploadFile = (options, params, content, callback) => {
    options.method = 'POST';
    let url = require('url');
    let aUrl = url.parse(options.url);
    options.host = aUrl.host;
    options.path = aUrl.path;
    options.headers = options.headers || {};
    console.log(options);
    let endBoundary = params.endBoundary;
    console.log(params);
    let body = '';
    let http = require('http');
    let req = http.request(options, (resp)=>{
        resp.on('data', (chunk) => {
            console.log('data rev');
            body+= chunk;
        });
        resp.on('end', () => {
            console.log('statusCode:' + resp.statusCode);
            callback(null, body);
        });
    });
    req.on('error', (e) => {
       callback(e);
    });
    req.write(content);
    let fs = require('fs');
    let fileStream = fs.createReadStream(params.filePath);
    fileStream.pipe(req, {end: false});
    fileStream.on('end', () => {
        req.end(endBoundary);
    });
};

var getMsgIdFromTimeStamp = () =>{
    return new Date().getTime().toString() + getRandom(9999, 1000)
};

var getRandom = (max, min) =>{
    return Math.floor(Math.random() * (max - min)) + min
};



module.exports = {
    deviceId: gen_deviceid,
    formPost: formPost,
    httpGet: httpGet,
    httpUploadFile: httpUploadFile,
    getMsgIdFromTimeStamp: getMsgIdFromTimeStamp,
    httpUploadFile2: httpUploadFile2
};