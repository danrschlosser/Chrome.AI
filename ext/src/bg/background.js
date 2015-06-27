var pendingIntents = [];

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.type === 'record') {
        console.log('message from record');
        pendingIntents.push(request.intent);
    } else if (request.type === 'play') {
        console.log('message from play');
    }
    sendResponse();
  });

chrome.tabs.create({url: 'src/bg/background.html' });

var isRecording = false;
var clickhandler = function (e) {
    isRecording = !isRecording;

    var recognition = new webkitSpeechRecognition();
    recognition.onresult = function (event) {
        console.log('heard some voice', event);
        var expression = event.results[0][0].transcript;
        var confidence = event.results[0][0].confidence;

        var intentObj = {
            intents: pendingIntents,
            expression: expression,
            confidence: confidence
        };

        console.log("Server obj:", intentObj);
        pendingIntents = [];
    };

    recognition.onend = function (e) {
        recognition.start();
        console.log('onend event', e);
    };

    recognition.onerror = function (e) {
        console.log('error', e);
    };

    if (isRecording) {
        recognition.start();
        chrome.contextMenus.update('record', {
            'title': 'Stop Recording'
        });
    } else {
        recognition.stop();
        chrome.contextMenus.update('record', {
            'title': 'Start Recording'
        });
    }
};

chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
        'id': 'record',
        'title': 'Start Recording',
        'contexts': ['browser_action'],
        'onclick': clickhandler
    });
});

var isPlaying = false;
var isRecording = false;

function getLogoRoute() {
  var fileName = isPlaying ? "loading.png" : (isRecording ? "recording.png" : "icon16.png");
  return "icons/" + fileName;
}

chrome.browserAction.onClicked.addListener(function(tabs) {
    var messageType = isPlaying ? 'stop-play' : 'start-play';
    isPlaying = !isPlaying;

    var newLogo = getLogoRoute();
    chrome.browserAction.setIcon({
      path: getLogoRoute()
    });

    chrome.tabs.query({ active: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: messageType}, function(response) {
      });
    });
});
