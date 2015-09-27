var express = require('express');
var router = express.Router();

var fs = require('fs');
var im = require('imagemagick');

/*Logger Declaration*/

var log4js = require('log4js');
// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('logs/adapCom.log'), 'adapCom');

var logger = log4js.getLogger('adapCom');


/* Include various endpoints for making requests */

var apiEndpoint = require(__base + 'lib/face-detection/endpoint-calls.js');
var responseHandler = require(__base + 'lib/face-detection/response-handler.js');

var db = require(__base + '/db/db-connect');


/* Mapping for default request */

router.get('/', function(req, res) {
    res.send('Alchemy default page');
});

router.get('/imageUploadPage', function(req, res) {
    res.render('imageUploadPage');
});

router.post('/processImage', function(req, res, next) {
console.log("heeeloe")
    var image = req.files.image;
    var srcImagePath = __base + req.files.image.path;
    var desImagePath = __base + 'images/resized/' + req.files.image.name;

    // logger.debug('Source path : ' + srcImagePath);
    // logger.debug('Dest path : ' + desImagePath);

    /*var im = require('imagemagick');
    im.identify(req.files.image.path, function(imageError, features) {
        if (imageError) {
            logger.error("Error reading image");
            return;
        }
        res.json(features);
        // { format: 'JPEG', width: 3904, height: 2622, depth: 8 }
    });*/
console.log("1")
    var resizeOptions = {
        width: 600,
        height: 500,
        srcPath: srcImagePath,
        dstPath: desImagePath
    };
    console.log(im);
    console.log(resizeOptions);
    // resize uploaded image
    try{


    im.resize(resizeOptions, function(imgResizeErr) {
        console.log("two")
        if (imgResizeErr) {
            next(imgResizeErr);
        }
        console.log("three")
        logger.debug("Image resize complete");

        // delete source image after resize
        fs.unlink(srcImagePath, function(fileDelErr) {
            if (fileDelErr) {
                return next(fileDelErr);
            }
            console.log("four");
            logger.info('source image deleted successfully');
        });

        // read resized image
        fs.readFile(desImagePath, function(fileReadErr, imageData) {

            if (fileReadErr) {
                return next(fileReadErr);
            }
            console.log("five");
            // send resized image to api
            apiEndpoint.processImage(imageData, function(apiErr, apiResponse) {

                // delete resized image after sending to api
                fs.unlink(desImagePath, function(fileDelErr) {
                    if (fileDelErr) next(fileDelErr);
                    logger.info('resized image deleted successfully');
                });

                if (apiErr) {
                    return next(apiErr);
                }
                console.log("six")
                // get all docs from DB
                db.getAllVideoConfigDocsFromDB(function(err, allDocs) {
                    if (err) {
                        return next(err);
                    }
                    console.log("seven");
                    // parse the api response and all docs from DB and build response to mobile request
                    responseHandler.getFaceDetectionResult(apiResponse, allDocs, function(resProcessErr, responseData) {

                        if (resProcessErr) {
                            return next(resProcessErr);
                        }
                        res.json(responseData.contentUrl);

                    });
                });




            });

        });
    });
 }
    catch(e){
        console.log("Error:"+e);
    }


});

module.exports = router;
