/*Logger Declaration*/

var log4js = require('log4js');
// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('logs/adapCom.log'), 'adapCom');
var logger = log4js.getLogger('adapCom');

var cloudant_connect = require('cloudant');

var videoLogic = require(__base + '/db/video-logic');

var cloudant;

var db;

var dbCredentials = {
    dbName: 'clairvoyance_db'
};

module.exports = {

    initDBConnection: function() {

        if (process.env.VCAP_SERVICES) {

            var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
            if (vcapServices.cloudantNoSQLDB) {
                dbCredentials.host = vcapServices.cloudantNoSQLDB[0].credentials.host;
                dbCredentials.port = vcapServices.cloudantNoSQLDB[0].credentials.port;
                dbCredentials.user = vcapServices.cloudantNoSQLDB[0].credentials.username;
                dbCredentials.password = vcapServices.cloudantNoSQLDB[0].credentials.password;
                dbCredentials.url = vcapServices.cloudantNoSQLDB[0].credentials.url;
            }
            console.log('VCAP Services: ' + JSON.stringify(process.env.VCAP_SERVICES));

        } else {

            dbCredentials.host = 'f09f3f04-3b6b-453c-b4c3-d7eb04eae9db-bluemix.cloudant.com';
            dbCredentials.port = '443';
            dbCredentials.user = 'f09f3f04-3b6b-453c-b4c3-d7eb04eae9db-bluemix';
            dbCredentials.password = 'fdf0046b2366061d7984fe57c5abcc830f60e13244a89c5f882a0eb53e0d6be4';
            dbCredentials.url = 'https://f09f3f04-3b6b-453c-b4c3-d7eb04eae9db-bluemix:fdf0046b2366061d7984fe57c5abcc830f60e13244a89c5f882a0eb53e0d6be4@f09f3f04-3b6b-453c-b4c3-d7eb04eae9db-bluemix.cloudant.com';

        }

        // cloudant = require('cloudant')(dbCredentials.url);

        cloudant_connect(dbCredentials.url, function(dbCreateError, cloudant_connected) {
            if (dbCreateError) {
                return logger.error('Error connecting to Cloudant account: %s', dbCreateError.message);
            }

            logger.debug('db connected successfully');
            cloudant = cloudant_connected;

            cloudant.db.list(function(err, all_dbs) {

                logger.debug('All my databases: %s', all_dbs.join(', '));

            });


        });
        //check if DB exists if not create
        /*cloudant.db.create(dbCredentials.dbName, function(err, res) {

            if (err) {
                logger.error('could not create db ', err);
            }

            logger.debug('db created successfully');

        });*/

    },

    // will run only after initDBConnection
    listAllDB: function(callback) {

        db.list(function(err, all_dbs) {

            var alldb = all_dbs.join(', ');
            logger.debug('All my databases: %s', alldb);
            callback(null, alldb);

        });

    },

    setDB: function(callback) {

        db = cloudant.use(dbCredentials.dbName);

    },

    createDB: function(callback) {

        cloudant.db.create(dbCredentials.dbName, function(err, body) {

            if (err) {
                logger.error('could not create db');
                return callback(err);
            }

            logger.debug('db created successfully');
            callback(null);
        });

    },

    deleteDB: function(callback) {

        cloudant.db.destroy(dbCredentials.dbName, function(err) {

            if (err) {
                logger.error('delete db failed ');
                return callback(err);
            }

            logger.debug('db destroyed successfully');
            callback(null);
        });

    },

    insertDocIntoDB: function(callback) {

        this.setDB();

        db.insert({
            myKey: 'myValue'
        }, 'myDocument', function(err, body) {
            if (err) {
                logger.error('insert document failed ');
                return callback(err);
            }
            logger.debug('insert document successful');
            // logger.debug(body);
            callback(null, body);
        });

    },

    updateDocInDB: function(callback) {

        this.setDB();

        db.get('myDocument', {
            revs_info: true
        }, function(err, body) {

            if (err) {
                logger.error('get document for update failed ');
                return callback(err);
            }
            logger.debug('get document for update successful');
            logger.debug(body);
            var latestRev = body._rev;

            db.insert({
                myKey: 'myNewValue',
                _rev: latestRev
            }, 'myDocument', function(err, body) {
                if (err) {
                    logger.error('insert document for update failed ');
                    return callback(err);
                }
                logger.debug('insert document for update successful');
                // logger.debug(body);
                callback(null, body);
            });

        });

    },

    getDocFromDB: function(callback) {

        this.setDB();

        db.get('myDocument', {
            revs_info: true
        }, function(err, body) {

            if (err) {
                logger.error('get document failed ');
                return callback(err);
            }
            logger.debug('get document successful');
            // logger.debug(body);
            callback(null, body);
        });

    },

    deleteDocFromDB: function(callback) {

        this.setDB();

        db.get('myDocument', {
            revs_info: true
        }, function(err, body) {

            if (err) {
                logger.error('get document for delete failed ');
                return callback(err);
            }
            logger.debug('get document for delete successful');
            logger.debug(body);
            var latestRev = body._rev;

            db.destroy('myDocument', body._rev, function(err, body) {

                if (err) {
                    logger.error('delete document failed ');
                    return callback(err);
                }

                logger.debug('delete document successful');
                logger.debug(body);
                callback(null);

            });

        });

    },

    insertVideoConfigDocIntoDB: function(docObject, callback) {

        this.setDB();

        var docTitle = docObject.url;
        db.insert(docObject, docTitle, function(err, body) {
            if (err) {
                logger.error('insert videoConfig failed ');
                return callback(err);
            }

            logger.debug('insert videoConfig successful');
            logger.debug(body);
            callback(null, body);
        });

    },

    /*updateVideoConfigDocIntoDB: function(docObject, callback) {

        this.setDB();

        var docTitle = docObject.title;

        db.get(docTitle, {
            revs_info: true
        }, function(err, body) {

            if (err) {
                logger.error('get videoConfig for update failed ');
                return callback(err);
            }
            logger.debug('get videoConfig for update successful');
            logger.debug(body);
            var latestRev = body._rev;

            db.insert(docObject, 'VideoConfig', function(err, body) {
                if (err) {
                    logger.error('insert videoConfig for update failed ');
                    return callback(err);
                }
                logger.debug('insert videoConfig for update successful');
                // logger.debug(body);
                callback(null, body);
            });

        });

    },*/

    /*getVideoConfigDocFromDB: function(docObject, callback) {

        this.setDB();
        var docTitle = docObject.title;

        db.get('myDocument', {
            revs_info: true
        }, function(err, body) {

            if (err) {
                logger.error('get document failed ');
                return callback(err);
            }
            logger.debug('get document successful');
            // logger.debug(body);
            callback(null, body);
        });

    },*/

    getAllVideoConfigDocsFromDB: function(callback) {

        this.setDB();

        db.list({
            include_docs: true
        }, function(err, body) {

            if (err) {
                logger.error('get all docs failed ');
                return callback(err);
            }
            logger.debug('get all docs successful');

            var allDocs = [];

            body.rows.forEach(function(doc) {
                allDocs.push(doc);
                // logger.debug(doc);
            });
            // logger.debug(body);
            callback(null, allDocs);

        });

    },

    getVideoConfigForLocationFromDB: function(locationId, callback) {

        this.setDB();

        db.list({
            include_docs: true
        }, function(err, body) {

            if (err) {
                logger.error('get all docs failed ');
                return callback(err);
            }
            logger.debug('get all docs successful');

            var allDocs = [];

            body.rows.forEach(function(doc) {
                allDocs.push(doc);
                // logger.debug(doc);
            });
            // logger.debug(body);

            var responseDocs = videoLogic.getVideoConfigsForLocation(allDocs, locationId);
            callback(null, responseDocs);

        });

    },

};
