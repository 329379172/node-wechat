/**
 * Created by linfeiyang on 3/2/16.
 */
"use strict";
var gen_deviceid = () => {
    let deviceId = 'e';
    for(var i = 0; i <= 15; i++){
        deviceId += Math.floor(10 * Math.random());
    }
    return deviceId;
};

module.exports = {
    deviceId: gen_deviceid
};