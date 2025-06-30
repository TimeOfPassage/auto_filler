// popup.js
// document.getElementById('fill').addEventListener('click', async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     const url = new URL(tab.url).origin;
//     const config = await getConfig(url);
//     if (config) {
//         chrome.tabs.sendMessage(tab.id, { command: 'autofill', data: config });
//     } else {
//         document.getElementById('status').innerText = '暂无配置，点击下方配置字段';
//     }
// });

// document.getElementById('select').addEventListener('click', async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     chrome.tabs.sendMessage(tab.id, { command: 'enableSelection' });
// });

// 从 storage 获取配置
async function getConfig(origin) {
    return new Promise(resolve => {
        chrome.storage.local.get([origin], res => resolve(res[origin]));
    });
}

// 文档加载获取配置信息
document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tab.url).origin;
    const config = await getConfig(url);
    if (config) {
        document.getElementById('status').innerText = `当前配置：${JSON.stringify(config)}`;
    } else {
        document.getElementById('status').innerText = '暂无配置，请通过右键在输入框中右键菜单进行配置.';
    }
});