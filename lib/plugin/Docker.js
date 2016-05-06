/**
 * Created by linfeiyang on 5/6/16.
 */

//Client.plugins = Client.plugins || [];
//Client.plugins.push();
"use strict";
var log = require('../log');

let dockerPlugins = {
    name: 'docker',
    isInit : false,
    init: function(){
        if(this.isInit) return;
        log.info("docker plugins init");
        this.isInit = true;
    },
    run : function(message, callback){
        if(typeof message == 'object'){
            let content = message.Content;
            log.info('content=' + content);
            if(content && content.startsWith('docker ')) {
                log.info('条件满足,执行插件');
                callback(null, 'ok');
            }
        }
        callback(null, '忽略此插件');
    }

};

module.exports = dockerPlugins;