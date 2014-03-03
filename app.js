/* REQUIRES */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();


/* CONFIGURATION */
app.use(express.urlencoded());
app.use(express.json());

app.set('port', process.env.PORT || 8080 );
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/* ROUTES */

app.get('/', function(req, res) {
	res.sendfile('./views/index.html');
});

app.post('/create', function(req, res){
	var data = req.body.kek;
    console.log(data);
    res.redirect('/');
});

