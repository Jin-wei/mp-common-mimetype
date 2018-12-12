/**
 * Created by ling xue on 15-12-29.
 */
var commonUtil = require('mp-common-util');
var sysMsg = commonUtil.systemMsg;
var sysError = commonUtil.systemError;
var resUtil = commonUtil.responseUtil;
var imageDao = require('../dao/ImageDAO.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('Image.js');
var ReturnType = require('mp-common-util').ReturnType;
var Seq = require('seq');

/**
 * get image file by image object id
 */
function getImageSetById(req, res, next) {
    var params = req.params;
    var imageId = params.imageId;
    var size = params.size;
    if (imageId==null){
        return next(sysError.MissingParameterError("imageId is missing", "imageId is missing"));
    }
    if (size==null){
        return next(sysError.MissingParameterError("size is missing", "size is missing"));
    }
    return _getImageById(imageId,size,req,res,next);
}

function _getImageById(imageId,size,req,res,next){
    imageDao.getMetaData(imageId, {size: size}, function (err, col) {
        if (err || !col) {
            logger.error(' getImageById ' + sysMsg.IMG_QUERY_NO_EXIST + imageId);
            return resUtil.resImageNotFoundError(err, res, next);
        }

        if (col.secure){
            //it is a secure image, can not retrieve by unsecure method
            return resUtil.resNoAuthorizedError(null, res, next);
        }

        var etag = req.headers['if-none-match'];
        if (etag && col.md5 && etag == col.md5) {
            res.send(304);
            return next();
        }

        imageDao.getImage(imageId, {size: size}, function (err, fstream) {
            if (err) {
                logger.error(' getImageById ' + err.message);
                return resUtil.resImageNotFoundError(err, res, next);
            }

            res.cache({maxAge: 31536000});
            //res.set("cache-control","no-cache");
            res.set('content-type', col.contentType);
            res.set('last-modified', col.uploadDate);
            res.set('etag', col.md5);
            res.set('content-length', col.length);
            res.writeHead(200);
            fstream.pipe(res);
            fstream.once('end', function () {
                logger.info(' getImageById ' + 'success');
                next(false);
            });
        });
    })
}

function getImageById(req, res, next) {
    var params = req.params;
    var imageId = params.imageId;
    if (imageId==null){
        return next(sysError.MissingParameterError("imageId is missing", "imageId is missing"));
    }
    return _getImageById(imageId,null,req,res,next);
}

/**
 * upload user id image,return image id
 */
function uploadImage(req, res, next) {
    var params = req.params,tenant=params.tenant;
    var image = req.files.image;
    var metaData = {}, result = {};
    logger.info("req.files.image:"+req.files.image);
    if (tenant == null) {
        return resUtil.resTenantNotFoundError(null, res, next);
    }
    if (!req.files || ! req.files.image){
        return next(sysError.MissingParameterError("no image found in form data","no image found in form data"));
    }

    metaData.filename = image.name;
    metaData.user_id = params.authUser.userId;
    metaData.tenant = params.tenant;

    metaData.secure=false;
    logger.info("req.files.image:"+req.files.image);
    imageDao.saveImage(null,req.files.image, metaData, function (error, path) {
        if (error) {
            logger.error(' uploadImage ' + error.message);
            return next(sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG));
        } else {
            logger.info(' uploadUserIdImage ' + ' success ');
            result.insertId = path;
            resUtil.resetCreateRes(res, result, null);
            return next();
        }
    })
}
function uploadImageOther(req, res, next) {
    var params = req.params,tenant=params.tenant;
    var image = req.files.image;
    var metaData = {}, result = {};
    if (tenant == null) {
        return resUtil.resTenantNotFoundError(null, res, next);
    }
    if (!req.files || ! req.files.image){
        return next(sysError.MissingParameterError("no file found in form data","no file found in form data"));
    }

    metaData.filename = image.name;
    metaData.user_id = params.authUser.userId;
    metaData.tenant = params.tenant;

    metaData.secure=false;
    imageDao.saveFileOther(null,req.files.image, metaData, function (error, path) {
        if (error) {
            logger.error(' uploadImageOther ' + error.message);
            return next(sysError.InternalError(error.message, sysMsg.SYS_INTERNAL_ERROR_MSG));
        } else {
            logger.info(' uploadImageOther ' + ' success ');
            result.insertId = path;
            result.filename = req.files.image.name;
            // resUtil.resetCreateRes(res, result, null);
            res.send(200,{success : true,id:result.insertId,fileName:req.files.image.name});
            return next();
        }
    })
}
/**
 * upload image in three size, large medium and small
 * @param req
 * @param res
 * @param next
 */
function uploadImageSet(req, res, next) {
    var params = req.params,tenant=params.tenant;
    var image = req.files.image;
    var metaData = {}, result = {};
    if (tenant == null) {
        return resUtil.resTenantNotFoundError(null, res, next);
    }
    if (!req.files || ! req.files.image){
        return next(sysError.MissingParameterError("no image found in form data","no image found in form data"));
    }

    metaData.filename = image.name;
    metaData.user_id = params.authUser.userId;
    metaData.tenant = params.tenant;
    metaData.secure=false;


    imageDao.saveImageSet(null, image, metaData, function (error, path) {
        if (error) {
            logger.error(' uploadImage ' + error.message);
            return resUtil.resInternalError(error, res, next);
        } else {
            result.insertId = path;
            resUtil.resetCreateRes(res, result, null);
            return next();
        }
    })
}

/**
 * delete images in three size, large medium and small
 * @param req
 * @param res
 * @param next
 */
function deleteImageSet(req, res, next) {
    var params = req.params,tenant=params.tenant,imageIds=params.imageIds,result=[];

    if (tenant == null) {
        return resUtil.resTenantNotFoundError(null, res, next);
    }
    if (imageIds == null) {
        return next(sysError.MissingParameterError("imageIds is missing", "imageIds is missing"));
    }
    Seq(imageIds).seqEach(function(imageId,i){
        var that=this;
        _deleteImageSet(tenant,imageId,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        resUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _deleteImageSet(tenant, imageId,callback){
    imageDao.deleteImgSet({tenant:tenant,imageId:imageId},function(error){
        if (error){
            return callback(new ReturnType(false,error.message,imageId));
        }
        return callback(new ReturnType(true,null, imageId));
    });
}

/**
 * delete images
 * @param req
 * @param res
 * @param next
 */
function deleteImage(req, res, next) {
    var params = req.params,tenant=params.tenant,imageIds=params.imageIds,result=[];

    if (tenant == null) {
        return resUtil.resTenantNotFoundError(null, res, next);
    }
    if (imageIds == null) {
        return next(sysError.MissingParameterError("imageIds is missing", "imageIds is missing"));
    }
    Seq(imageIds).seqEach(function(imageId,i){
        var that=this;
        _deleteImage(tenant,imageId,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        resUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _deleteImage(tenant, imageId,callback){
    imageDao.deleteImg({tenant:tenant,imageId:imageId},function(error){
        if (error){
            return callback(new ReturnType(false,error.message,imageId));
        }
        return callback(new ReturnType(true,null, imageId));
    });
}
function getConnectState(req,res,next){
    res.send(200,{success: true});
}
module.exports = {
    getConnectState:getConnectState,
    getImageSetById: getImageSetById,
    uploadImageSet: uploadImageSet,
    deleteImageSet: deleteImageSet,
    getImageById: getImageById,
    uploadImage: uploadImage,
    deleteImage: deleteImage,
    uploadImageOther:uploadImageOther
}
