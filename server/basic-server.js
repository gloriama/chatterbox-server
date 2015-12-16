var cluster = require('cluster');
/* Import node's http module: */
var http = require("http");
var handler = require('./request-handler');
var express = require('express');
var app = express();
var fs = require('fs');
var url = require('url');
var _ = require('../node_modules/underscore/underscore.js');


// Every server needs to listen on a port with a unique number. The
// standard port for HTTP servers is port 80, but that port is
// normally already claimed by another server and/or not accessible
// so we'll use a standard testing port like 3000, other common development
// ports are 8080 and 1337.

// --- master code ---
if (cluster.isMaster) {
  //read messagesData from local file, if file exists
  var messagesFile = "messages.json";
  var messagesFileContents = fs.readFileSync(messagesFile, 'utf8');
  var messagesData = messagesFileContents.length ? JSON.parse(messagesFileContents) : [];
  var workers = [];
  //initialize workers
  var numWorkers = require('os').cpus().length;
  for (var i = 0; i < numWorkers; i++) {
    var worker = cluster.fork();
    workers.push(worker);
    worker.send(messagesData); // master sends messagesData to worker
    
    // when receiving message from worker, process and re-broadcast to all workers
    worker.on('message', function(message) {
      //save to messagesData
      messagesData.unshift(message);
      //save to messagesFile
      fs.writeFile(messagesFile, JSON.stringify(messagesData), 'utf8', function(err) {
        if (err) {
          throw err;
        }
        console.log("Master: Message from worker " + worker.process.pid + " saved to messages.json");
      });
      //broadcast messagesData to all workers
      _.each(workers, function(worker) {
        worker.send(messagesData);
      });
    });
  }

  cluster.on('online', function(worker) {
    console.log('Worker ' + worker.process.pid + ' is online');
  });

  cluster.on('exit', function(worker, code, signal) {
    console.log('Worker ' + worker.process.pid +
                ' died with code: ' + code +
                ', and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
  });



// --- worker code ---
} else {
	var started = false;

  // on receiving messages from the master process, start server
  process.on('message', function(msg) {
    //console.log('Worker ' + process.pid + ' received message from master.', msg);
    handler.setMessagesData(msg);
    
    if (!started) {
      // routing paths with express
      app.use(express.static('/Volumes/student/2015-11-chatterbox-server/client'));
      app.get('/classes/*', handler.getMessages);
      app.post('/classes/*', handler.postMessage);
      app.options('*', handler.options);

      // --- start server
      var port = 3000;
    	var server = app.listen(port, function(){
    	  var host = server.address().address;
    	  var port = server.address().port;
    	  console.log('Worker ' + process.pid + ': Listening on http://%s:%s', host, port);
    	});

      started = true;
    }

  });


}