/* REQUIRES */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var crypto = require('crypto');
var jade = require('jade');
var app = express();

var redis = require("redis"),
        client = redis.createClient();

/* CONFIGURATION */
app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'jade');
app.set('views', __dirname+'/views/');


/* RESET REDIS */


app.set('port', process.env.PORT || 8080 );
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


/* ROUTES */

app.get('/', function(req, res) {
	res.render('index', {title: 'edit your blog'})
});

app.get('/create', function(req, res) {
	res.render('create');
});

app.post('/create', function(req, res){
	crypto.randomBytes(48, function(err, buffer) {
		var token = buffer.toString('base64');
		var hash = crypto.createHmac('sha1', token).update(req.body.paste).digest('hex');

		client.set(hash, req.body.paste, redis.print);
		client.get(hash, function (err, reply) {
			console.log(reply.toString());
			// render success message
			res.render('create', {message: 'Paste successfully created. Your hash is ' + hash});
			//res.end('Your hash is ' + hash);
		});
	});
});

app.get("/show/:id?", function (req, res) {
	client.get(req.params.id, function(err, reply) {
		if (reply 	=== null) {
			res.render('show', {message: 'Paste not found! :('});
		} else if (req.params.id === undefined) {
			res.render('show', {message: 'Paste not lel! :('});
		} else {
			client.del(req.params.id, redis.print);
			res.render('show', {paste: reply.toString()});
			//res.send("The key value = "+reply.toString());	
		};
	});
});

app.post("/show", function(req, res) {


})