
var loggerConfig = {
    level : '@@logLevel',
    config : {
        appenders: [
            { type: 'console' },
            {
                "type": "file",
                "filename": "@@logFileFullName",
                "maxLogSize": @@logMaxSize,
                "backups": @@logBackups
            }
        ]
    }
}

var mongoConfig = {
    connect : '@@mongoConnect'
}

var loginModuleUrl = {
    host: "@@loginHost",
    port: @@loginPort,
    protocol: "@@loginProtocol"
}
module.exports = {
    loggerConfig : loggerConfig,
    mongoConfig : mongoConfig ,
    loginModuleUrl : loginModuleUrl
}
