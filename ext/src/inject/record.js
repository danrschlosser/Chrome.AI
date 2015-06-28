// Add the ability to get the unique selector of an element
jQuery.fn.getSelector = function () {
    if (this.length != 1) throw 'Requires one element.';
    var path, node = this;
    if (node[0].id) return '#' + node[0].id;
    var href = node.attr('href');
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

// Catch form submissions
$('form').submit(function(e) {
	console.log($(this), "was submitted:", e);
	var $form = $(this);
	var inputs = [];
	$form.forEach(function(input) {
		if (!input.type || input.type != 'submit') {
			var selector = $form.getSelector(); + " " + input.tagName

			if (input.type) {
				selector += '[type="' + input.type + '""]';
			}
			if (input.name) {
				selector += '[name="' + input.name + '"]';
			}

			inputs.push({
				selector: selector,
				value: input.value
			});
		}
	});
	chrome.extension.sendMessage({
		type: 'record',
		intent: {
			intentType: 'submit',
			data: inputs
		}
	}, function(response) {
		// After background.js reponds
	});
});