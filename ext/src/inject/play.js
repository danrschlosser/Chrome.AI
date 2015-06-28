// Secrets, constants, and global variables.
var isReady = false;

// Callback functions for mic actions.
var runAction = function(action) {
    switch(action.intentType) {
      case 'click':
        $(action.data.selector)[0].click();
        break;
      case 'submit':
        action.data.inputs.forEach(function(input) {
          $(input.selector)[0].value = input.value;
          // $(input.selector).textContent = input.value;
        });
        $(action.data.selector + ' button[type="submit"]').click();
        break;
      default:
        console.log('Failed to understand intent with type:', action.intentType);
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
