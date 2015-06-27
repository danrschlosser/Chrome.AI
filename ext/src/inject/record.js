chrome.extension.sendMessage({type: 'record'}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/record.js");
		// ----------------------------------------------------------

	}
	}, 10);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'record-start') {
            var recognition = new webkitSpeechRecognition();
            recognition.onresult = function(event) {
              console.log(event)
            }
            recognition.start();
            console.log('got message in record.js', request);
        }
    }
);