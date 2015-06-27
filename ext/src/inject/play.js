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
var onStartRecording = function() {
  console.log("We've started recording.");
  // TODO: Add interface actions.
}
var onStopRecording = function() {
  console.log("We've stopped recording.");
  // TODO: Add interface actions.
}

var mic = new Wit.Microphone();

// Hookup callback functions.
mic.onready = onMicReady;
mic.onresult = handleResults;
mic.onaudiostart = onStartRecording;
mic.onaudioend = onStopRecording;

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
          debugger;
          mic.start();
        } else if (request.type === 'stop-play') {
          debugger;
          mic.stop();
        }
    }
);
