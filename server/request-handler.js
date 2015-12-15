/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var _ = require('../node_modules/underscore/underscore.js');
var messagesData = [];
var messagesURL = '/classes/';

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept, x-parse-application-id, x-parse-rest-api-key",
  "access-control-max-age": 10 // Seconds.
};

var headers = defaultCorsHeaders; //headers that will be used on all responses
headers['Content-Type'] = 'application/json';


// handle OPTIONS request
exports.options = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  response.writeHead(200, headers);
  response.end();
}

// handle message GET and POST request
exports.getMessages = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);

  var roomName = request.url.substring(messagesURL.length);

  //filter messages by room name
  var filteredData = _.filter(messagesData, function(message){
    return (message.roomname === roomName);
  });

  response.writeHead(200, headers);
  response.end(JSON.stringify({results:filteredData}));
}

// handle POST request
exports.postMessage = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);

  var roomName = request.url.substring(messagesURL.length);

  request.on('data', function(data){
    //process request to save it to our messages:
    var message = JSON.parse(data);
    //want to transform data from request into an object of this form:
    // {
      // "createdAt":"2015-12-14T22:24:12.224Z", //what time we received the POST request for that message
      // "objectId":"kOUTA3rBsc",
      // "opponents":{"__type":"Relation","className":"Player"},
      // "roomname":"4chan",
      // "text":"trololo",
      // "updatedAt":"2015-12-14T22:24:12.224Z",
      // "username":"shawndrost"
    // }
    var dateString = JSON.stringify(new Date());
    _.extend(message, { createdAt: dateString,
                        updatedAt: dateString,
                        objectId: messagesData.length,
                        opponents: { "__type":"Relation", "className":"Player" },
                        roomname: roomName });
    //add to beginning of messagesData
    messagesData.unshift(message);
    
    response.writeHead(201,headers);
    response.end(JSON.stringify({ createdAt: dateString, objectId: message.objectId }));
  });
}

// handle any other request. might not need this with express
exports.fileNotFound = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  response.writeHead(404, headers);
  response.end();
}