/**
 * Created by linfeiyang on 5/6/16.
 */

//Client.plugins = Client.plugins || [];
//Client.plugins.push();
"use strict";
var log = require('../log');
var Docker = require('dockerode');
var Client = require('../Client');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
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
                let command = content.replace('docker', '').trim();
                if(command == 'ps'){
                    docker.listContainers((err, containers) => {
                        let ids = '';
                        containers.forEach(function (containerInfo) {
                            ids += containerInfo.Id + '\n';

                        });
                        Client.sendMessage({ToUserName: message.FromUserName, Content: ids}, (err) => {
                            if(err) log.error(err);
                            callback(null, 'ok')
                        });
                    });
                    return;
                }
                callback(null, 'ok');
            }
        }
        callback(null, '忽略此插件');
    }

};

module.exports = dockerPlugins;