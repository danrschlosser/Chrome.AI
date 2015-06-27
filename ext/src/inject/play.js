// Secrets and constants we'll use.
var CLIENT_ID = "4I537542AYSO7HCNF2UL5MOM5NE7MLV5";

// Callback functions for mic actions.
var handleResults = function(intent, entities) {
  console.log("We have our things back.");
  console.log(intent);
  console.log(entities);
}
var onMicReady = function() {
  console.log("Awe yeah we ready.");
}

// Hookup callback functions.
mic.onready = onMicReady;
mic.onresult = handleResults;

// Connect our microphone.
mic.connect(CLIENT_ID);

// Send messages to background.
chrome.extension.sendMessage({type: 'play'}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
      if (document.readyState === "complete") {
          clearInterval(readyStateCheckInterval);
      }
    }, 10);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'start-play') {
            console.log("starting play");
        } else if (request.type === 'stop-play') {
            console.log("stopping playing");
        }
    }
);
