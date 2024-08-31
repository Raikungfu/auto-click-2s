function getBrowserApi() {
  return typeof browser !== "undefined" ? browser : chrome;
}

const browserApi = getBrowserApi();

// background.js
browserApi.webRequest.onCompleted.addListener(
  function (details) {
    // Kiểm tra URL và mã phản hồi để xác định nếu có alert
    if (details.url.includes("vote-js.php") && details.statusCode === 200) {
      chrome.tabs.sendMessage(details.tabId, { type: "checkAlert" });
    }
  },
  { urls: ["<all_urls>"] }
);

document.addEventListener("DOMContentLoaded", () => {
  browserApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browserApi.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: checkAutoClickStatus,
      },
      (results) => {
        if (browserApi.runtime.lastError || !results || !results[0].result) {
          // Nếu có lỗi hoặc không thể lấy kết quả, mặc định là "chưa chạy"
          document.getElementById("start-auto-click").style.display = "inline";
          document.getElementById("stop-auto-click").style.display = "none";
        } else {
          // Cập nhật nút dựa trên trạng thái của autoClickRunning
          if (results[0].result) {
            document.getElementById("start-auto-click").style.display = "none";
            document.getElementById("stop-auto-click").style.display = "inline";
          } else {
            document.getElementById("start-auto-click").style.display =
              "inline";
            document.getElementById("stop-auto-click").style.display = "none";
          }
        }
      }
    );
  });
});

browserApi.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("https://poll.fm/14276245/embed")
  ) {
    browserApi.storage.local.get("autoClickRunning", (data) => {
      if (data.autoClickRunning) {
        browserApi.scripting.executeScript({
          target: { tabId: tabId },
          function: startAutoClickVote,
          args: [5, 2000, 60000],
        });
      }
    });
  }
});

document.getElementById("start-auto-click").addEventListener("click", () => {
  browserApi.storage.local.set({ clickCount: 0 });
  browserApi.storage.local.set({ totalClickCount: 0 });
  browserApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browserApi.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: startAutoClickVote,
      args: [5, 2000, 60000],
    });
  });

  browserApi.storage.local.set({ autoClickRunning: true });

  document.getElementById("start-auto-click").style.display = "none";
  document.getElementById("stop-auto-click").style.display = "inline";
});

document.getElementById("stop-auto-click").addEventListener("click", () => {
  browserApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    browserApi.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: stopAutoClickVote,
    });
  });

  browserApi.storage.local.set({ autoClickRunning: false });

  document.getElementById("start-auto-click").style.display = "inline";
  document.getElementById("stop-auto-click").style.display = "none";
});

function checkAutoClickStatus() {
  return new Promise((resolve) => {
    getBrowserApi().storage.local.get("autoClickRunning", (data) => {
      resolve(data.autoClickRunning || false);
    });
  });
}
