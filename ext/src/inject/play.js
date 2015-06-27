var div = document.createElement('speak-easy-mic');
var mic = new Wit.Microphone(div);
mic.onready = function() {
  console.log("Microphone is ready to record.");
}

mic.onaudiostart = function() {
  console.log("Recording started.");
}

div.click();

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
