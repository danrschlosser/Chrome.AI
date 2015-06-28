// Secrets, constants, and global variables.
var isReady = false;

// Callback functions for mic actions.
var runAction = function(action) {
  var intent = action.intent;
  var entities = action.entities;

    switch(intent.intentType) {
      case 'click':
        $(intent.data.selector)[0].click();
        break;
      case 'submit':
        intent.data.inputs.forEach(function(input) {
          $(input.selector)[0].value = input.value;
          // $(input.selector).textContent = input.value;
        });

        entities.forEach(function (entity) {
          $(entity.selector)[0].value = entity.value;
        });

        setTimeout(function () {
          var elems = $(intent.data.selector + ' input[type="submit"]');
          for (var i = 0; i < elems.length; i++) {
            elems[i].click();
          }
        }, 500);
        break;
      default:
        console.log('Failed to understand intent with type:', intent.intentType);
        break;
    }
};

function sendRequest(query) {
  var context = {
    state: [ window.location.host ]
  };
  console.log('sending query', query);
  $.ajax({
    url: 'https://api.wit.ai/message',
    data: {
      'q': query,
      'context': context,
      'access_token': CLIENT_ID
    },
    dataType: 'json',
    method: 'GET',
    success: handleResults
  });
}

// Receive messages from the background.
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'log') {
            console.log(request.data);
        } else if (request.type === 'get-host') {
            sendResponse(window.location.host);
        } else if (request.type === 'run-action') {
            runAction(request.data);
        }
    }
);
