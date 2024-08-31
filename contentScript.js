(function() {
    const originalAppendChild = Node.prototype.appendChild;

    Node.prototype.appendChild = function(node) {
        if (node.tagName === 'SCRIPT' && node.src) {
            node.addEventListener('load', function() {
                console.log("Script loaded from:", node.src);
            });
        }

        return originalAppendChild.apply(this, arguments);
    };

    const originalAlert = window.alert;

    window.alert = function(message) {
        console.log("Intercepted alert: " + message);

        if (message.includes("It took too long to register your vote")) {
            console.log("Detected specific alert. Reloading page.");
            location.reload();
        } else {
            console.log("Alert message was not related to vote timing.");
        }
    };

    const browserApi = typeof browser !== 'undefined' ? browser : chrome;

    browserApi.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.type === "checkAlert") {
            // Nếu cần thêm xử lý khi nhận request từ background script
            console.log("Kiểm tra alert từ request");
        }
    });
})();
