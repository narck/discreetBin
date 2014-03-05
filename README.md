discreetBin
===========

lightweight pastebin for one-shot pastes

**discreetBin** is a pastebin-like service for passing information not intended for everyone.
Pastes are stored in volatile memory and no persistence model is supplied.
Once a paste has been viewed, it is immediately destroyed.

How-to
===========
To run **discreetBin**, you need a Redis server and node.js.

If you don't have Redis, you can install it directly from most package managers or compile it yourself.
The important part is to disable snapshots in `/etc/redis.conf` (if you're on OSX it's probably `/usr/local/etc/redis.conf`)
From there find the default snapshot lines:
```shell
save 900 1
save 300 10
save 60 10000
```
and comment them out with a leading #. Run Redis with `redis-server`. Redis typically runs at port `6379`. Note that this is configured by default in the node-redis Redis client, so you don't need to configure anything in node.js.

Follow this with 
```shell
git clone https://github.com/narck/discreetBin
cd discreetBin
node app.js
```
and you're good to go. By configuration, you're free to set a port in your environment.


Ideas + components
===========
* Client-side hashing
* Front: Express/Sass/Angular
* IP-filtering?
* Secret-questions/hashes
* SSL?
* More security?

written as part of the University of Helsinki node.js mid-term course
