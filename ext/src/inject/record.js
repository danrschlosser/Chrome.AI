function stripQueryStringAndHashFromPath(url) {
  return url.split("?")[0].split("#")[0];
}

// Add the ability to get the unique selector of an element
jQuery.fn.getSelector = function () {
    if (this.length != 1) throw 'Requires one element.';
    var path, node = this;
    if (node[0].id) return '#' + node[0].id;
    var href = stripQueryStringAndHashFromPath(node.attr('href'));
    if (href && href != '#') return node[0].tagName + '[href*="' + href + '"]';
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();

        var parent = node.parent();

        var siblings = parent.children(name);
        if (siblings.length > 1) {
            name += ':eq(' + siblings.index(realNode) + ')';
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};

// Catch clicks
$('a, button, input, select, textarea').click(function(e) {
	var path = $(this).getSelector();
	chrome.extension.sendMessage({
		type: 'record',
		intent: {
			intentType: 'click',
			data: {
				selector: path,
				innerText: e.target.innerText
			},
			state: [
				window.location.host
			]
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
				selector: $(this).getSelector(),
				value: $(this).val()
			}
		}
	};
	console.log(message);
	chrome.extension.sendMessage(message, function(response) {
		// After background.js reponds
	});
});