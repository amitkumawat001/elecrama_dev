var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Config = require('./Config');
var api = require('./routes/api');
var index = require('./routes/index');
var users = require('./routes/users');
var winston = require('winston');
winston.log('info', 'Hello distributed log files!');
winston.info('Hello again distributed logs'); 
winston.level = 'debug';
winston.log('debug', 'Now my debug messages are written to console!');
winston.configure({
    transports: [
      new (winston.transports.File)({ filename: 'elecrama.log' })
    ]
});
var app = express();

//Check Server
var MONGO_DB_URI = Config.dbConfig.mongodbURI.development;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb',extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// MongoDB Connection 
var dbUrl = MONGO_DB_URI;
mongoose.connect(dbUrl, function(err,res){
	if(err){
		console.log('DB connection failed ' +err)
	}else{
		console.log('DB connection successfull ' +dbUrl)
	}
});
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
const SimpleNodeLogger = require('simple-node-logger'),
    opts = {
        logFilePath:'elecrama.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    },
log = SimpleNodeLogger.createSimpleLogger( opts );
app.use('/api', api);
app.get('/docs/v1',function(req,res){
  res.render('docs');
});
app.get('/upload',function(req,res){
  res.render('img_upload');
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  //console.log();
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  
  console.log(err);
  if(err.status == 404){
    res.status(200).json({success:false, message:'Sorry, but this URL is not found !'})
  }else{
    res.status(err.status || 500);
    res.render('error')
  }
});

module.exports = app;
