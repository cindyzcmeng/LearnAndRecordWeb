// 评论功能管理
class CommentManager {
    constructor() {
        // 获取DOM元素
        this.commentBtn = document.getElementById('comment-btn');
        this.commentModal = document.getElementById('comment-modal');
        this.closeModalBtn = document.querySelector('.close-comment-modal');
        this.commentForm = document.getElementById('commentForm');
        this.homeCommentForm = document.getElementById('homeCommentForm');
        this.resultMsg = document.getElementById('resultMsg');
        this.homeResultMsg = document.getElementById('homeResultMsg');
        
        // 使用代理API端点
        this.apiEndpoint = "/api/send-comment";

        this.initListeners();
    }
    
    // 初始化事件监听器
    initListeners() {
        // 点击评论按钮显示模态框
        this.commentBtn.addEventListener('click', () => this.showModal());
        
        // 点击关闭按钮隐藏模态框
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        
        // 点击模态框外部关闭
        this.commentModal.addEventListener('click', (e) => {
            if (e.target === this.commentModal) {
                this.hideModal();
            }
        });
        
        // 模态框内的评论表单提交
        this.commentForm.addEventListener('submit', (e) => this.handleSubmit(e, this.resultMsg));
        
        // 主页评论表单提交
        if (this.homeCommentForm) {
            this.homeCommentForm.addEventListener('submit', (e) => this.handleSubmit(e, this.homeResultMsg));
        }
    }
    
    // 显示评论模态框
    showModal() {
        this.commentModal.style.display = 'flex';
        setTimeout(() => {
            this.commentModal.classList.add('show');
        }, 10);
    }
    
    // 隐藏评论模态框
    hideModal() {
        this.commentModal.classList.remove('show');
        setTimeout(() => {
            this.commentModal.style.display = 'none';
        }, 300);
    }
    
    // 处理表单提交
    handleSubmit(e, resultMsgElement) {
        e.preventDefault();

        const name = e.target.name.value.trim();
        const message = e.target.message.value.trim();

        if (!message) {
            this.showMessage(resultMsgElement, "留言内容不能为空", "error");
            return;
        }

        fetch(this.apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showMessage(resultMsgElement, "留言已发送！谢谢你的反馈。", "success");
                e.target.reset();
            } else {
                this.showMessage(resultMsgElement, "发送失败：" + (data.error || "请稍后再试。"), "error");
            }
        })
        .catch(error => {
            console.error('发送评论失败:', error);
            this.showMessage(resultMsgElement, "发送失败，请稍后再试。", "error");
        });
    }
    
    // 显示结果消息
    showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'result-msg ' + type;
        
        // 5秒后清除消息
        setTimeout(() => {
            element.textContent = '';
            element.className = 'result-msg';
        }, 5000);
    }
}

// 创建评论管理器实例
const commentManager = new CommentManager(); 