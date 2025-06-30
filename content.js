// 监听来自 popup 的命令
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log('Received message:', msg, sender, sendResponse);
    if (msg.command === 'promptFieldValue') {
        const activeEl = document.activeElement;
        if (!activeEl || !(activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement)) {
            alert('未聚焦任何输入框，请先点击输入框后再右键设置');
            return;
        }

        const value = prompt('请输入要填充的内容：', activeEl.value || '');
        if (value !== null) {
            const selector = getUniqueSelector(activeEl);
            chrome.runtime.sendMessage({
                command: 'storeField',
                data: {
                    url: location.origin,
                    selector,
                    value
                }
            });
        }
    } else if (msg.command === 'autofill') {
        chrome.storage.local.get([location.origin], res => {
            const config = res[location.origin];
            if (config && config.fields) {
                config.fields.forEach(field => {
                    const el = document.querySelector(field.selector);
                    if (el) {
                        setInputValue(el, field.value);
                        // console.log(`已填充 ${field.selector} 的值为：${field.value}`);
                    } else {
                        // console.warn(`未找到元素：${field.selector}`);
                        alert(`未找到元素：${field.selector}，请检查配置是否正确，或者页面结构变更，可能需要重新设置。`);
                    }
                });
            } else {
                // console.warn('没有找到任何配置的字段');
                alert('没有找到任何配置的字段，请先设置需要自动填充的内容。');
            }
        });
    }
    //  if (msg.command === 'enableSelection') {
    //     enableFieldSelection();
    // }
});

function setInputValue(el, value) {
    const prototype = Object.getPrototypeOf(el);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    if (descriptor && descriptor.set) {
        descriptor.set.call(el, value);  // ✅ 关键：必须用 call 绑定 el
    } else {
        el.value = value;
    }

    // 触发必要的事件，确保框架（如 React/Vue）监听到变更
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
}



// 启动选择器模式：用户点击选择输入框
// function enableFieldSelection() {
//     const listener = e => {
//         e.preventDefault();
//         e.stopPropagation();
//         const selector = getUniqueSelector(e.target);
//         const value = prompt(`请输入要填充的内容：`, '');
//         console.log('选择的元素:', selector, '填充的内容:', value);
//         if (value !== null) {
//             chrome.runtime.sendMessage({
//                 command: 'storeField',
//                 data: { selector, value, url: location.origin }
//             });
//         }
//         document.removeEventListener('click', listener, true);
//         console.log('选择器模式已关闭');
//     };
//     document.addEventListener('click', listener, true);
// }

// // 简易获取唯一 selector
// function getUniqueSelector(el) {
//     if (el.id) return `#${el.id}`;
//     if (el.name) return `[name="${el.name}"]`;
//     if (el.className) return `.${el.className.split(' ').join('.')}`;
//     return el.tagName.toLowerCase();
// }

// 通用唯一选择器生成器（可增强）
function getUniqueSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.name) return `[name="${el.name}"]`;
    if (el.className) return '.' + el.className.trim().split(/\s+/).join('.');
    return el.tagName.toLowerCase();
}