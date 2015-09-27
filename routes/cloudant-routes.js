var express = require('express');
var router = express.Router();

var fs = require('fs');
var im = require('imagemagick');

/*Logger Declaration*/

var log4js = require('log4js');
// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('logs/adapCom.log'), 'adapCom');

var logger = log4js.getLogger('adapCom');

var db = require(__base + '/db/db-connect');
var videoLogic = require(__base + '/db/video-logic');


/* Mapping for default request */

router.get('/', function(req, res, next) {
    res.send('Cloudant default page');
});

router.get('/listdb', function(req, res, next) {

    db.listAllDB(function(err, alldb) {
        if (err) {
            next(err);
        }
        res.send(alldb);
    });

});

router.get('/createdb', function(req, res, next) {

    db.createDB(function(err) {
        if (err) {
            return next(err);
        }
        res.send("Create DB");
    });

});

router.get('/deletedb', function(req, res, next) {

    db.deleteDB(function(err) {
        if (err) {
            return next(err);
        }
        res.send("Delete DB");
    });

});

router.get('/insertdoc', function(req, res, next) {

    db.insertDocIntoDB(function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });

});

router.get('/updatedoc', function(req, res, next) {

    db.updateDocInDB(function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });

});

router.get('/getdoc', function(req, res, next) {

    db.getDocFromDB(function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });

});

router.get('/deletedoc', function(req, res, next) {

    db.deleteDocFromDB(function(err) {
        if (err) {
            return next(err);
        }
        res.send("delect doc");
    });

});

/*router.get('/setVideoConfig', function(req, res, next) {

    db.insertVideoConfigDocIntoDB(params, function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});*/

/*router.get('/updateVideoConfig', function(req, res, next) {

    var urlText = req.query.urltext;
    var url = req.query.url;
    var urlThumbnail = req.query.urlthumbnail;
    var gender = req.query.gender;
    var ageGroup = req.query.agegroup;
    var location = req.query.location;

    var params = {
        urlText: urlText,
        url: url,
        urlThumbnail: urlThumbnail,
        gender: gender,
        ageGroup: ageGroup,
        location: location
    };

    logger.debug('URL Text : ' + urlText);
    logger.debug('URL : ' + url);
    logger.debug('Gender : ' + gender);
    logger.debug('Age group : ' + ageGroup);
    logger.debug('Location : ' + location);

    db.updateVideoConfigDocIntoDB(params, function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });

});*/

router.post('/sampleVideoPost', function(req, res, next) {

    var url = "http://localhost:6004/cloudant/insertVideoConfig";

    var item = {
        "url": "https://www.youtube.com/embed/r3Hpjtr8_z8",
        "title": "title",
        "thumbnailUrl": "http://img.youtube.com/vi/r3Hpjtr8_z8/0.jpg",
        "gender": [{
            "id": 1,
            "value": "M",
            "label": "Male",
            "icon": "ion-man",
        }, {
            "id": 2,
            "value": "F",
            "label": "Female",
            "icon": "ion-woman",
        }],
        "minAge": "29",
        "maxAge": "39",
        "locations": [{
            "id": 2,
            "label": "Near Shopping Malls",
            "icon": "ion-bag",
        }, {
            "id": 5,
            "label": "Near Airports",
            "icon": "ion-plane",
        }]
    };
    var propertiesObject = {
        item: JSON.stringify(item)
    };
    var request = require('request');

    request({
        uri: url + '?item=' + JSON.stringify(item), //URL goes here
        method: 'POST'
    }, function(err, response, body) {
        //Check for error
        if (err) {
            //returning the error as response in json
            logger.error("request error");
            return next(err);
        }

        //Check for right status code
        if (res.statusCode !== 200) {
            //returning custom error
            return next(new Error("SampleVideoPostError"));
        }

        res.json(JSON.parse(body));
    });

});

router.post('/insertVideoConfig', function(req, res, next) {

    var params = JSON.parse(req.query.item);
    logger.debug(req.query);
    var docObject = videoLogic.parseRequestValues(params);

    db.insertVideoConfigDocIntoDB(docObject, function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });

});

router.get('/getVideoConfigForLocation', function(req, res, next) {

    var locationId = req.query.locationId;

    db.getVideoConfigForLocationFromDB(locationId, function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });

});

router.get('/getAllVideoConfig', function(req, res, next) {

    db.getAllVideoConfigDocsFromDB(function(err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });

});

module.exports = router;
