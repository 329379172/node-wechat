/**
 * Created by linfeiyang on 5/25/16.
 */
var path = require('path');
var fs = require('fs');
/*var file = fs.openSync('/home/linfeiyang/Desktop/webstorm.png', 'r');*/
var file =fs.createReadStream('/home/linfeiyang/Desktop/webstorm.png');
/*var ext = path.extname('/home/linfeiyang/Desktop/webstorm.png');*/
console.log(file.size);