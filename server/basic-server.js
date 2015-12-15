/* Import node's http module: */
var http = require("http");
var handler = require('./request-handler');
var express = require('express');
var app = express();
var url = require('url');


// Every server needs to listen on a port with a unique number. The
// standard port for HTTP servers is port 80, but that port is
// normally already claimed by another server and/or not accessible
// so we'll use a standard testing port like 3000, other common development
// ports are 8080 and 1337.
var port = 3000;

// routing paths with express
app.use(express.static('/Volumes/student/2015-11-chatterbox-server/client'));
app.get('/classes/*', handler.getMessages);
app.post('/classes/*', handler.postMessage);
app.options('*', handler.options);

var server = app.listen(port, function(){
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening on http://%s:%s', host, port);
});