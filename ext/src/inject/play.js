// Secrets, constants, and global variables.
var CLIENT_ID = "4I537542AYSO7HCNF2UL5MOM5NE7MLV5";
var isReady = false;

var handleResults = function(response) {
  console.log(response);
}

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

// Send messages to background.
chrome.extension.sendMessage({type: 'play'}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
      if (document.readyState === "complete") {
          clearInterval(readyStateCheckInterval);
      }
    }, 10);
});

// Receive messages from the background.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'log') {
          console.log.call(console, request.data);
        } else if (request.type === 'voice') {
          sendRequest(request.data);
        }
    }
);
