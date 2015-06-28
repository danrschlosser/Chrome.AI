// Secrets, constants, and global variables.
var CLIENT_ID = "4I537542AYSO7HCNF2UL5MOM5NE7MLV5";
var isReady = false;

var SERIALIZE_MAP = {
    '_9470' : '\'',
    '_9471' : '\"',
    '_9472' : ' ',
    '_9473' : '-',
    '_9474' : '#',
    '_9475' : '.',
    '_9476' : ',',
    '_9477' : ':',
    '_9478' : '{',
    '_9479' : '}',
    '_9480' : '[',
    '_9481' : ']',
    '_9482' : '(',
    '_9483' : ')',
    '_9484' : '<',
    '_9485' : '>',
    '_9486' : '/',
    '_9487' : '\\',
    '_9488' : '$',
    '_9489' : '@',
    '_9490' : '!',
    '_9491' : '=',
    '_9492' : '+',
    '_9493' : '*',
    '_9494' : '?',
    '_9495' : '~',
};

function escapeRegExp(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
};

var deserialize = function (str) {
    for (var key in SERIALIZE_MAP) {
        var value = SERIALIZE_MAP[key];
        var regex = new RegExp(escapeRegExp(key), 'g');
        str = str.replace(regex, value);
    }
    return str.slice(3);
};

// Callback functions for mic actions.
var handleResults = function(response) {
  // TODO: multiple intents
  var intent = response.outcomes[0].intent;
  var entities = response.outcomes[0].entities;
  console.log("We have our things back:", intent, entities);
  var intentData = JSON.parse(deserialize(intent));
  switch(intentData.intentType) {
    case 'click':
      $(intentData.data.selector)[0].click();
      break;
    default:
      console.log('Failed to understand intent with type:', intentData.intentType);
      break;
  }
};

function sendRequest(query) {
  $.ajax({
    url: 'https://api.wit.ai/message',
    data: {
      'q': query,
      'access_token': CLIENT_ID
    },
    dataType: 'json',
    method: 'GET',
    success: handleResults
  });
}

// Receive messages from the background.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'log') {
          console.log.apply(console, request.data);
        } else if (request.type === 'voice') {
          sendRequest(request.data);
        }
    }
);
