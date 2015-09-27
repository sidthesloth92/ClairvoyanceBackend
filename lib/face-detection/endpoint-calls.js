var http = require('http');
var https = require('https');
var request = require('request');
var fs = require('fs');
/*Logger Declaration*/

var log4js = require('log4js');
// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('logs/adapCom.log'), 'adapCom');

var logger = log4js.getLogger('adapCom');


var utils = require(__base + 'lib/utils/utils.js');


/* Include various endpoint reuqests */
module.exports = {

    processImage: function(imageData, callback) {

        var url = "http://access.alchemyapi.com/calls/image/ImageGetRankedImageFaceTags";

        /*var imageURL = "http://epilepsyu.com/wp-content/uploads/2014/01/happy-people.jpg";
        var encodedImageURL = encodeURI(imageURL);
        logger.debug(encodedImageURL);*/

        var propertiesObject = {
            apikey: 'ee77045e661830e351dbb41b0c7885da55e2ad39',
            imagePostMode: 'raw',
            outputMode: 'json'
        };

        var contentLength = imageData.length;

        request({
            headers: {
                'Content-Type': "application/x-www-form-urlencoded",
                'Content-Length': contentLength
            },
            uri: url, //URL goes here
            qs: propertiesObject,
            body: imageData,
            method: 'POST'
        }, function(err, res, body) {
            //Check for error
            if (err) {
                //returning the error as response in json
                logger.error("request error");
                return callback(err);
            }

            //Check for right status code
            if (res.statusCode !== 200) {
                //returning custom error
                return callback(new Error("AlchemyAPIResponseError"));
            }

            //success callback
            callback(null, body);
        });

    },

    // Another way to make http requests
    processImageAlternate: function(imageData, callback) {

        var params = "apikey=ee77045e661830e351dbb41b0c7885da55e2ad39&imagePostMode=raw&outputMode=json";
        var queryPath = "/calls/image/ImageGetRankedImageFaceTags?" + params;

        var contentLength = imageData.length;
        logger.debug("contentLength : " + contentLength);

        var options = {
            host: "access.alchemyapi.com",
            path: queryPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': contentLength
            },
        };
        var req = http.request(options, function(res) {

            //Check for right status code
            if (res.statusCode !== 200) {
                //returning custom error
                logger.error("status !200");
                logger.error("Status : " + res.statusCode);
                return callback(new Error("AlchemyAPIResponseError"));
            }
            var data = "";
            res.on('data', function(chunk) {
                logger.debug("Response received");
                data += chunk;
            });
            res.on('end', function() {
                //success callback
                logger.debug("response end");
                callback(null, data);
            });
        });

        //Check for error
        req.on('error', function(err) {
            //returning the error as response in json
            logger.error("request error");
            return callback(err);
        });
        req.write(imageData);
        req.end();

    }

};
