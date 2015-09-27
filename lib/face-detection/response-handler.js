/*Logger Declaration*/

var log4js = require('log4js');
// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('logs/adapCom.log'), 'adapCom');

var logger = log4js.getLogger('adapCom');

var videoLogic = require(__base + '/db/video-logic');

var _self = module.exports = {

    _STATUS_OK: 'OK',

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

    /*numberOfMales: 0,
    numberOfFemales: 0,

    numberOfKids: 0,
    numberOfYoung: 0,
    numberOfMidleAged: 0,
    numberOfOld: 0,*/

    /*responseContent: {
        contentGender: '',
        contentAgeGroup: '',
        contentUrl: ''
    },
*/
    getFaceDetectionResult: function(apiResponse, allDocs, callback) {
        logger.debug("Response Received!");

        var countObject = {
            numberOfMales: 0,
            numberOfFemales: 0,

            numberOfKids: 0,
            numberOfYoung: 0,
            numberOfMidleAged: 0,
            numberOfOld: 0,

            responseContent: {
                contentGender: '',
                contentAgeGroup: '',
                contentUrl: ''
            },
        };
        var parsedApiResponse = JSON.parse(apiResponse);
        var status = parsedApiResponse.status;

        if (status != _self._STATUS_OK) {
            logger.error("Response Status not OK!");
            return callback(new Error('Status not OK'));
        }

        logger.debug("Response Status OK!");

        var imageFaces = parsedApiResponse.imageFaces;

        // when no face is detected
        if (imageFaces.length == 0) {
            logger.debug("No face detected");

            var noFaceResponseObject = {
                contentGender: _self._GENDER_NOT_DETECTED,
                contentAgeGroup: _self._AGE_GROUP_NOT_DETECTED,
                contentUrl: videoLinks[_self._GENDER_NOT_DETECTED][_self._AGE_GROUP_NOT_DETECTED]
            };
            //success callback
            return callback(null, noFaceResponseObject);

        }

        // when one/more face detected
        imageFaces.forEach(function(item) {

            if (item.gender.gender == _self._GENDER_MALE) {
                countObject.numberOfMales++;
            } else {
                logger.debug(countObject.numberOfFemales);
                countObject.numberOfFemales++;
            }

            if (item.age.ageRange == _self._AGE_CATEGORY_0) {
                countObject.numberOfKids++;
            } else if (item.age.ageRange == _self._AGE_CATEGORY_1 || item.age.ageRange == _self._AGE_CATEGORY_2) {
                countObject.numberOfYoung++;
            } else if (item.age.ageRange == _self._AGE_CATEGORY_3 || item.age.ageRange == _self._AGE_CATEGORY_4) {
                countObject.numberOfMidleAged++;
            } else if (item.age.ageRange == _self._AGE_CATEGORY_5 || item.age.ageRange == _self._AGE_CATEGORY_6) {
                countObject.numberOfOld++;
            }

        });

        var responseObject = _self.resolveContentToDeliver(countObject);

        var responseVideoUrl = videoLogic.getVideoForGenderAndAgeGroup(responseObject, allDocs);

        if (responseVideoUrl != 'NO_URL_MATCH') {
            responseObject.contentUrl = responseVideoUrl;
        } else {
            logger.debug('default URL picked');
        }

        logger.debug("resolved gender for content : " + responseObject.contentGender);
        logger.debug("resolved age group for content : " + responseObject.contentAgeGroup);
        logger.debug("resolved url : " + responseObject.contentUrl);

        //success callback
        callback(null, responseObject);
    },

    resolveContentToDeliver: function(countObject) {

        logger.debug("Number of males : " + countObject.numberOfMales);
        logger.debug("Number of females : " + countObject.numberOfFemales);

        if (countObject.numberOfMales > countObject.numberOfFemales) {

            countObject.responseContent.contentGender = _self._GENDER_MALE;

        } else if (countObject.numberOfMales < countObject.numberOfFemales) {

            countObject.responseContent.contentGender = _self._GENDER_FEMALE;

        } else {

            countObject.responseContent.contentGender = _self._GENDER_NEUTRAL;

        }

        logger.debug("Number of kids : " + countObject.numberOfKids);
        logger.debug("Number of young : " + countObject.numberOfYoung);
        logger.debug("Number of middle-aged : " + countObject.numberOfMidleAged);
        logger.debug("Number of old : " + countObject.numberOfOld);

        var maxCount = Math.max(countObject.numberOfKids, countObject.numberOfYoung, countObject.numberOfMidleAged, countObject.numberOfOld);

        logger.debug("Max count : " + maxCount);

        if (maxCount == countObject.numberOfKids) {

            countObject.responseContent.contentAgeGroup = _self._AGE_GROUP_KIDS;

        } else if (maxCount == countObject.numberOfYoung) {

            countObject.responseContent.contentAgeGroup = _self._AGE_GROUP_YOUNG;

        } else if (maxCount == countObject.numberOfMidleAged) {

            countObject.responseContent.contentAgeGroup = _self._AGE_GROUP_MIDDLE_AGED;

        } else if (maxCount == countObject.numberOfOld) {

            countObject.responseContent.contentAgeGroup = _self._AGE_GROUP_OLD;

        }

        var resolvedGender = countObject.responseContent.contentGender;
        var resolvedAgeGroup = countObject.responseContent.contentAgeGroup;

        countObject.responseContent.contentUrl = videoLinks[countObject.responseContent.contentGender][countObject.responseContent.contentAgeGroup];


        var responseObject = {
            contentGender: countObject.responseContent.contentGender,
            contentAgeGroup: countObject.responseContent.contentAgeGroup,
            contentUrl: countObject.responseContent.contentUrl
        };

        return responseObject;
    }
};

var videoLinks = {
    MALE: {
        KIDS: 'https://www.youtube.com/watch?v=3zeVvIHVHYw',
        YOUNG: 'https://www.youtube.com/watch?v=D-CCI-fGKcY',
        MIDDLEAGED: 'https://www.youtube.com/watch?v=GzBNsU6EODI',
        OLD: 'https://www.youtube.com/watch?v=d16KAEwFvvk'
    },
    FEMALE: {
        KIDS: 'https://www.youtube.com/watch?v=TpuRIJnya5E',
        YOUNG: 'https://www.youtube.com/watch?v=TYfZmnb9KNs',
        MIDDLEAGED: 'https://www.youtube.com/watch?v=rTlLoQHDOIg',
        OLD: 'https://www.youtube.com/watch?v=2dpPhXwwYhQ'
    },
    NEUTRAL: {
        KIDS: 'https://www.youtube.com/watch?v=CaZvKLYZW9Y',
        YOUNG: 'https://www.youtube.com/watch?v=CaZvKLYZW9Y',
        MIDDLEAGED: 'https://www.youtube.com/watch?v=CaZvKLYZW9Y',
        OLD: 'https://www.youtube.com/watch?v=CaZvKLYZW9Y'
    },
    NOT_DETECTED: {
        NOT_DETECTED: 'NO_FACE_DETECTED'
    }
};

/*var videoLinks = {
    MALE: {
        KIDS: 'M_kidsURL',
        YOUNG: 'M_youngURL',
        MIDDLEAGED: 'M_middleagedURL',
        OLD: 'M_oldURL'
    },
    FEMALE: {
        KIDS: 'F_kidsURL',
        YOUNG: 'F_youngURL',
        MIDDLEAGED: 'F_middleagedURL',
        OLD: 'F_oldURL'
    }
};*/
