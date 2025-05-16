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

// 添加全局事件监听器，确保所有按钮点击可以被捕获
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM完全加载，添加全局事件监听');
    
    // 为场景相关表达界面的按钮添加全局事件监听
    document.addEventListener('click', function(e) {
        // 检查是否点击了返回场景列表按钮
        if (e.target && (e.target.id === 'back-to-scenes-btn' || 
            (e.target.parentElement && e.target.parentElement.id === 'back-to-scenes-btn'))) {
            console.log('全局监听器: 返回场景列表按钮点击');
            
            // 隐藏场景相关表达界面
            const sceneExpressions = document.getElementById('scene-expressions');
            if (sceneExpressions) {
                sceneExpressions.classList.add('hidden');
            }
            
            // 显示场景选择界面
            const sceneSelection = document.getElementById('scene-selection');
            if (sceneSelection) {
                sceneSelection.classList.remove('hidden');
            }
            
            // 显示场景列表
            const sceneList = document.getElementById('scene-list');
            if (sceneList) {
                sceneList.classList.remove('hidden');
            }
            
            // 确保对话页面是活动的
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            const dialoguePage = document.getElementById('dialogue');
            if (dialoguePage) {
                dialoguePage.classList.add('active');
            }
            
            // 更新导航栏
            document.querySelectorAll('.main-nav li').forEach(item => {
                if (item.getAttribute('data-page') === 'dialogue') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
        
        // 检查是否点击了开始场景对话按钮
        if (e.target && (e.target.id === 'start-scene-chat-btn' || 
            (e.target.parentElement && e.target.parentElement.id === 'start-scene-chat-btn'))) {
            console.log('全局监听器: 开始场景对话按钮点击');
            
            // 隐藏场景相关表达界面
            const sceneExpressions = document.getElementById('scene-expressions');
            if (sceneExpressions) {
                sceneExpressions.classList.add('hidden');
            }
            
            // 隐藏场景选择界面
            const sceneSelection = document.getElementById('scene-selection');
            if (sceneSelection) {
                sceneSelection.classList.add('hidden');
            }
            
            // 显示当前场景信息和聊天容器
            const currentSceneInfo = document.querySelector('.current-scene-info');
            if (currentSceneInfo) {
                currentSceneInfo.classList.remove('hidden');
            }
            
            const chatContainer = document.getElementById('chat-container');
            if (chatContainer) {
                chatContainer.classList.remove('hidden');
            }
            
            // 确保对话页面是活动的
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            const dialoguePage = document.getElementById('dialogue');
            if (dialoguePage) {
                dialoguePage.classList.add('active');
            }
            
            // 更新导航栏
            document.querySelectorAll('.main-nav li').forEach(item => {
                if (item.getAttribute('data-page') === 'dialogue') {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
            
            // 尝试调用场景管理器的方法
            if (window.sceneManager && window.sceneManager.startChat) {
                window.sceneManager.startChat();
            }
        }
    });
}); 