/**
 * Created by ling xue on 2016/3/2.
 */

var sysConfig = require('../config/SystemConfig.js');
var serverLogger = require('mp-common-util').serverLogger;

function createLogger(name ){

    return serverLogger.createLogger(name,sysConfig.loggerConfig);
}

///-- Exports

module.exports = {
    createLogger : createLogger
};

