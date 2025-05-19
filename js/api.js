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
5. 如果没有明显错误，可以表扬并提供更地道的表达。

请以JSON格式返回分析结果，格式如下：
{
    "feedback": [
        {
            "original": {
                "chinese": "用户原句",
                "english": "User's original sentence"
            },
            "issue": {
                "chinese": "词汇/语法偏误（需指出具体语法类型），整体/局部偏误，显性/隐性偏误",
                "english": "Vocabulary/Grammar (indicate error type), Global/Partial error, Explicit/Implicit error"
            },
            "suggestion": {
                "chinese": "更自然的表达",
                "english": "More natural expression"
            },
            "explanation": {
                "chinese": "语法解释或使用规则",
                "english": "Grammar explanation or usage rules"
            }
        }
    ]
}`
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
5. 必须同时提供中文和英文两种语言的描述，内容要一致
6. 不接受只有中文或只有英文的结果

请严格按照以下JSON格式返回（不要添加多余内容）：
{
  "botRole":
  {
    "chinese":"BOT角色的简短描述(中文)",
    "english":"BOT role description(English)"
  },
  "userRole":
  {
    "chinese":"用户角色的简短描述(中文)",
    "english":"User role description(English)"
  },
  "dialogueTask":
  {
    "chinese":"对话任务的简短描述(中文)",
    "english":"Dialogue task description(English)"
  }
}`;

        const messages = [
            {
                role: 'system',
                content: `你是一位专业的双语语言学习内容设计师，擅长创建中英双语的对话场景和角色描述。
你的任务是根据用户提供的场景信息，生成既有中文又有英文的对话任务卡片内容。
必须确保同时返回每一项内容的中文和英文版本，且中英文意思一致。
只返回符合要求的JSON格式数据，不要添加任何其他解释或描述。
确保输出是有效的JSON格式，可以被直接解析。
在任何情况下，都不接受只有单语言(只有中文或只有英文)的输出结果。`
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
    
    // 获取场景相关表达
    async getSceneExpressions(title, description, botRole, userRole, dialogueTask) {
        // 获取角色的中文表示
        const botRoleChinese = typeof botRole === 'object' ? botRole.chinese : botRole;
        const userRoleChinese = typeof userRole === 'object' ? userRole.chinese : userRole;
        const dialogueTaskChinese = typeof dialogueTask === 'object' ? dialogueTask.chinese : dialogueTask;
        
        const promptMessage = `请为以下中文学习场景生成相关表达数据，包括学习目标、关键短语、示例对话和文化背景。

场景标题：${title}
场景描述：${description}
AI角色：${botRoleChinese}
用户角色：${userRoleChinese}
对话任务：${dialogueTaskChinese}

要求：
1. 学习目标：简明描述学习者通过这个场景应该学会什么语言技能和表达能力，必须同时提供中英文描述。
2. 关键短语：提供5-8个在这个场景中最常用的短语，每个短语必须包含中文、拼音和英文翻译。
3. 示例对话：提供一段3-5轮的示例对话，每个对话中的角色、内容必须包含中文、拼音和英文翻译。注意对话中的角色名称需要与提供的AI角色和用户角色匹配。
4. 文化背景：简述与这个场景相关的中国文化知识点，必须同时提供中英文描述。

所有内容必须同时对中文学习者有价值，且符合实际中国人的语言使用习惯。所有拼音必须准确无误。

请严格按照以下JSON格式返回（不要添加多余内容）：
{
  "learningObjectives":
    {
        "chinese":"学习目标内容",
        "english":"Learning objectives content"
    },
  "keyPhrases": [
    {
      "chinese": "中文短语1",
      "pinyin": "Zhōngwén duǎnyǔ 1",
      "english": "Chinese phrase 1"
    },
    // 更多短语...
  ],
  "exampleDialogue": [
    {
      "role": {
        "chinese": "角色中文名",
        "english": "Role English name"
      },
      "chinese": "中文对话1",
      "pinyin": "Zhōngwén duìhuà 1",
      "english": "Chinese dialogue 1"
    },
    // 更多对话...
  ],
  "culturalBackground":
    {
        "chinese":"文化背景内容",
        "english":"Cultural background content"
    }
}`;

        const messages = [
            {
                role: 'system',
                content: `你是一位专业的中文教学内容设计专家，精通中文、英文及拼音标注。
请根据用户提供的场景信息，生成适合中文学习者的双语相关表达和学习资料。
必须同时生成中文和英文内容，确保所有需要双语的字段都有完整的中英文内容。
对于示例对话中的角色名称，请使用对象格式包含中英文名称，与整体格式保持一致。
只返回符合要求的JSON格式数据，不要添加任何其他解释或描述。
确保输出是有效的JSON格式，可以被直接解析。
拼音必须准确无误，使用标准汉语拼音。`
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
                throw new Error('无法解析场景表达内容');
            }
        } catch (error) {
            console.error('获取场景表达内容错误:', error);
            throw error;
        }
    }
    
    // 重置对话历史
    resetConversation() {
        this.initConversation();
    }

    // 添加系统消息
    updateSystemPrompt(customPrompt) {
        // 如果对话历史为空，初始化它
        if (this.conversationHistory.length === 0) {
            this.initConversation();
        }
        
        // 替换第一条系统消息或添加新的系统消息
        if (this.conversationHistory.length > 0 && this.conversationHistory[0].role === 'system') {
            // 更新现有的系统消息
            this.conversationHistory[0].content = this.systemPrompt + "\n\n" + customPrompt;
        } else {
            // 如果第一条不是系统消息，在开头添加一条
            this.conversationHistory.unshift({
                role: 'system',
                content: this.systemPrompt + "\n\n" + customPrompt
            });
        }
        
        // 保存更新后的对话历史
        this.saveConversationHistory();
    }
}

// 创建API服务实例
const apiService = new ApiService(); 