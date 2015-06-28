var pendingIntents = [];
// var SERVER_BASE = 'http://127.0.0.1:8000/';
var SERVER_BASE = 'http://6089404e.ngrok.io/';
var CLIENT_ID = "4I537542AYSO7HCNF2UL5MOM5NE7MLV5";

var sendMessageToActiveTab = function (message, response) {
    chrome.tabs.query({ active: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, response);
    });
};

var SERIALIZE_MAP = {
    '_70' : '\'',
    '_71' : '\"',
    '_72' : ' ',
    '_73' : '-',
    '_74' : '#',
    '_75' : '.',
    '_76' : ',',
    '_77' : ':',
    '_78' : '{',
    '_79' : '}',
    '_80' : '[',
    '_81' : ']',
    '_82' : '(',
    '_83' : ')',
    '_84' : '<',
    '_85' : '>',
    '_86' : '/',
    '_87' : '\\',
    '_88' : '$',
    '_89' : '@',
    '_90' : '!',
    '_91' : '=',
    '_92' : '+',
    '_93' : '*',
    '_94' : '?',
    '_95' : '~',
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

var intentData = [];

function runNext() {
    var intent = intentData.shift();

    if (intent) {

      sendMessageToActiveTab({
        type: 'run-action',
        data: intent
      });
    }
    setTimeout(runNext, 1000);
 }
 runNext();

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

        sendMessageToActiveTab({ type: 'get-host' }, function (host) {
            // Callback functions for mic actions.
            var queryData = {
              'q': expression,
              'context': {
                 state: [ host ]
               },
              'access_token': CLIENT_ID
            };

            var handleResults = function(response) {
              if (response.outcomes.length === 0) {
                console.log('No result for query data:', queryData);
                return;
              }
              // TODO: multiple intents
              var intent = response.outcomes[0].intent;
              var entities = response.outcomes[0].entities;
              intentData = intentData.concat(JSON.parse(deserialize(intent)).data);
              console.log("We have our things back:", intentData, entities);
            };

            $.ajax({
                url: 'https://api.wit.ai/message',
                data: queryData,
                dataType: 'json',
                method: 'GET',
                success: handleResults
            });
        });
    }
};

recognition.onend = function (e) {
    recognition.start();
};

recognition.onerror = function (e) {
    pendingIntents = [];
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
        pendingIntents = [];
        chrome.contextMenus.update('record', {
            'title': 'Stop Recording'
        });
        recognition.start();
    } else {
        log('Stop recording');
        chrome.contextMenus.update('record', {
            'title': 'Start Recording'
        });
        recognition.stop();
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
