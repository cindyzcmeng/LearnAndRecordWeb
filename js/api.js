// API交互服务
class ApiService {
    constructor() {
        this.apiKey = CONFIG.DEEPSEEK_API_KEY;
        this.apiUrl = CONFIG.API_URL;
        this.systemPrompt = CONFIG.SYSTEM_PROMPT;
        this.conversationHistory = [];
        this.loadConversationHistory();
    }
    
    // 初始化对话历史，添加系统消息
    initConversation() {
        this.conversationHistory = [{
            role: 'system',
            content: this.systemPrompt
        }];
        this.saveConversationHistory();
    }
    
    // 加载对话历史
    loadConversationHistory() {
        const savedHistory = localStorage.getItem(CONFIG.STORAGE_KEYS.CONVERSATION_HISTORY);
        if (savedHistory) {
            try {
                this.conversationHistory = JSON.parse(savedHistory);
            } catch (e) {
                console.error('无法解析对话历史:', e);
                this.initConversation();
            }
        } else {
            this.initConversation();
        }
    }
    
    // 保存对话历史
    saveConversationHistory() {
        localStorage.setItem(
            CONFIG.STORAGE_KEYS.CONVERSATION_HISTORY, 
            JSON.stringify(this.conversationHistory)
        );
    }
    
    // 发送消息到DeepSeek API
    async sendMessage(message, onlyForFeedback = false) {
        let messages;
        
        if (onlyForFeedback) {
            // 为反馈创建一个新的临时会话，不影响主要对话历史
            messages = [
                {
                    role: 'system',
                    content: `你是一位专业的汉语教师和语言评估专家，了解纠正性反馈理论，擅长分析对话并提供有针对性的语言学习反馈。
                    
分析要求：
1. 必须对用户的每一句话分别进行分析，不要漏掉任何一句
2. 根据偏误分类（词汇偏误、语法偏误；整体偏误、局部偏误；显性偏误、隐性偏误），对用户的问题进行分类。
3. 每个错误都提供详细解释和语法规则
4. 格式必须严格按照条目清晰列出

请按照以下格式输出反馈：
1. 原句："用户原句"
   问题：词汇偏误/语法偏误（需指出具体语法点）；整体偏误/局部偏误；显性偏误/隐性偏误（若为隐性偏误，则归为“没有明显错误”）
   建议："更自然的表达"
   解释：简短的语法解释或使用规则
   
2. 原句："用户的另一句话"
   ...（以此类推）

如果没有明显错误，可以表扬并提供更地道的表达。`
                },
                {
                    role: 'user',
                    content: `请对以下对话内容进行语言分析和纠错：\n\n${message}`
                }
            ];
        } else {
            // 添加用户消息到历史
            this.conversationHistory.push({
                role: 'user',
                content: message
            });
            
            // 使用完整对话历史
            messages = this.conversationHistory;
        }
        
        const requestBody = {
            model: 'deepseek-chat',
            messages: messages,
            temperature: onlyForFeedback ? 0.2 : 0.8
        };
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            const reply = data.choices[0].message.content;
            
            if (!onlyForFeedback) {
                // 将AI回复添加到历史中
                this.conversationHistory.push({
                    role: 'assistant',
                    content: reply
                });
                
                this.saveConversationHistory();
            }
            
            return reply;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }
    
    // 获取对话任务卡片内容
    async getDialogTaskCard(title, description) {
        const promptMessage = `请为以下场景生成对话任务卡片内容，包括BOT角色描述、用户角色描述和对话任务描述。
        
场景标题：${title}
场景描述：${description}

要求：
1. 每个描述必须简短清晰（15-25个字为宜）
2. 内容要有指导性，帮助用户理解对话情境
3. 每个描述应当具体明确，避免过于笼统
4. 根据场景特点定制内容

请严格按照以下JSON格式返回（不要添加多余内容）：
{
  "botRole": "BOT角色的简短描述",
  "userRole": "用户角色的简短描述",
  "dialogueTask": "对话任务的简短描述"
}`;

        const messages = [
            {
                role: 'system',
                content: `你是一位专业的语言学习内容设计师，擅长创建简短清晰的对话场景和角色描述。
请根据用户提供的场景信息，生成适合语言学习的对话任务卡片内容。
只返回符合要求的JSON格式数据，不要添加任何其他解释或描述。
确保输出是有效的JSON格式，可以被直接解析。`
            },
            {
                role: 'user',
                content: promptMessage
            }
        ];
        
        const requestBody = {
            model: 'deepseek-chat',
            messages: messages,
            temperature: 0.3
        };
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            const content = data.choices[0].message.content;
            
            try {
                return JSON.parse(content);
            } catch (e) {
                console.error('解析JSON响应失败:', e);
                // 尝试提取JSON内容
                const match = content.match(/\{[\s\S]*\}/);
                if (match) {
                    return JSON.parse(match[0]);
                }
                throw new Error('无法解析任务卡片内容');
            }
        } catch (error) {
            console.error('获取对话任务卡片错误:', error);
            throw error;
        }
    }
    
    // 获取对话历史
    getConversationHistory() {
        // 返回历史记录的副本，不包括系统消息
        return this.conversationHistory.filter(msg => msg.role !== 'system');
    }
    
    // 重置对话历史
    resetConversation() {
        this.initConversation();
    }
}

// 创建API服务实例
const apiService = new ApiService(); 