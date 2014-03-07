/* REQUIRES */
var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');
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

		// hash the key, no need for decryption
		var token = buffer.toString('base64');
		var hash = crypto.createHmac('sha1', token).update(req.body.paste).digest('hex');
		var key = hash.substring(0,7);

		//hash the value
		var value = encrypt(req.body.paste);

		client.set(key, value, redis.print);
		client.get(key, function (err, reply) {
			console.log(reply.toString());
			var fullUrl = 'http://' + req.get('host');
			res.render('create', {message: key, url: fullUrl});
		});
	});
});

app.get("/show/:id?", function (req, res) {
	client.get(req.params.id, function(err, reply) {
		if (req.params.id === undefined) {
			res.render('show', {message: ''});
		} else if (reply === null) {
			res.render('show', {message: 'Paste ' + req.params.id + ' not found ;_;'});
		} else {
			client.del(req.body.search, redis.print);
			res.render('show', {paste: decrypt(reply.toString())});
		}
	});
});

app.post("/show", function(req, res) {
	client.get(req.body.search, function(err, reply) {
		if (reply === null) {
			res.render('show', {message: 'Paste ' + req.body.search + ' not found. ;_;'});
		} else {
			client.del(req.body.search, redis.print);
			res.render('show', {paste: decrypt(reply.toString())});
		}
	});
});


app.get("/test", function(req, res) {
	res.render('test');

});

app.post("/test", function(req, res) {
	console.log(req.body.fname)
	client.set("asd", req.body.fname, redis.print);
	client.get("asd", function(err, reply) {
		res.render('test', {message: reply})
	});
	
});


/* FUNCTIONS */
 
// remove this
// add pw salt
function encrypt(text){
  var cipher = crypto.createCipher('aes-256-cbc','d6F3Efeq')
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-cbc','d6F3Efeq')
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}