const translations = {
    zh: {
        // 通用
        "app-title": "L&R 网页测试版",
        "welcome": "欢迎使用L&R 网页测试版",
        "welcome-subtitle": "通过定制场景和AI助手练习汉语，提高口语和写作能力",
        
        // 功能模块
        "scene-generator": "场景生成",
        "scene-generator-desc": "创建定制对话场景",
        "dialogue-practice": "对话练习",
        "dialogue-practice-desc": "与AI助手进行对话",
        "voice-diary": "语音日记",
        "voice-diary-desc": "录制获取语言反馈",
        "history": "历史记录",
        "history-desc": "查看学习记录和反馈",
        
        // 按钮文本
        "start": "开始",
        "submit": "提交",
        "cancel": "取消",
        "close": "关闭",
        "comment": "留言",
        "refresh": "刷新",
        "back": "返回",
        "start-dialogue": "开始对话",
        "end-dialogue": "退出对话",
        "get-feedback": "获取反馈",
        "delete": "删除",
        "save": "保存",
        "generate": "生成场景",
        
        // 表单标签
        "your-name": "你的名字",
        "message-content": "留言内容",
        "scene-title": "场景标题",
        "scene-description": "场景描述",
        "diary-title": "日记标题",
        "diary-content": "日记内容",
        
        // 其他UI文本
        "leave-comment": "留下你的评论",
        "select-scene": "选择对话场景",
        "current-scene": "当前场景：",
        "not-selected": "未选择",
        "view-details": "查看详情",
        "learning-objectives": "学习目标",
        "key-phrases": "关键短语",
        "example-dialogue": "示例对话",
        "cultural-background": "文化背景",
        "type-message": "输入你的回复...",
        "click-to-record": "点击下方按钮开始录音",
        "save-feedback": "保存并获取反馈",
        "processing": "处理中...",
        "language-feedback": "语言反馈",
        "back-to-list": "返回列表",
        "back-to-scenes": "返回场景列表",
        
        // 导航栏
        "nav-home": "首页",
        "nav-scene": "场景生成",
        "nav-dialogue": "对话练习",
        "nav-diary": "语音日记",
        "nav-history": "历史记录",
        
        // 历史记录标签
        "tab-all": "全部",
        "tab-diary": "日记",
        "tab-conversation": "对话",
        
        // 角色信息
        "ai-role": "AI角色",
        "user-role": "你的角色",
        "dialogue-task": "对话任务",
        
        // 示例文本
        "scene-title-example": "例如：餐厅点餐",
        "scene-desc-example": "简单描述这个场景，例如：在中国餐厅点菜并询问菜品",
        "diary-title-example": "给你的日记起个标题",
        "diary-content-example": "这里显示语音识别的文本，你可以编辑"
    },
    en: {
        // 通用
        "app-title": "L&R Web Beta",
        "welcome": "Welcome to L&R Web Beta",
        "welcome-subtitle": "Practice Chinese with customized scenarios and AI assistant",
        
        // 功能模块
        "scene-generator": "Scene Generator",
        "scene-generator-desc": "Create custom dialogue scenarios",
        "dialogue-practice": "Dialogue Practice",
        "dialogue-practice-desc": "Practice with AI assistant",
        "voice-diary": "Voice Diary",
        "voice-diary-desc": "Record and get language feedback",
        "history": "History",
        "history-desc": "View learning records and feedback",
        
        // 按钮文本
        "start": "Start",
        "submit": "Submit",
        "cancel": "Cancel",
        "close": "Close",
        "comment": "Comment",
        "refresh": "Refresh",
        "back": "Back",
        "start-dialogue": "Start Dialogue",
        "end-dialogue": "End Dialogue",
        "get-feedback": "Get Feedback",
        "delete": "Delete",
        "save": "Save",
        "generate": "Generate Scene",
        
        // 表单标签
        "your-name": "Your Name",
        "message-content": "Message Content",
        "scene-title": "Scene Title",
        "scene-description": "Scene Description",
        "diary-title": "Diary Title",
        "diary-content": "Diary Content",
        
        // 其他UI文本
        "leave-comment": "Leave Your Comment",
        "select-scene": "Select Dialogue Scene",
        "current-scene": "Current Scene: ",
        "not-selected": "Not Selected",
        "view-details": "View Details",
        "learning-objectives": "Learning Objectives",
        "key-phrases": "Key Phrases",
        "example-dialogue": "Example Dialogue",
        "cultural-background": "Cultural Background",
        "type-message": "Type your message...",
        "click-to-record": "Click the button below to start recording",
        "save-feedback": "Save and Get Feedback",
        "processing": "Processing...",
        "language-feedback": "Language Feedback",
        "back-to-list": "Back to List",
        "back-to-scenes": "Back to Scenes",
        
        // 导航栏
        "nav-home": "Home",
        "nav-scene": "Scene Generator",
        "nav-dialogue": "Dialogue Practice",
        "nav-diary": "Voice Diary",
        "nav-history": "History",
        
        // 历史记录标签
        "tab-all": "All",
        "tab-diary": "Diary",
        "tab-conversation": "Conversation",
        
        // 角色信息
        "ai-role": "AI Role",
        "user-role": "Your Role",
        "dialogue-task": "Dialogue Task",
        
        // 示例文本
        "scene-title-example": "e.g., Restaurant Ordering",
        "scene-desc-example": "Briefly describe the scene, e.g., Ordering food and asking about dishes in a Chinese restaurant",
        "diary-title-example": "Give your diary a title",
        "diary-content-example": "Speech recognition text will appear here, you can edit it"
    }
};

let currentLang = localStorage.getItem('language') || 'zh';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    updateUILanguage();
}

function getText(key) {
    return translations[currentLang][key] || translations['zh'][key];
}

function updateUILanguage() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = getText(key);
        } else {
            element.textContent = getText(key);
        }
    });
}

// 初始化语言
document.addEventListener('DOMContentLoaded', () => {
    // 设置初始语言
    const savedLang = localStorage.getItem('language') || 'zh';
    setLanguage(savedLang);
    
    // 设置语言切换按钮的初始文本
    document.querySelector('[data-i18n="current-lang"]').textContent = 
        savedLang === 'zh' ? '中/EN' : '中/EN';
}); 