// Secrets, constants, and global variables.
var CLIENT_ID = "4I537542AYSO7HCNF2UL5MOM5NE7MLV5";
var mic = new Wit.Microphone();
var isReady = false;

// Callback functions for mic actions.
var handleResults = function(intent, entities) {
  console.log("We have our things back:", intent, entities);
  var intentData = JSON.parse(intent);
  switch(intentData.intentType) {
    case 'click':
      $(intentData.selector).click();
      break;
    default:
      console.log('Failed to understand intent with type:', intentData.intentType);
      break;
  }
}
var onMicReady = function() {
  isReady = true;
}
var onStartRecording = function() {
  console.log('We have started recording');
  // TODO: Add interface actions.
}
var onStopRecording = function() {
  console.log('We have ended recording.');
  // TODO: Add interface actions.
}

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

// Receive messages from the background.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'start-play') {
          mic.start();
        } else if (request.type === 'stop-play') {
          mic.stop();
        }
    }
);
