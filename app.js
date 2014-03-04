/* REQUIRES */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var app = express();

var redis = require("redis"),
        client = redis.createClient();

/* CONFIGURATION */
app.use(express.urlencoded());
app.use(express.json());

app.set('port', process.env.PORT || 8080 );
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var redisErrorHandle = function() {
	client.on("error", function (err) {
		res.send("Redis error"); 
	});
};

/* ROUTES */

app.get('/', function(req, res) {
	res.sendfile('./views/index.html');
});

app.get('/create', function(req, res) {
	res.sendfile('./views/create.html');
});

app.post('/create', function(req, res){
	crypto.randomBytes(48, function(err, buffer) {
		var token = buffer.toString('base64');
		var hash = crypto.createHmac('sha1', token).update(req.body.paste).digest('hex');

		client.set(hash, req.body.paste, redis.print);
		client.get(hash, function (err, reply) {
			console.log(reply.toString());
			res.end('Your hash is ' + hash);
		});
	});
});

app.get("/show/:id?", function (req, res) {
	client.get(req.params.id, function(err, reply) {
		if (reply===null || req.params.id === undefined) {
			res.end("Please supply a valid id!");
		} else {
			client.del(req.params.id, redis.print);
			res.send("The key value = "+reply.toString());	
		};
	});
});