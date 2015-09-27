/*Logger Declaration*/

var log4js = require('log4js');
// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('logs/adapCom.log'), 'adapCom');

var logger = log4js.getLogger('adapCom');

var _self = module.exports = {

    _AGE_CATEGORY_0: '<18', //kids
    _AGE_CATEGORY_1: '18-24', //young
    _AGE_CATEGORY_2: '25-34', //young
    _AGE_CATEGORY_3: '35-44', //middle-aged
    _AGE_CATEGORY_4: '45-54', //middle-aged
    _AGE_CATEGORY_5: '55-64', //old
    _AGE_CATEGORY_6: '>64', //old

    _GENDER_MALE: 'MALE',
    _GENDER_FEMALE: 'FEMALE',
    _GENDER_NEUTRAL: 'NEUTRAL',
    _GENDER_NOT_DETECTED: 'NOT_DETECTED',

    _AGE_GROUP_KIDS: 'KIDS',
    _AGE_GROUP_YOUNG: 'YOUNG',
    _AGE_GROUP_MIDDLE_AGED: 'MIDDLEAGED',
    _AGE_GROUP_OLD: 'OLD',
    _AGE_GROUP_NOT_DETECTED: 'NOT_DETECTED',

    parseRequestValues: function(params) {

        var url = params.url;
        var title = params.title;
        var thumbnailUrl = params.thumbnailUrl;
        var gender = params.gender;
        var minAge = params.minAge;
        var maxAge = params.maxAge;
        var locations = params.locations;
        var ageGroup = this.determineAgeGroup(minAge, maxAge);

        var docObject = {
            url: url,
            title: title,
            thumbnailUrl: thumbnailUrl,
            gender: gender,
            minAge: minAge,
            maxAge: maxAge,
            locations: locations,
            ageGroup: ageGroup
        };

        logger.debug(locations);
        return docObject;
    },

    determineAgeGroup: function(minAge, maxAge) {

        var ageGroup = '';

        if (minAge < 18) {
            ageGroup = _self._AGE_GROUP_KIDS;
        } else if (minAge < 24) {
            ageGroup = _self._AGE_GROUP_YOUNG;
        } else if (minAge < 35) {
            ageGroup = _self._AGE_GROUP_MIDDLE_AGED;
        } else if (minAge < 55) {
            ageGroup = _self._AGE_GROUP_OLD;
        } else {
            ageGroup = _self._AGE_GROUP_NOT_DETECTED;
            logger.debug("Posted Video Age Group : Not Detected");
        }

        return ageGroup;
    },

    getVideoConfigsForLocation: function(allDocs, locationId) {

        var responseDocs = [];

        allDocs.forEach(function(docObject) {
            var videoConfig = docObject.doc;

            videoConfig.locations.forEach(function(locationObj) {
                if (locationObj.id == locationId) {
                    responseDocs.push(videoConfig);
                    logger.debug("location match");
                }
            });

        });

        return responseDocs;
    },

    getVideoForGenderAndAgeGroup: function(responseObject, allDocs) {

        for (var i = 0; i < allDocs.length; i++) {

            var docObject = allDocs[i];
            var videoConfig = docObject.doc;

            if (videoConfig.ageGroup == responseObject.contentAgeGroup) {

                for (var j = 0; j < videoConfig.gender.length; j++) {

                    var genderObj = videoConfig.gender[j];

                    if (genderObj.label.toUpperCase() == responseObject.contentGender) {

                        return videoConfig.url;

                    } else if (responseObject.contentGender == 'NEUTRAL' && videoConfig.gender.length == 2) {

                        return videoConfig.url;

                    }
                }

            }
        }

        return 'NO_URL_MATCH';
    }

};

var video = {
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
    "minAge": "39",
    "maxAge": "29",
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
