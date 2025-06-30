chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log('Received message:', msg, sender, sendResponse);
    if (msg.command === 'storeField') {
        const { url, selector, value } = msg.data;
        chrome.storage.local.get([url], res => {
            const config = res[url] || { fields: [] };

            // 覆盖旧的 selector 值（如果已存在）
            const existing = config.fields.find(f => f.selector === selector);
            if (existing) {
                existing.value = value;
            } else {
                config.fields.push({ selector, value });
            }

            chrome.storage.local.set({ [url]: config });
        });
    }
});


chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "autofill_set_value",
        title: "设置需要自动填充值",
        contexts: ["editable"] // 只在输入框中显示
    });
    chrome.contextMenus.create({
        id: "autofill_enable",
        title: "启用自动填充值",
        contexts: ["page", "image", "frame"] // 只在页面、图片和框架中显示
    });
});

// 监听菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "autofill_set_value") {
        chrome.tabs.sendMessage(tab.id, { command: 'promptFieldValue' });
    } else if (info.menuItemId === "autofill_enable") {
        chrome.tabs.sendMessage(tab.id, { command: 'autofill' });
    }
});
