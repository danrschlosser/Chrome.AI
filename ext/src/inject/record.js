$('a, button, input, select, textarea').click(function(e) {
	console.log(e);
	chrome.extension.sendMessage({
		type: 'record',
		intent: {
			intentType: 'click',
			data: {
				selector: e.target.selector,
				innerText: e.target.innerText
			}
		}
	}, function(response) {
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
});
