/* 
File name: app.js
Server: Node JS
*/
var cfenv = require("cfenv");

var fs = require('fs');
var express = require('express');
var nconf = require('nconf');
var path = require('path');

var bodyParser = require('body-parser');
var multer = require('multer');

global.__base = __dirname + '/';

//Application configuration environment file
nconf.argv()
    .env()
    .file({
        file: './config/app-config.json'
    });


// get the core cfenv application environment
var appEnv = cfenv.getAppEnv();
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));


/*Logger Declaration*/

var log4js = require('log4js');
// log4js.loadAppender('file');
// log4js.addAppender(log4js.appenders.file('logs/adapCom.log'), 'adapCom');

var logger = log4js.getLogger('adapCom');

/* setting encoding for response */

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(multer({
    dest: './images/uploads/',
}));


/*Router Declarations*/

var index = require(__dirname + '/routes/index'); //Generic routes
var alchemyRoutes = require(__dirname + '/routes/alchemy-routes');
var cloudantRoutes = require(__dirname + '/routes/cloudant-routes');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


/* Mapping the requests to routes (controllers) */

app.use('/', index); //Mapping for generic app requests
app.use('/alchemy', alchemyRoutes);
app.use('/cloudant', cloudantRoutes);



/*Top-level error handler for requests*/

app.use(function(err, req, res, next) {
    logger.debug("Error Block Executed!");
    logger.error(err.stack);

    var errObj = {
        // status: 500,
        error: true,
        errObj: err,
        // errorName: err.name,
        // errorType: err.type,
        errrorMessage: err.message,
        description: err.toString()
    };
    // var stringifiedResponse = JSON.stringify(errObj);

    res.status(500).json(errObj);
});



/* DB connection */

var db = require(__dirname + '/db/db-connect');
db.initDBConnection();


/*Starting the server*/
console.log(appEnv.bind);
// start the server, writing a message once it's actually started
app.listen(appEnv.port, function() {
    log("server starting on " + appEnv.url);
});

// logger.info('HTTP Server Initiated on port %s at %s : ', httpServer.address().port, httpServer.address().address);

function log(message) {
    logger.info(appEnv.name + " : " + message);
}
