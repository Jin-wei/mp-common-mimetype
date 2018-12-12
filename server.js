// Copyright (c) 2012 Mark Cavage. All rights reserved.

var commonUtil =require('mp-common-util');
var authHeaderParser = commonUtil.authHeaderParser;
var authCheck = commonUtil.authCheck;
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Server.js');
var listOfValue = require('./util/ListOfValue.js');
var sysConfig = require('./config/SystemConfig.js');
var restify = require('restify');
var image = require('./bl/Image.js');

function createServer() {


    var server = restify.createServer({

        name: 'Common_mimetype',
        version: '1.0.0'
    });

    var authUrl=sysConfig.loginModuleUrl.protocol+"://"+sysConfig.loginModuleUrl.host+":"+sysConfig.loginModuleUrl.port+"/api/auth/tokens";


    server.pre(restify.pre.sanitizePath());
    server.pre(restify.pre.userAgentConnection());
    server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true
    }));
    restify.CORS.ALLOW_HEADERS.push('tenant');
    restify.CORS.ALLOW_HEADERS.push('auth-token');
    restify.CORS.ALLOW_HEADERS.push('client-id');
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Origin");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Credentials");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods","GET");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods","POST");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods","PUT");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods","DELETE");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Headers","accept,api-version, content-length, content-md5,x-requested-with,content-type, date, request-id, response-time");
    server.use(restify.CORS());
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.fullResponse());
    server.use(restify.bodyParser({uploadDir:__dirname+'/uploads/'}));
    server.use(authHeaderParser.authHeaderParser({logger:logger,authUrl:authUrl}));

    var STATIS_FILE_RE = /\.(css|js|jpe?g|png|gif|less|eot|svg|bmp|tiff|ttf|otf|woff|pdf|ico|json|wav|ogg|mp3?|xml|pak)$/i;
    server.get(/\/apidoc\/?.*/, restify.serveStatic({
        directory: './public'
    }));
    //secure image upload and retrieval
    //server.get('/api/user/:userId/image/:imageId',image.getImageById);
    //server.post({path:'/api/user/:userId/image',contentType: 'multipart/form-data'},image.uploadImage);

    server.get('/api/sizes/:size/imageSets/:imageId',image.getImageSetById);

    server.post({path:'/api/imageSets',contentType: 'multipart/form-data'},authCheck.authCheck(listOfValue.PERMISSION_UPLOADIMAGE),image.uploadImageSet);
    server.del({path:'/api/imageSets',contentType: 'application/json'},authCheck.authCheck(listOfValue.PERMISSION_DELETEIMAGE),image.deleteImageSet);
    server.get('/api/images/:imageId',image.getImageById);

    server.post({path:'/api/images',contentType: 'multipart/form-data'},authCheck.authCheck(listOfValue.PERMISSION_UPLOADIMAGE),image.uploadImage);
    server.post({path:'/api/imagesOther',contentType: 'multipart/form-data'},authCheck.authCheck(listOfValue.PERMISSION_UPLOADIMAGE),image.uploadImageOther);
    server.del({path:'/api/images',contentType: 'application/json'},authCheck.authCheck(listOfValue.PERMISSION_DELETEIMAGE),image.deleteImage);

    server.get('/api/getConnectState',image.getConnectState);
    return (server);
}



///--- Exports

module.exports = {
    createServer: createServer
};