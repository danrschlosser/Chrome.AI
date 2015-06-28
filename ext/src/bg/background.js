var pendingIntents = [];
var SERVER_BASE = 'http://d77ac5c6.ngrok.io/';
var sendMessageToActiveTab = function (message) {
    chrome.tabs.query({ active: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
        });
    });
};

var log = function () {
    var allArgumentsOfTypeString = true;
    for (var i = 0; i < arguments.length; i++)
      if (typeof arguments[i] !== "string")
        allArgumentsOfTypeString = false;

    if (allArgumentsOfTypeString)
      console.log.apply(console, [Array.prototype.join.call(arguments, " ")]);
    else
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
    var expression = event.results[0][0].transcript;
    var confidence = event.results[0][0].confidence;

    console.log('got expression', expression);

    if (isRecording) {

        if (pendingIntents.length > 0 && expression && expression !== '') {
            var intentObj = {
                intents: pendingIntents,
                expression: expression,
                confidence: confidence,
                state: pendingIntents[0].state
            };

            log("Server obj:", intentObj);

            $.ajax({
                type: 'POST',
                url: SERVER_BASE + 'train',
                data: JSON.stringify(intentObj),
                success: function(data) {
                    log('POST successful:');
                    log(data);
                },
                contentType: "application/json",
                dataType: 'json'
            });

            pendingIntents = [];
        }

    } else if (isPlaying) {
        sendMessageToActiveTab({
            type: 'voice',
            data: expression
        });
    }
};

recognition.onend = function (e) {
    recognition.start();
};

recognition.onerror = function (e) {
    log('error', e);
};

var isPlaying = false;
var isRecording = false;

var onRecord = function (e) {
    isPlaying = false;
    isRecording = !isRecording;

    resetIcon();
    if (isRecording) {
        log('Start recording');
        recognition.start();
        chrome.contextMenus.update('record', {
            'title': 'Stop Recording'
        });
    } else {
        log('Stop recording');
        recognition.stop();
        chrome.contextMenus.update('record', {
            'title': 'Start Recording'
        });
    }
};

var onPlay = function (e) {
    isRecording = false;
    isPlaying = !isPlaying;

    resetIcon();

    if (isPlaying) {
        log('Start playing');
        recognition.start();
    } else {
        log('Stop recording');
        recognition.stop();
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
        'onclick': onRecord
    });
});


var getLogoRoute = function () {
  var fileName = isPlaying ? "loading.png" : (isRecording ? "recording.png" : "icon16.png");
  return "icons/" + fileName;
}

var resetIcon = function () {
    chrome.browserAction.setIcon({
      path: getLogoRoute()
    });
};

resetIcon();

chrome.browserAction.onClicked.addListener(function(e) {
    onPlay(e);
});
