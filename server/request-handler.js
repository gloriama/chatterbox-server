/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var _ = require('../node_modules/underscore/underscore.js');
var fs = require('fs');
var headers = {'Content-Type': 'application/json'}; //to be used for all responses
var getRoomName = function(url) {
  var urlPrefix = '/classes/';
  if (url.substring(0, urlPrefix.length) === urlPrefix) {
    return url.substring(urlPrefix.length); //return everything after the prefix
  } else {
    return undefined;
  }
}
var messagesFile = "messages.json";
var messagesData = JSON.parse(fs.readFileSync(messagesFile));

//read messagesData from local file, if file exists


// handle OPTIONS request
exports.options = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);
  response.writeHead(200, headers);
  response.end();
}

// handle GET request to "/classes/*"
exports.getMessages = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);

  //filter messages by room name
  var roomName = getRoomName(request.url);
  var filteredData = _.filter(messagesData, function(message){
    return (message.roomname === roomName);
  });

  response.writeHead(200, headers);
  response.end(JSON.stringify({results:filteredData}));
}

// handle POST request to "/classes/*"
exports.postMessage = function(request, response) {
  console.log("Serving request type " + request.method + " for url " + request.url);

  //process request to save it to our messages
  request.on('data', function(data){
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
                        roomname: getRoomName(request.url) });
    messagesData.unshift(message); //add to messagesData
    fs.writeFileSync(messagesFile, JSON.stringify(messagesData));//add to local file

    response.writeHead(201,headers);
    response.end(JSON.stringify({ createdAt: dateString, objectId: message.objectId }));
  });
}