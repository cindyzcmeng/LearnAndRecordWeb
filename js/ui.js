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
        // 处理反馈格式
        return feedbackText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n/g, '<br>');
    }
}

// 用于全局导航的函数
function navigateTo(pageName) {
    uiManager.navigateTo(pageName);
}

// 创建UI管理器实例
const uiManager = new UiManager(); 