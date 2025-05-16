// UI交互管理
class UiManager {
    constructor() {
        this.pages = document.querySelectorAll('.page');
        this.navItems = document.querySelectorAll('.main-nav li');
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeModalBtn = document.querySelector('.close-modal');
        
        this.initListeners();
    }
    
    // 初始化监听器
    initListeners() {
        // 导航栏点击
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const pageName = item.getAttribute('data-page');
                this.navigateTo(pageName);
            });
        });
        
        // 模态框关闭按钮
        this.closeModalBtn.addEventListener('click', () => {
            this.hideModal();
        });
        
        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }
    
    // 页面导航
    navigateTo(pageName) {
        // 如果当前正在聊天，先结束对话
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer && !chatContainer.classList.contains('hidden') && typeof window.chatManager !== 'undefined' && pageName !== 'dialogue') {
            // 清空聊天记录
            window.chatManager.chatMessages.innerHTML = '';
            window.chatManager.messageCount = 0;
            
            // 重置API对话历史
            if (typeof window.apiService !== 'undefined') {
                window.apiService.resetConversation();
            }
            
            // 隐藏相关UI元素
            const currentSceneInfo = document.querySelector('.current-scene-info');
            if (currentSceneInfo) currentSceneInfo.classList.add('hidden');
            chatContainer.classList.add('hidden');
            if (window.chatManager.feedbackContainer) {
                window.chatManager.feedbackContainer.classList.add('hidden');
            }
            
            console.log('导航离开chat界面，已重置对话状态');
        }
        
        // 特殊处理：如果导航到对话页面，检查是否有选择场景
        if (pageName === 'dialogue') {
            // 在页面切换后检查场景，确保所有脚本都已加载
            setTimeout(() => {
                // 确保场景选择界面默认可见，聊天容器默认隐藏
                const currentSceneInfo = document.querySelector('.current-scene-info');
                const sceneSelection = document.getElementById('scene-selection');
                const chatContainer = document.getElementById('chat-container');
                const sceneExpressions = document.getElementById('scene-expressions');
                const sceneList = document.getElementById('scene-list');
                
                // 隐藏场景相关表达界面
                if (sceneExpressions) sceneExpressions.classList.add('hidden');
                
                // 隐藏当前场景信息和聊天容器
                if (currentSceneInfo) currentSceneInfo.classList.add('hidden');
                if (chatContainer) chatContainer.classList.add('hidden');
                
                // 显示场景选择界面和场景列表
                if (sceneSelection) sceneSelection.classList.remove('hidden');
                if (sceneList) sceneList.classList.remove('hidden');
                
                console.log('导航到对话页面，恢复场景列表显示');
                
                // 如果sceneManager已定义且存在currentScene，则显示对话界面
                if (typeof window.sceneManager !== 'undefined' && window.sceneManager.currentScene) {
                    window.sceneManager.updateCurrentSceneInfo();
                } else if (typeof window.sceneManager !== 'undefined' && window.sceneManager.scenes && window.sceneManager.scenes.length === 0) {
                    // 如果没有场景，显示创建场景提示
                    this.showError('请先在"场景生成"页面创建一个对话场景');
                }
            }, 100); // 短暂延迟，确保DOM已更新
        }
        
        // 隐藏所有页面
        this.pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示目标页面
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // 更新导航栏激活状态
            this.navItems.forEach(item => {
                if (item.getAttribute('data-page') === pageName) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }
    }
    
    // 显示加载中
    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }
    
    // 隐藏加载中
    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }
    
    // 显示模态框
    showModal(content) {
        this.modalBody.innerHTML = content;
        this.modal.classList.remove('hidden');
    }
    
    // 隐藏模态框
    hideModal() {
        this.modal.classList.add('hidden');
    }
    
    // 显示错误信息
    showError(message) {
        const content = `
            <div class="error-message">
                <h3>出错了</h3>
                <p>${message}</p>
                <button class="secondary-btn" onclick="uiManager.hideModal()">关闭</button>
            </div>
        `;
        this.showModal(content);
    }
    
    // 显示确认对话框
    showConfirm(message, onConfirm) {
        const content = `
            <div class="confirm-dialog">
                <h3>确认</h3>
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="secondary-btn" onclick="uiManager.hideModal()">取消</button>
                    <button class="primary-btn" id="confirm-btn">确认</button>
                </div>
            </div>
        `;
        this.showModal(content);
        
        // 添加确认按钮点击事件
        setTimeout(() => {
            document.getElementById('confirm-btn').addEventListener('click', () => {
                this.hideModal();
                onConfirm();
            });
        }, 100);
    }
    
    // 创建元素辅助方法
    createElement(tagName, className, textContent = '') {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (textContent) {
            element.textContent = textContent;
        }
        return element;
    }
    
    // 显示反馈内容
    formatFeedback(feedbackText) {
        // 检查反馈内容是否为空
        if (!feedbackText || feedbackText.trim() === '') {
            return '<div class="empty-message">暂无反馈内容</div>';
        }

        let formattedHTML = '';
        
        // 使用正则表达式匹配形如 "1. 原句："内容"" 的模式
        const feedbackItems = feedbackText.split(/(\d+\.\s+原句[:：])/).filter(item => item.trim() !== '');
        
        // 对匹配到的内容进行处理
        for (let i = 0; i < feedbackItems.length; i += 2) {
            if (i + 1 >= feedbackItems.length) break;
            
            const numberPart = feedbackItems[i]; // "1. 原句："
            const number = numberPart.match(/\d+/)[0]; // 提取数字
            const contentPart = feedbackItems[i + 1]; // 剩余内容
            
            // 提取原句、问题、建议和解释
            const originalMatch = contentPart.match(/"([^"]+)"/) || contentPart.match(/"([^"]+)"/);
            const original = originalMatch ? originalMatch[1] : '';
            
            const problemMatch = contentPart.match(/问题[:：](.+?)建议[:：]/s);
            const problem = problemMatch ? problemMatch[1].trim() : '';
            
            const suggestionMatch = contentPart.match(/建议[:：](.+?)解释[:：]/s);
            const suggestion = suggestionMatch ? suggestionMatch[1].trim() : '';
            
            const explanationMatch = contentPart.match(/解释[:：](.+?)(?=\d+\.\s+原句[:：]|$)/s);
            const explanation = explanationMatch ? explanationMatch[1].trim() : '';
            
            // 构建HTML
            formattedHTML += `
                <div class="feedback-item">
                    <div class="feedback-item-header">
                        <div class="feedback-item-number">${number}</div>
                    </div>
                    <div class="feedback-section">
                        <div class="feedback-label"><i class="fas fa-quote-left"></i> 原句</div>
                        <div class="feedback-original">${original}</div>
                    </div>
                    <div class="feedback-section">
                        <div class="feedback-label"><i class="fas fa-exclamation-circle"></i> 问题</div>
                        <div class="feedback-problem">${problem}</div>
                    </div>
                    <div class="feedback-section">
                        <div class="feedback-label"><i class="fas fa-lightbulb"></i> 建议</div>
                        <div class="feedback-correction">${suggestion.replace(/^["'](.+)["']$/, '$1')}</div>
                    </div>
                    <div class="feedback-section">
                        <div class="feedback-label"><i class="fas fa-info-circle"></i> 解释</div>
                        <div class="feedback-explanation">${explanation}</div>
                    </div>
                </div>
            `;
        }
        
        return formattedHTML || '<div class="empty-message">无法解析反馈内容</div>';
    }
}

// 用于全局导航的函数
function navigateTo(pageName) {
    uiManager.navigateTo(pageName);
}

// 创建UI管理器实例
const uiManager = new UiManager();

// 将UI管理器绑定到全局window对象，确保在HTML的onclick事件中可以访问
window.uiManager = uiManager;