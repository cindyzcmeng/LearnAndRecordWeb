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
        
        // 语音输入按钮事件已在initSpeechRecognition中处理
        
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
        // 暂时禁用Web Speech API，改为显示提示信息
        this.voiceInputBtn.addEventListener('click', () => {
            uiManager.showModal(`
                <div class="info-message">
                    <h3>语音输入提示</h3>
                    <p>网页版语音输入功能暂未上线，请使用手机自带的语音输入功能。</p>
                    <button class="primary-btn" onclick="uiManager.hideModal();">我知道了</button>
                </div>
            `);
        });
        
        // 更新按钮提示
        this.voiceInputBtn.title = '语音输入功能暂未上线';
        
        /*
        // 以下代码已禁用，不会执行 - 保留仅供参考
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
        */
    }
    
    // 切换语音输入
    toggleVoiceInput() {
        // 该方法已被禁用，由initSpeechRecognition中的事件监听器替代
        /*
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
        */
    }
    
    // 添加消息到聊天界面
    addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        
        // 处理带有拼音的消息（仅适用于bot消息）
        if (sender === 'bot') {
            // 分离消息和拼音
            const parts = message.split(/\[|\]/); // 用[或]分割
            if (parts.length >= 2) {
                // 有拼音标注
                const messageContent = document.createElement('span');
                messageContent.textContent = parts[0].trim(); // 原始消息部分
                
                const pinyinElement = document.createElement('span');
                pinyinElement.className = 'pinyin';
                pinyinElement.textContent = parts[1].trim(); // 拼音部分
                
                messageElement.appendChild(messageContent);
                messageElement.appendChild(pinyinElement);
            } else {
                // 没有找到拼音标注
                messageElement.textContent = message;
            }
        } else {
            // 用户消息直接显示
            messageElement.textContent = message;
        }
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    // 添加加载中指示器
    addTypingIndicator() {
        const indicatorElement = document.createElement('div');
        indicatorElement.className = 'message bot-typing';
        indicatorElement.id = 'bot-typing-indicator';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        // 添加三个小点
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingIndicator.appendChild(dot);
        }
        
        indicatorElement.appendChild(typingIndicator);
        this.chatMessages.appendChild(indicatorElement);
        this.scrollToBottom();
    }
    
    // 移除加载中指示器
    removeTypingIndicator() {
        const indicator = document.getElementById('bot-typing-indicator');
        if (indicator) {
            indicator.remove();
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
            // 显示加载中指示器，而不是全屏加载层
            this.addTypingIndicator();
            
            // 发送消息到API
            const reply = await apiService.sendMessage(message);
            
            // 移除加载中指示器
            this.removeTypingIndicator();
            
            // 添加AI回复到聊天界面
            this.addMessage(reply, 'bot');
            
            // 自动滚动到底部
            this.scrollToBottom();
            
            // 如果对话次数达到6次，提示是否结束对话
            if (this.messageCount >= 6) {
                this.showEndChatPrompt();
            }
        } catch (error) {
            // 移除加载中指示器
            this.removeTypingIndicator();
            
            uiManager.showError('发送消息失败: ' + error.message);
        }
    }
    
    // 添加系统消息（不显示在界面上）
    addSystemMessage(message) {
        // 使用新的updateSystemPrompt方法更新系统消息
        apiService.updateSystemPrompt(message);
    }
    
    // 发送初始机器人消息
    async sendInitialBotMessage() {
        try {
            // 显示加载中指示器，而不是全屏加载层
            this.addTypingIndicator();
            
            // 发送一个空消息来获取初始回复
            const reply = await apiService.sendMessage("请开始对话");
            
            // 移除加载中指示器
            this.removeTypingIndicator();
            
            // 添加AI回复到聊天界面
            this.addMessage(reply, 'bot');
        } catch (error) {
            // 移除加载中指示器
            this.removeTypingIndicator();
            
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
            // 显示加载中指示器
            this.addTypingIndicator();
            
            // 获取所有用户消息
            const userMessages = apiService.getConversationHistory()
                .filter(msg => msg.role === 'user')
                .map(msg => msg.content)
                .join('\n\n');
            
            // 获取反馈
            const feedback = await apiService.sendMessage(userMessages, true);
            
            // 移除加载中指示器
            this.removeTypingIndicator();
            
            // 显示反馈
            this.feedbackContent.innerHTML = uiManager.formatFeedback(feedback);
            this.feedbackContainer.classList.remove('hidden');
            
            // 保存到历史记录
            this.saveToHistory(feedback);
            
        } catch (error) {
            // 移除加载中指示器
            this.removeTypingIndicator();
            
            uiManager.showError('获取反馈失败: ' + error.message);
        }
    }
    
    // 保存对话到历史记录
    saveToHistory(feedback) {
        // 获取场景信息
        const sceneName = document.getElementById('current-scene-title').textContent;
        if(!sceneName || sceneName === '未选择') return;
        
        // 获取所有对话内容
        const messages = apiService.getConversationHistory();
        let chatContent = '';
        
        // 提取对话内容
        messages.forEach(msg => {
            if(msg.role === 'user' || msg.role === 'assistant') {
                const role = msg.role === 'user' ? '我' : '对方';
                chatContent += `${role}: ${msg.content}\n\n`;
            }
        });
        
        if(!chatContent) return;
        
        // 创建新的历史记录项
        const newHistory = {
            id: Date.now().toString(),
            title: `对话: ${sceneName}`,
            text: chatContent,
            feedback: feedback,
            createdAt: new Date().toISOString(),
            isConversation: true
        };
        
        // 添加到历史记录
        // 检查diaryManager是否存在
        if(typeof diaryManager !== 'undefined') {
            diaryManager.diaries.push(newHistory);
            diaryManager.saveDiaries();
            
            // 成功提示
            uiManager.showModal(`
                <div class="success-message">
                    <h3>保存成功</h3>
                    <p>对话已保存到历史记录</p>
                    <button class="primary-btn" onclick="uiManager.hideModal();">我知道了</button>
                </div>
            `);
        }
    }
}

// 创建聊天管理器实例
const chatManager = new ChatManager(); 