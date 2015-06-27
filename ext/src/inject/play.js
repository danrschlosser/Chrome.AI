// Secrets, constants, and global variables.
var CLIENT_ID = "4I537542AYSO7HCNF2UL5MOM5NE7MLV5";
var isReady = false;

// Callback functions for mic actions.
var handleResults = function(response) {
  // TODO: multiple intents
  var intent = response.outcomes[0].intent;
  var entities = response.outcomes[0].entities;
  console.log("We have our things back:", intent, entities);

  console.log('do this step eventually');
  // var intentData = JSON.parse(intent);
  // switch(intentData.intentType) {
  //   case 'click':
  //     $(intentData.selector).click();
  //     break;
  //   default:
  //     console.log('Failed to understand intent with type:', intentData.intentType);
  //     break;
  // }
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
