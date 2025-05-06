// 主应用入口
document.addEventListener('DOMContentLoaded', () => {
    // 初始化页面
    initApp();
});

// 初始化应用
function initApp() {
    console.log('汉语学习助手应用已启动');
    
    // 检查API密钥
    if (!CONFIG.DEEPSEEK_API_KEY) {
        uiManager.showError('未找到API密钥，请在config.js中配置');
    }
    
    // 欢迎消息
    showWelcomeMessage();
}

// 显示欢迎消息
function showWelcomeMessage() {
    setTimeout(() => {
        const content = `
            <div class="welcome-message">
                <h3>欢迎使用汉语学习助手</h3>
                <p>此应用可以帮助您练习汉语口语和写作，通过多种交互方式提高您的语言技能。</p>
                
                <h4>主要功能</h4>
                <ul>
                    <li>场景生成 - 创建定制的对话场景</li>
                    <li>对话练习 - 与AI助手进行情景对话</li>
                    <li>语音日记 - 录制并获取语言反馈</li>
                    <li>日记列表 - 查看历史日记和反馈</li>
                </ul>
                
                <button class="primary-btn" onclick="uiManager.hideModal()">开始使用</button>
            </div>
        `;
        uiManager.showModal(content);
    }, 500);
}

// 处理错误
window.addEventListener('error', (event) => {
    console.error('应用错误:', event.error);
    // 避免重复显示错误
    if (!event.error._reported) {
        event.error._reported = true;
        uiManager.showError('应用错误: ' + event.error.message);
    }
    return false;
});

// 处理未捕获的Promise错误
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise错误:', event.reason);
    // 避免重复显示错误
    if (!event.reason._reported) {
        event.reason._reported = true;
        uiManager.showError('应用错误: ' + event.reason.message);
    }
    return false;
}); 