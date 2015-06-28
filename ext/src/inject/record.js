function stripQueryStringAndHashFromPath(url) {
  return url.split("?")[0].split("#")[0];
}

// Add the ability to get the unique selector of an element
jQuery.fn.getSelector = function () {
    if (this.length != 1) throw 'Requires one element.';
    var path, node = this;
    if (node[0].id) return '#' + node[0].id;
    var href = node.attr('href');
    if (href && href != '#') return node[0].tagName + '[href*="' + stripQueryStringAndHashFromPath(href) + '"]';
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
    if ($(this)[0].type === 'submit') {
        return;
    }

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
	var $forms = $(this);
	var inputs = [];
    var $formChildren = $($forms.getSelector() + ' input, ' + $forms.getSelector() + ' select, ' + $forms.getSelector() + ' textarea');
	for (var i = 0; i < $formChildren.length; i++) {
        var input = $formChildren[i];
		if ((!input.type || input.type !== 'submit') && input.type !== 'hidden') {
			var selector = $forms.getSelector() + " " + input.tagName;

			if (input.type) {
				selector += '[type="' + input.type + '"]';
			}
			if (input.name) {
				selector += '[name="' + input.name + '"]';
			}

            if (input.value && input.value !== '') {
                inputs.push({
                    selector: selector,
                    value: input.value
                });
            }
		}
	};
	chrome.extension.sendMessage({
		type: 'record',
		intent: {
			intentType: 'submit',
			data: {
				selector: $forms.getSelector(),
				inputs: inputs
			},
            state: [
                window.location.host
            ]
		}
	}, function(response) {
		// After background.js reponds
	});
});