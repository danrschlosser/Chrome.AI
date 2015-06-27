$('a, button, input, select, textarea').click(function(e) {
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
		// After background.js response
	});
});
