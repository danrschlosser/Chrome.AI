
navigator.webkitGetUserMedia({
    audio: true,
}, function(stream) {
    stream.stop();
    debugger;
    // Now you know that you have audio permission. Do whatever you want...
}, function() {
    // Aw. No permission (or no microphone available).
});