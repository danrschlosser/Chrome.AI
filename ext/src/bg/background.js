var SERVER_BASE = 'http://d77ac5c6.ngrok.io/'
var pendingIntents = [];

var sendMessageToActiveTab = function (message) {
    chrome.tabs.query({ active: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
        });
    });
};

var log = function () {
    console.log.apply(console, arguments);
    sendMessageToActiveTab({
        type: 'log',
        data: arguments
    });
};

//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    log(request);
    if (request.type === 'record') {
        log('message from record');
        pendingIntents.push(request.intent);
    } else if (request.type === 'play') {
        log('message from play');
    }
    sendResponse();
  });

var isRecording = false;

var recognition = new webkitSpeechRecognition();
recognition.onresult = function (event) {
    log('heard some voice', event);
    var expression = event.results[0][0].transcript;
    var confidence = event.results[0][0].confidence;

    var intentObj = {
        intents: pendingIntents,
        expression: expression,
        confidence: confidence,
        context: null
    };

    log("Sending obj to server:", intentObj);

    $.ajax({
        type: 'POST',
        url: SERVER_BASE + '/train',
        data: JSON.stringify(intentObj),
        success: function(data) {
            log('POST successful:');
            log(data);
        },
        contentType: "application/json",
        dataType: 'json'
    });

    pendingIntents = [];
};

recognition.onend = function (e) {
    recognition.start();
    log('onend event', e);
};

recognition.onerror = function (e) {
    log('error', e);
};

var clickhandler = function (e) {
    isRecording = !isRecording;


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

chrome.runtime.onInstalled.addListener(function () {
    chrome.tabs.create({url: 'src/bg/permissions.html' });
});

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

var playRecognition = new webkitSpeechRecognition();
playRecognition.onresult = function (event) {
    log('heard some voice', event);
    var expression = event.results[0][0].transcript;

    sendMessageToActiveTab({
        type: 'voice',
        data: expression
    });
};

playRecognition.onend = function (e) {
    playRecognition.start();
    log('onend event', e);
};

playRecognition.onerror = function (e) {
    log('error', e);
};

chrome.browserAction.onClicked.addListener(function(tabs) {
    isPlaying = !isPlaying;

    var newLogo = getLogoRoute();
    chrome.browserAction.setIcon({
      path: getLogoRoute()
    });


    if (isPlaying) {
        playRecognition.start();
    } else {
        playRecognition.stop();
    }
});
