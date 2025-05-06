// 聊天管理服务
class ChatManager {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendMessageBtn = document.getElementById('send-message-btn');
        this.voiceInputBtn = document.getElementById('voice-input-btn');
        this.endChatBtn = document.getElementById('end-chat-btn');
        this.getFeedbackBtn = document.getElementById('get-feedback-btn');
        this.feedbackContainer = document.getElementById('feedback-container');
        this.feedbackContent = document.getElementById('feedback-content');
        this.closeFeedbackBtn = document.getElementById('close-feedback-btn');
        
        this.recognition = null;
        this.isListening = false;
        this.messageCount = 0;
        
        this.initEventListeners();
        this.initSpeechRecognition();
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 发送消息按钮
        this.sendMessageBtn.addEventListener('click', () => {
            this.sendUserMessage();
        });
        
        // 输入框回车键发送
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendUserMessage();
            }
        });
        
        // 语音输入按钮
        this.voiceInputBtn.addEventListener('click', () => {
            this.toggleVoiceInput();
        });
        
        // 结束对话按钮
        this.endChatBtn.addEventListener('click', () => {
            this.endChat();
        });
        
        // 获取反馈按钮
        this.getFeedbackBtn.addEventListener('click', () => {
            this.getFeedback();
        });
        
        // 关闭反馈按钮
        this.closeFeedbackBtn.addEventListener('click', () => {
            this.feedbackContainer.classList.add('hidden');
        });
    }
    
    // 初始化语音识别
    initSpeechRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = CONFIG.SPEECH_RECOGNITION.language;
            
            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                    
                this.chatInput.value = transcript;
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            };
            
            this.recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                this.isListening = false;
                this.voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            };
        } else {
            this.voiceInputBtn.disabled = true;
            this.voiceInputBtn.title = '您的浏览器不支持语音识别';
        }
    }
    
    // 切换语音输入
    toggleVoiceInput() {
        if (!this.recognition) return;
        
        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        } else {
            this.recognition.start();
            this.isListening = true;
            this.voiceInputBtn.innerHTML = '<i class="fas fa-stop"></i>';
        }
    }
    
    // 发送用户消息
    async sendUserMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // 添加用户消息到聊天界面
        this.addMessage(message, 'user');
        
        // 清空输入框
        this.chatInput.value = '';
        
        // 增加消息计数
        this.messageCount++;
        
        try {
            uiManager.showLoading();
            
            // 发送消息到API
            const reply = await apiService.sendMessage(message);
            
            // 添加AI回复到聊天界面
            this.addMessage(reply, 'bot');
            
            uiManager.hideLoading();
            
            // 自动滚动到底部
            this.scrollToBottom();
            
            // 如果对话次数达到6次，提示是否结束对话
            if (this.messageCount >= 6) {
                this.showEndChatPrompt();
            }
        } catch (error) {
            uiManager.hideLoading();
            uiManager.showError('发送消息失败: ' + error.message);
        }
    }
    
    // 添加消息到聊天界面
    addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = message;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    // 添加系统消息（不显示在界面上）
    addSystemMessage(message) {
        // 这个消息不会显示在界面上，只会发送到API
        apiService.sendMessage(message);
    }
    
    // 发送初始机器人消息
    async sendInitialBotMessage() {
        try {
            uiManager.showLoading();
            
            // 发送一个空消息来获取初始回复
            const reply = await apiService.sendMessage("请开始对话");
            
            // 添加AI回复到聊天界面
            this.addMessage(reply, 'bot');
            
            uiManager.hideLoading();
        } catch (error) {
            uiManager.hideLoading();
            uiManager.showError('初始化对话失败: ' + error.message);
        }
    }
    
    // 滚动到底部
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    // 结束对话
    endChat() {
        uiManager.showConfirm('确定要结束当前对话吗？', () => {
            // 重置场景选择
            document.querySelector('.current-scene-info').classList.add('hidden');
            document.getElementById('scene-selection').classList.remove('hidden');
            document.getElementById('chat-container').classList.add('hidden');
            this.feedbackContainer.classList.add('hidden');
            
            // 清空聊天记录
            this.chatMessages.innerHTML = '';
            this.messageCount = 0;
        });
    }
    
    // 显示结束对话提示
    showEndChatPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'chat-prompt';
        prompt.textContent = '您已完成6轮对话，考虑获取反馈或结束对话';
        
        this.chatMessages.appendChild(prompt);
        this.scrollToBottom();
    }
    
    // 获取反馈
    async getFeedback() {
        try {
            uiManager.showLoading();
            
            // 获取所有用户消息
            const userMessages = apiService.getConversationHistory()
                .filter(msg => msg.role === 'user')
                .map(msg => msg.content)
                .join('\n\n');
            
            // 获取反馈
            const feedback = await apiService.sendMessage(userMessages, true);
            
            // 显示反馈
            this.feedbackContent.innerHTML = uiManager.formatFeedback(feedback);
            this.feedbackContainer.classList.remove('hidden');
            
            uiManager.hideLoading();
        } catch (error) {
            uiManager.hideLoading();
            uiManager.showError('获取反馈失败: ' + error.message);
        }
    }
}

// 创建聊天管理器实例
const chatManager = new ChatManager(); 