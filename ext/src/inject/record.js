
// Catch clicks
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
		// After background.js responds
	});
});

// Catch typing
$('input, select, textarea').change(function(e) {
	console.log($(this), "changed:", e);
	var message = {
		type: 'record',
		intent: {
			intentType: 'input',
			data: {
				selector: e.target.selector,
				value: $(this).val()
			}
		}
	};
	console.log(message);
	chrome.extension.sendMessage(message, function(response) {
		// After background.js reponds
	})
})