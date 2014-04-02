/* REQUIRES */
var express = require('express');
var http = require('http');
var crypto = require('crypto');
var jade = require('jade');
var url = require('url');
var app = express();
var redis = require("redis"),
        client = redis.createClient();

/* CONFIGURATION */
app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'jade');
app.set('views', __dirname+'/views/');

app.set('port', process.env.PORT || 8080 );
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/* ROUTES */

app.get('/', function(req, res) {
	res.render('index');
});

app.get('/paste/create', function(req, res) {
	res.render('create');
});

app.post('/paste/create', function(req, res){
	crypto.randomBytes(48, function(err, buffer) {

		// hash the key, no need for decryption
		var token = buffer.toString('base64');
		var hash = crypto.createHmac('sha1', token).update(req.body.paste).digest('hex');
		var key = hash.substring(0,7);

		var value = req.body.paste;

		client.set(key, value, redis.print);
		client.get(key, function (err, reply) {
			console.log(reply.toString());
			var fullUrl = 'http://' + req.get('host');
			res.render('create', {message: key, url: fullUrl});
		});
	});
});

app.get("/paste/show/:id?", function (req, res) {
	client.get(req.params.id, function(err, reply) {
		if (req.params.id === undefined) {
			res.render('show', {message: ''});
		} else if (reply === null) {
			res.render('show', {message: 'Paste ' + req.params.id + ' not found ;_;'});
		} else {
			client.del(req.params.id, redis.print);
			res.render('show', {paste: reply.toString()});
		}
	});
});

app.post("/paste/show", function(req, res) {
	client.get(req.body.search, function(err, reply) {
		if (reply === null) {
			res.render('show', {message: 'Paste ' + req.body.search + ' not found. ;_;'});
		} else {
			client.del(req.body.search, redis.print);
			res.render('show', {paste: reply.toString()});
		}
	});
});
