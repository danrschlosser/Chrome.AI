//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.type === 'record') {
        console.log('message from record');
    } else if (request.type === 'play') {
        console.log('message from play');
    }
    sendResponse();
  });

var clickhandler = function (e) {
    console.log('start recording');
    chrome.tabs.query({active: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'start-record'}, function(response) {
      });
    });
};

// chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        'id': 'record',
        'title': 'Start Recording',
        'contexts': ['browser_action'],
        'onclick': clickhandler
    });
// });

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
    chrome.tabs.query({active: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {type: messageType}, function(response) {
      });
    });
});