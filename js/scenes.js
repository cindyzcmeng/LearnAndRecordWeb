// 场景管理服务
class SceneManager {
    constructor() {
        this.scenes = [];
        this.currentScene = null;
        this.generateSceneBtn = document.getElementById('generate-scene-btn');
        this.sceneTitle = document.getElementById('scene-title');
        this.sceneDescription = document.getElementById('scene-description');
        this.sceneResult = document.getElementById('scene-result');
        this.botRole = document.getElementById('bot-role');
        this.userRole = document.getElementById('user-role');
        this.dialogueTask = document.getElementById('dialogue-task');
        this.startDialogueBtn = document.getElementById('start-dialogue-btn');
        this.sceneList = document.getElementById('scene-list');
        this.viewSceneDetailsBtn = document.getElementById('view-scene-details');
        
        // 场景相关表达元素
        this.sceneExpressions = document.getElementById('scene-expressions');
        this.learningObjectives = document.getElementById('learning-objectives');
        this.keyPhrases = document.getElementById('key-phrases');
        this.exampleDialogue = document.getElementById('example-dialogue');
        this.culturalBackground = document.getElementById('cultural-background');
        this.backToScenesBtn = document.getElementById('back-to-scenes-btn');
        this.startSceneChatBtn = document.getElementById('start-scene-chat-btn');
        
        // 检查必要元素是否存在
        if (!this.sceneExpressions) {
            console.error('场景相关表达容器元素不存在!');
        }
        if (!this.backToScenesBtn) {
            console.error('返回场景列表按钮元素不存在!');
        }
        if (!this.startSceneChatBtn) {
            console.error('开始场景对话按钮元素不存在!');
        }
        
        // 使用延迟初始化，确保DOM元素完全加载
        setTimeout(() => {
            // 重新获取可能由于加载时机问题未找到的元素
            if (!this.backToScenesBtn) {
                this.backToScenesBtn = document.getElementById('back-to-scenes-btn');
                console.log('延迟初始化 - 返回场景列表按钮:', this.backToScenesBtn);
            }
            if (!this.startSceneChatBtn) {
                this.startSceneChatBtn = document.getElementById('start-scene-chat-btn');
                console.log('延迟初始化 - 开始场景对话按钮:', this.startSceneChatBtn);
            }
            // 重新绑定事件
            this.initExpressionButtonEvents();
        }, 500);
        
        // 初始化事件监听器
        this.initEventListeners();
        
        // 定义预设场景数据
        this.initPresetScenes();
        
        // 加载场景
        this.resetScenesCache(false);
        this.loadScenes();
    }
    
    // 初始化预设场景
    initPresetScenes() {
        // 确保所有预设场景都有isPreset=true标记
        this.presetScenes = [
            {
                id: 'preset-1',
                title: '餐厅点餐',
                description: '在中国餐厅点菜并询问菜品',
                botRole: '热情的中国餐厅服务员',
                userRole: '初次到中国餐厅用餐的外国游客',
                dialogueTask: '点餐并了解几道中国特色菜品的做法和原料',
                createdAt: new Date('2023-01-01').toISOString(),
                isPreset: true,
                expressions: {
                    learningObjectives: '学习餐厅用餐常用词汇和表达，能够熟练点餐和询问菜品信息',
                    keyPhrases: [
                        {
                            chinese: '请问有什么推荐的菜？',
                            pinyin: 'Qǐngwèn yǒu shénme tuījiàn de cài?',
                            english: 'What dishes do you recommend?'
                        },
                        {
                            chinese: '这个菜是怎么做的？',
                            pinyin: 'Zhège cài shìzěnme zuò de?',
                            english: 'How is this dish made?'
                        },
                        {
                            chinese: '我要一份...',
                            pinyin: 'Wǒ yào yī fèn...',
                            english: 'I would like a portion of...'
                        }
                    ],
                    exampleDialogue: [
                        {
                            role: '服务员',
                            chinese: '您好，欢迎光临，请问几位？',
                            pinyin: 'Nín hǎo, huānyíng guānglín, qǐngwèn jǐ wèi?',
                            english: 'Hello, welcome, how many people?'
                        },
                        {
                            role: '顾客',
                            chinese: '两位，请给我们一个靠窗的位置。',
                            pinyin: 'Liǎng wèi, qǐng gěi wǒmen yīgè kào chuāng de wèizhi.',
                            english: 'Two people, please give us a seat by the window.'
                        }
                    ],
                    culturalBackground: '在中国餐厅，通常采用分享制用餐，即点多道菜放在桌子中央，每个人分享所有菜品。这与西方餐厅每人点各自餐点的方式不同。中国人非常注重用餐礼仪，如给长辈夹菜、使用公筷等。'
                }
            },
            {
                id: 'preset-2',
                title: '医院问诊',
                description: '在医院看感冒并描述症状',
                botRole: '细心的医生',
                userRole: '感冒生病的患者',
                dialogueTask: '描述感冒症状并咨询治疗方案和注意事项',
                createdAt: new Date('2023-01-02').toISOString(),
                isPreset: true,
                expressions: {
                    learningObjectives: '学习医院就诊相关词汇和表达，能够准确描述症状并理解医嘱',
                    keyPhrases: [
                        {
                            chinese: '我感觉不舒服',
                            pinyin: 'Wǒ gǎnjué bù shūfu',
                            english: 'I feel unwell'
                        },
                        {
                            chinese: '有什么症状？',
                            pinyin: 'Yǒu shénme zhèngzhuàng?',
                            english: 'What symptoms do you have?'
                        },
                        {
                            chinese: '需要吃什么药？',
                            pinyin: 'Xūyào chī shénme yào?',
                            english: 'What medicine should I take?'
                        }
                    ],
                    exampleDialogue: [
                        {
                            role: '医生',
                            chinese: '请问哪里不舒服？',
                            pinyin: 'Qǐngwèn nǎlǐ bù shūfu?',
                            english: 'Where do you feel unwell?'
                        },
                        {
                            role: '患者',
                            chinese: '我昨天开始发烧和咳嗽',
                            pinyin: 'Wǒ zuótiān kāishǐ fāshāo hé késou',
                            english: 'I started having a fever and cough yesterday'
                        }
                    ],
                    culturalBackground: '在中国看病时，医生会详细询问患者的症状和病史。中医和西医都很普及，病人可以选择不同的治疗方式。中国人看病通常会很重视预防和调养。'
                }
            },
            {
                id: 'preset-3',
                title: '购物讨价还价',
                description: '在市场购物并讨价还价',
                botRole: '小商品市场的摊主',
                userRole: '想要购买纪念品的游客',
                dialogueTask: '询问商品价格，讨价还价，并了解商品特色',
                createdAt: new Date('2023-01-03').toISOString(),
                isPreset: true,
                expressions: {
                    learningObjectives: '学习购物和讨价还价的常用词汇和表达，掌握中国特色的购物文化',
                    keyPhrases: [
                        {
                            chinese: '这个多少钱？',
                            pinyin: 'Zhège duōshao qián?',
                            english: 'How much is this?'
                        },
                        {
                            chinese: '能便宜一点吗？',
                            pinyin: 'Néng piányí yīdiǎn ma?',
                            english: 'Can you make it cheaper?'
                        },
                        {
                            chinese: '太贵了',
                            pinyin: 'Tài guì le',
                            english: "That's too expensive"
                        }
                    ],
                    exampleDialogue: [
                        {
                            role: '摊主',
                            chinese: '这个是纯手工制作的，很精致',
                            pinyin: 'Zhège shì chún shǒugōng zhìzuò de, hěn jīngzhì',
                            english: 'This is handmade, very exquisite'
                        },
                        {
                            role: '游客',
                            chinese: '能不能便宜一点？',
                            pinyin: 'Néng bùnéng piányí yīdiǎn?',
                            english: 'Can you make it a bit cheaper?'
                        }
                    ],
                    culturalBackground: '在中国的传统市场，讨价还价是很常见的购物方式。这不仅是一种交易方式，也是一种社交活动。买家和卖家通过讨价还价建立互动，体现了中国特色的购物文化。'
                }
            },
            {
                id: 'preset-4',
                title: '宾馆入住',
                description: '办理宾馆入住并询问相关服务',
                botRole: '宾馆前台服务人员',
                userRole: '刚到达宾馆的旅客',
                dialogueTask: '办理入住手续，询问宾馆设施和周边景点',
                createdAt: new Date('2023-01-04').toISOString(),
                isPreset: true,
                expressions: {
                    learningObjectives: '学习酒店入住相关词汇和表达，掌握预订房间和咨询服务的对话技能',
                    keyPhrases: [
                        {
                            chinese: '我要办理入住',
                            pinyin: 'Wǒ yào bànlǐ rùzhù',
                            english: 'I want to check in'
                        },
                        {
                            chinese: '有空房间吗？',
                            pinyin: 'Yǒu kōng fángjiān ma?',
                            english: 'Do you have any vacant rooms?'
                        },
                        {
                            chinese: '退房时间是几点？',
                            pinyin: 'Tuìfáng shíjiān shì jǐ diǎn?',
                            english: 'What time is check-out?'
                        }
                    ],
                    exampleDialogue: [
                        {
                            role: '前台',
                            chinese: '您好，请出示您的护照',
                            pinyin: 'Nín hǎo, qǐng chūshì nín de hùzhào',
                            english: 'Hello, please show your passport'
                        },
                        {
                            role: '旅客',
                            chinese: '我预订了一间双人房',
                            pinyin: 'Wǒ yùdìng le yī jiān shuāngrén fáng',
                            english: 'I booked a double room'
                        }
                    ],
                    culturalBackground: '在中国的宾馆，服务人员通常会很注重礼节和服务细节。入住时需要出示有效证件，如护照或身份证。许多宾馆都提供免费的茶水和拖鞋等中国特色服务。'
                }
            },
            {
                id: 'preset-5',
                title: '路边问路',
                description: '询问如何到达某个景点',
                botRole: '热心的当地居民',
                userRole: '迷路的旅行者',
                dialogueTask: '询问到达景点的路线、交通方式和所需时间',
                createdAt: new Date('2023-01-05').toISOString(),
                isPreset: true,
                expressions: {
                    learningObjectives: '学习问路和指路的常用词汇和表达，掌握描述位置和方向的语言技能',
                    keyPhrases: [
                        {
                            chinese: '请问怎么走？',
                            pinyin: 'Qǐngwèn zěnme zǒu?',
                            english: 'Excuse me, how do I get there?'
                        },
                        {
                            chinese: '往哪个方向？',
                            pinyin: 'Wǎng nǎge fāngxiàng?',
                            english: 'Which direction?'
                        },
                        {
                            chinese: '要多长时间？',
                            pinyin: 'Yào duō cháng shíjiān?',
                            english: 'How long does it take?'
                        }
                    ],
                    exampleDialogue: [
                        {
                            role: '当地居民',
                            chinese: '往前走到红绿灯，然后右转',
                            pinyin: 'Wǎng qián zǒu dào hónglǜdēng, ránhòu yòu zhuǎn',
                            english: 'Walk forward to the traffic light, then turn right'
                        },
                        {
                            role: '旅行者',
                            chinese: '那里有地铁站吗？',
                            pinyin: 'Nàli yǒu dìtiě zhàn ma?',
                            english: 'Is there a subway station there?'
                        }
                    ],
                    culturalBackground: '在中国问路时，当地人通常都很热心帮助。他们可能会用手势配合说明方向，有时甚至会主动带路。问路时使用礼貌用语很重要，这体现了中国人的礼仪文化。'
                }
            }
        ];
        
        // 确保每个预设场景都有isPreset标记
        this.presetScenes.forEach(scene => {
            scene.isPreset = true;
        });
        
        console.log('预设场景初始化完成，共', this.presetScenes.length, '个场景');
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 检查元素是否存在
        console.log('初始化事件监听器...');
        console.log('generateSceneBtn元素:', this.generateSceneBtn);
        console.log('backToScenesBtn元素:', this.backToScenesBtn);
        console.log('startSceneChatBtn元素:', this.startSceneChatBtn);
        
        // 生成场景按钮
        if (this.generateSceneBtn) {
            console.log('为生成场景按钮添加点击事件监听器');
            this.generateSceneBtn.addEventListener('click', () => {
                console.log('生成场景按钮被点击');
                this.generateScene();
            });
        } else {
            console.error('生成场景按钮元素不存在!');
        }
        
        // 开始对话按钮
        this.startDialogueBtn.addEventListener('click', () => {
            this.startDialogue();
        });
        
        // 返回场景列表按钮
        if (this.backToScenesBtn) {
            this.backToScenesBtn.addEventListener('click', (e) => {
                console.log('返回场景列表按钮被点击');
                e.preventDefault();
                this.hideSceneExpressions();
            });
        } else {
            console.error('返回场景列表按钮元素不存在!');
        }
        
        // 刷新场景按钮
        const refreshScenesBtn = document.getElementById('refresh-scenes-btn');
        if (refreshScenesBtn) {
            refreshScenesBtn.addEventListener('click', () => {
                // 添加旋转动画
                refreshScenesBtn.classList.add('spinning');
                
                // 重新加载场景（不清除用户场景）
                this.resetScenesCache(false);
                this.loadScenes();
                
                // 1秒后移除旋转动画
                setTimeout(() => {
                    refreshScenesBtn.classList.remove('spinning');
                    
                    // 显示提示
                    uiManager.showModal(`
                        <div class="success-message">
                            <h3>刷新成功</h3>
                            <p>预设场景已重新加载，您的自定义场景已保留</p>
                            <button class="primary-btn" onclick="uiManager.hideModal();">确定</button>
                        </div>
                    `);
                }, 1000);
            });
        }
        
        // 查看场景详情按钮 - 使用事件委托，避免直接绑定到可能尚未存在的元素
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'view-scene-details' || 
                (e.target.parentElement && e.target.parentElement.id === 'view-scene-details')) {
                if (this.currentScene) {
                    this.showSceneDetails(this.currentScene);
                }
            }
        });

        // 使用事件委托，为所有动态添加的按钮绑定事件
        document.addEventListener('click', (e) => {
            // 检查是否点击了返回场景列表按钮
            if (e.target && (e.target.id === 'back-to-scenes-btn' || 
                (e.target.parentElement && e.target.parentElement.id === 'back-to-scenes-btn'))) {
                console.log('通过事件委托捕获到返回场景列表点击');
                this.hideSceneExpressions();
            }
            
            // 检查是否点击了开始场景对话按钮
            if (e.target && (e.target.id === 'start-scene-chat-btn' || 
                (e.target.parentElement && e.target.parentElement.id === 'start-scene-chat-btn'))) {
                console.log('通过事件委托捕获到开始场景对话点击');
                this.startChat();
            }
        });
    }
    
    // 初始化表达界面按钮事件（延迟初始化时使用）
    initExpressionButtonEvents() {
        if (this.backToScenesBtn) {
            console.log('延迟初始化 - 绑定返回场景列表按钮事件');
            this.backToScenesBtn.addEventListener('click', (e) => {
                console.log('返回场景列表按钮被点击（延迟绑定）');
                e.preventDefault();
                this.hideSceneExpressions();
            });
        }
    }
    
    // 加载保存的场景
    loadScenes() {
        // 先清空场景列表
        this.scenes = [];
        
        console.log('开始加载场景...');
        
        // 获取用户自定义场景
        let userScenes = [];
        const savedScenes = localStorage.getItem(CONFIG.STORAGE_KEYS.SCENES);
        if (savedScenes) {
            try {
                // 筛选出非预设场景（用户自定义场景）
                const parsedScenes = JSON.parse(savedScenes);
                userScenes = parsedScenes.filter(scene => !scene.isPreset);
                console.log(`找到${userScenes.length}个用户自定义场景`);
            } catch (e) {
                console.error('无法解析保存的场景:', e);
                userScenes = [];
            }
        }
        
        // 确保预设场景存在
        console.log('当前预设场景数量:', this.presetScenes ? this.presetScenes.length : 0);
        
        // 合并预设场景和用户场景
        if (this.presetScenes && this.presetScenes.length > 0) {
            this.scenes = [...this.presetScenes, ...userScenes];
            console.log('已合并预设场景和用户场景, 总数:', this.scenes.length);
            console.log('预设场景数量:', this.scenes.filter(scene => scene.isPreset).length);
        } else {
            console.error('预设场景不存在或为空!');
            this.scenes = [...userScenes];
        }
        
        // 保存合并后的场景到本地存储
        this.saveScenes();
        
        // 渲染场景列表
        this.renderSceneList();
        
        // 加载当前场景
        const currentSceneId = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_SCENE);
        if (currentSceneId) {
            this.currentScene = this.scenes.find(scene => scene.id === currentSceneId);
            if (this.currentScene) {
                this.updateCurrentSceneInfo();
            }
        }
        
        // 更新"查看详情"按钮状态
        this.updateViewDetailsButtonState();
    }
    
    // 更新"查看详情"按钮状态
    updateViewDetailsButtonState() {
        const viewDetailsBtn = document.getElementById('view-scene-details');
        if (viewDetailsBtn) {
            if (this.currentScene) {
                viewDetailsBtn.classList.remove('disabled');
                viewDetailsBtn.title = '查看当前场景详情';
            } else {
                viewDetailsBtn.classList.add('disabled');
                viewDetailsBtn.title = '请先选择场景';
            }
        }
    }
    
    // 保存场景
    saveScenes() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SCENES, JSON.stringify(this.scenes));
    }
    
    // 设置当前场景
    setCurrentScene(scene) {
        this.currentScene = scene;
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_SCENE, scene.id);
        
        // 显示场景相关表达
        this.displaySceneExpressions(scene);
    }
    
    // 显示场景相关表达
    displaySceneExpressions(scene) {
        console.log('显示场景表达数据:', scene.title, '是否有表达数据:', !!scene.expressions);
        
        // 隐藏场景选择区域，显示场景相关表达区域
        document.getElementById('scene-selection').classList.add('hidden');
        // 确保场景列表完全隐藏
        this.sceneList.classList.add('hidden');
        // 显示表达界面
        this.sceneExpressions.classList.remove('hidden');
        
        // 更新UI：隐藏当前场景信息（如果显示）
        document.querySelector('.current-scene-info').classList.add('hidden');
        
        // 确保聊天容器也隐藏
        document.getElementById('chat-container').classList.add('hidden');
        
        if (scene.expressions) {
            // 已有表达数据，直接显示
            console.log('场景已有表达数据，直接渲染');
            this.renderExpressions(scene.expressions);
        } else {
            // 没有表达数据，需要生成
            console.log('场景没有表达数据，尝试生成');
            this.generateSceneExpressions(scene);
        }
    }
    
    // 渲染表达数据
    renderExpressions(expressions) {
        // 处理学习目标（可能是对象格式）
        const learningObjectivesContent = typeof expressions.learningObjectives === 'object' ? 
            `<div>${expressions.learningObjectives.chinese}</div><div class="translation">${expressions.learningObjectives.english}</div>` : 
            `<p>${expressions.learningObjectives}</p>`;
        
        this.learningObjectives.innerHTML = learningObjectivesContent;
        
        // 渲染关键短语
        this.keyPhrases.innerHTML = '';
        expressions.keyPhrases.forEach(phrase => {
            const phraseElement = document.createElement('div');
            phraseElement.className = 'key-phrase';
            phraseElement.innerHTML = `
                <div class="key-phrase-chinese">${phrase.chinese}</div>
                <div class="key-phrase-pinyin">${phrase.pinyin}</div>
                <div class="key-phrase-english">${phrase.english}</div>
            `;
            this.keyPhrases.appendChild(phraseElement);
        });
            
        // 渲染示例对话
        this.exampleDialogue.innerHTML = '';
        expressions.exampleDialogue.forEach(dialogue => {
            // 处理dialogue.role可能是对象的情况
            const roleText = typeof dialogue.role === 'object' ? dialogue.role.chinese : dialogue.role;
            
            const dialogueElement = document.createElement('div');
            dialogueElement.className = 'example-dialogue-item';
            dialogueElement.innerHTML = `
                <div class="dialogue-role-row">${roleText}</div>
                <div class="dialogue-content">
                    <div class="dialogue-chinese">${dialogue.chinese}</div>
                    <div class="dialogue-pinyin">${dialogue.pinyin}</div>
                    <div class="dialogue-english">${dialogue.english}</div>
                </div>
            `;
            this.exampleDialogue.appendChild(dialogueElement);
        });
            
        // 处理文化背景（可能是对象格式）
        const culturalBackgroundContent = typeof expressions.culturalBackground === 'object' ? 
            `<div>${expressions.culturalBackground.chinese}</div><div class="translation">${expressions.culturalBackground.english}</div>` : 
            `<p>${expressions.culturalBackground}</p>`;
            
        this.culturalBackground.innerHTML = `
            <div class="cultural-background-content">
                ${culturalBackgroundContent}
            </div>
        `;
    }
    
    // 生成场景相关表达
    async generateSceneExpressions(scene) {
        try {
            uiManager.showLoading();
            
            console.log('正在生成场景表达数据...', {
                title: scene.title,
                description: scene.description
            });
            
            // 调用API生成场景表达内容
            const expressions = await apiService.getSceneExpressions(scene.title, scene.description, scene.botRole, scene.userRole, scene.dialogueTask);
            
            console.log('获取到的场景表达数据:', expressions);
            
            // 使用默认数据作为备份，防止API返回不完整
            const defaultExpressions = {
                learningObjectives: {
                    chinese: "学习在此场景中常用的词汇和表达，掌握相关对话技能",
                    english: "Learn common vocabulary and expressions in this scenario, and master relevant conversation skills"
                },
                keyPhrases: [
                    {
                        chinese: "您好，请问有什么可以帮助您？",
                        pinyin: "Nín hǎo, qǐngwèn yǒu shénme kěyǐ bāngzhù nín?",
                        english: "Hello, how may I help you?"
                    },
                    {
                        chinese: "谢谢您的帮助",
                        pinyin: "Xièxie nín de bāngzhù",
                        english: "Thank you for your help"
                    }
                ],
                exampleDialogue: [
                    {
                        role: typeof scene.botRole === 'object' ? 
                            scene.botRole : 
                            {
                                chinese: scene.botRole,
                                english: "Assistant"
                            },
                        chinese: "您好，有什么需要帮助的吗？",
                        pinyin: "Nín hǎo, yǒu shénme xūyào bāngzhù de ma?",
                        english: "Hello, do you need any help?"
                    },
                    {
                        role: typeof scene.userRole === 'object' ? 
                            scene.userRole : 
                            {
                                chinese: scene.userRole,
                                english: "User"
                            },
                        chinese: "您好，我想了解一下...",
                        pinyin: "Nín hǎo, wǒ xiǎng liǎojiě yīxià...",
                        english: "Hello, I'd like to know about..."
                    }
                ],
                culturalBackground: {
                    chinese: "这是中国文化背景的基本描述，会随着具体场景而有所不同。",
                    english: "This is a basic description of Chinese cultural background, which will vary depending on the specific scenario."
                }
            };
            
            // 合并API返回的数据和默认数据，确保数据完整
            const mergedExpressions = {
                learningObjectives: expressions.learningObjectives || defaultExpressions.learningObjectives,
                keyPhrases: expressions.keyPhrases && expressions.keyPhrases.length > 0 ? 
                    expressions.keyPhrases : defaultExpressions.keyPhrases,
                exampleDialogue: expressions.exampleDialogue && expressions.exampleDialogue.length > 0 ? 
                    expressions.exampleDialogue : defaultExpressions.exampleDialogue,
                culturalBackground: expressions.culturalBackground || defaultExpressions.culturalBackground
            };
            
            // 保存表达数据到场景对象
            scene.expressions = mergedExpressions;
            this.saveScenes();
            
            // 渲染表达数据
            this.renderExpressions(mergedExpressions);
            
            uiManager.hideLoading();
        } catch (error) {
            console.error('生成场景表达失败:', error);
            
            // 创建一个基本的表达数据作为备用
            const fallbackExpressions = {
                learningObjectives: {
                    chinese: `学习在${scene.title}场景中的常用词汇和表达，掌握相关对话技能。`,
                    english: `Learn common vocabulary and expressions in the ${scene.title} scenario, and master relevant conversation skills.`
                },
                keyPhrases: [
                    {
                        chinese: "您好，请问有什么可以帮助您？",
                        pinyin: "Nín hǎo, qǐngwèn yǒu shénme kěyǐ bāngzhù nín?",
                        english: "Hello, how may I help you?"
                    },
                    {
                        chinese: "谢谢您的帮助",
                        pinyin: "Xièxie nín de bāngzhù",
                        english: "Thank you for your help"
                    },
                    {
                        chinese: "我想了解更多信息",
                        pinyin: "Wǒ xiǎng liǎojiě gèng duō xìnxī",
                        english: "I would like to know more information"
                    }
                ],
                exampleDialogue: [
                    {
                        role: typeof scene.botRole === 'object' ? 
                            scene.botRole : 
                            {
                                chinese: scene.botRole,
                                english: "Assistant"
                            },
                        chinese: "您好，欢迎光临，有什么可以帮您？",
                        pinyin: "Nín hǎo, huānyíng guānglín, yǒu shénme kěyǐ bāng nín?",
                        english: "Hello, welcome, how may I help you?"
                    },
                    {
                        role: typeof scene.userRole === 'object' ? 
                            scene.userRole : 
                            {
                                chinese: scene.userRole,
                                english: "User"
                            },
                        chinese: "您好，我想了解一下...",
                        pinyin: "Nín hǎo, wǒ xiǎng liǎojiě yīxià...",
                        english: "Hello, I'd like to know about..."
                    },
                    {
                        role: typeof scene.botRole === 'object' ? 
                            scene.botRole : 
                            {
                                chinese: scene.botRole,
                                english: "Assistant"
                            },
                        chinese: "没问题，很乐意为您解答。",
                        pinyin: "Méi wèntí, hěn lèyì wèi nín jiědá.",
                        english: "No problem, I'm happy to answer for you."
                    }
                ],
                culturalBackground: {
                    chinese: `在${scene.title}场景中，了解中国的礼仪和交流习惯很重要。中国人注重礼貌、尊重和面子，交流时通常以礼相待。`,
                    english: `In the ${scene.title} scenario, understanding Chinese etiquette and communication habits is important. Chinese people emphasize politeness, respect, and face, and are usually courteous when communicating.`
                }
            };
            
            // 保存备用数据
            scene.expressions = fallbackExpressions;
            this.saveScenes();
            
            // 渲染备用数据
            this.renderExpressions(fallbackExpressions);
            
            uiManager.hideLoading();
            uiManager.showError('生成详细场景表达失败，已使用基本数据替代。');
        }
    }
    
    // 生成场景
    async generateScene() {
        const title = this.sceneTitle.value.trim();
        const description = this.sceneDescription.value.trim();
        
        if (!title || !description) {
            uiManager.showError('请填写场景标题和描述');
            return;
        }
        
        try {
            uiManager.showLoading();
            
            // 调用API生成场景内容
            const cardContent = await apiService.getDialogTaskCard(title, description);
            
            // 创建新场景
            const scene = {
                id: Date.now().toString(),
                title,
                description,
                botRole: cardContent.botRole,
                userRole: cardContent.userRole,
                dialogueTask: cardContent.dialogueTask,
                createdAt: new Date().toISOString(),
                expressions: null // 先设为null，稍后生成
            };
            
            // 更新UI
            this.botRole.textContent = typeof scene.botRole === 'object' ? scene.botRole.chinese : scene.botRole;
            this.userRole.textContent = typeof scene.userRole === 'object' ? scene.userRole.chinese : scene.userRole;
            this.dialogueTask.textContent = typeof scene.dialogueTask === 'object' ? scene.dialogueTask.chinese : scene.dialogueTask;
            this.sceneResult.classList.remove('hidden');
            
            // 添加到场景列表
            this.scenes.push(scene);
            this.saveScenes();
            this.renderSceneList();
            
            uiManager.hideLoading();
            
            // 提示用户生成成功，点击后直接进入场景表达界面
            const self = this; // 保存当前SceneManager实例的引用
            uiManager.showModal(`
                <div class="success-message">
                    <h3>场景生成成功</h3>
                    <p>已创建新场景: ${scene.title}</p>
                    <button class="primary-btn" id="view-created-scene-btn">查看场景详情</button>
                </div>
            `);
            
            // 通过DOM添加事件监听器，避免在HTML中使用全局引用
            setTimeout(() => {
                const viewSceneBtn = document.getElementById('view-created-scene-btn');
                if (viewSceneBtn) {
                    viewSceneBtn.addEventListener('click', function() {
                        uiManager.hideModal();
                        
                        // 先添加基本表达数据，避免API调用失败
                        if (!scene.expressions) {
                            // 创建一个基本的表达数据
                            scene.expressions = {
                                learningObjectives: {
                                    chinese: `学习在${scene.title}场景中的常用词汇和表达，掌握相关对话技能。`,
                                    english: `Learn common vocabulary and expressions in the ${scene.title} scenario, and master relevant conversation skills.`
                                },
                                keyPhrases: [
                                    {
                                        chinese: "您好，请问有什么可以帮助您？",
                                        pinyin: "Nín hǎo, qǐngwèn yǒu shénme kěyǐ bāngzhù nín?",
                                        english: "Hello, how may I help you?"
                                    },
                                    {
                                        chinese: "谢谢您的帮助",
                                        pinyin: "Xièxie nín de bāngzhù",
                                        english: "Thank you for your help"
                                    },
                                    {
                                        chinese: "我想了解更多信息",
                                        pinyin: "Wǒ xiǎng liǎojiě gèng duō xìnxī",
                                        english: "I would like to know more information"
                                    }
                                ],
                                exampleDialogue: [
                                    {
                                        role: scene.botRole,
                                        chinese: "您好，欢迎光临，有什么可以帮您？",
                                        pinyin: "Nín hǎo, huānyíng guānglín, yǒu shénme kěyǐ bāng nín?",
                                        english: "Hello, welcome, how may I help you?"
                                    },
                                    {
                                        role: scene.userRole,
                                        chinese: "您好，我想了解一下...",
                                        pinyin: "Nín hǎo, wǒ xiǎng liǎojiě yīxià...",
                                        english: "Hello, I'd like to know about..."
                                    },
                                    {
                                        role: scene.botRole,
                                        chinese: "没问题，很乐意为您解答。",
                                        pinyin: "Méi wèntí, hěn lèyì wèi nín jiědá.",
                                        english: "No problem, I'm happy to answer for you."
                                    }
                                ],
                                culturalBackground: {
                                    chinese: `在${scene.title}场景中，了解中国的礼仪和交流习惯很重要。中国人注重礼貌、尊重和面子，交流时通常以礼相待。`,
                                    english: `In the ${scene.title} scenario, understanding Chinese etiquette and communication habits is important. Chinese people emphasize politeness, respect, and face, and are usually courteous when communicating.`
                                }
                            };
                            
                            // 保存到场景列表
                            self.saveScenes();
                        }
                        
                        // 设置当前场景
                        self.setCurrentScene(scene);
                    });
                }
            }, 100);
        } catch (error) {
            uiManager.hideLoading();
            uiManager.showError('生成场景失败: ' + error.message);
        }
    }
    
    // 隐藏场景相关表达
    hideSceneExpressions() {
        console.log('执行hideSceneExpressions方法...');
        
        // 隐藏场景相关表达界面
        this.sceneExpressions.classList.add('hidden');
        
        // 显示场景选择界面和场景列表
        const sceneSelection = document.getElementById('scene-selection');
        sceneSelection.classList.remove('hidden');
        this.sceneList.classList.remove('hidden');
        
        // 直接设置页面类
        const dialoguePage = document.getElementById('dialogue');
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        dialoguePage.classList.add('active');
        
        // 更新导航栏状态
        document.querySelectorAll('.main-nav li').forEach(item => {
            if (item.getAttribute('data-page') === 'dialogue') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        console.log('返回场景列表完成');
    }
    
    // 开始对话
    startDialogue() {
        if (!this.scenes.length) return;
        
        // 获取最新生成的场景
        const latestScene = this.scenes[this.scenes.length - 1];
        
        // 设置为当前场景
        this.setCurrentScene(latestScene);
    }
    
    // 开始场景对话
    startChat() {
        console.log('执行startChat方法...');
        
        if (!this.currentScene) {
            console.error('没有选择场景！');
            return;
        }
        
        // 隐藏场景相关表达界面
        this.sceneExpressions.classList.add('hidden');
        
        // 更新当前场景信息
        document.getElementById('current-scene-title').textContent = this.currentScene.title;
        document.querySelector('.current-scene-info').classList.remove('hidden');
        document.getElementById('chat-container').classList.remove('hidden');
        document.getElementById('scene-selection').classList.add('hidden');
        
        // 直接设置页面类
        const dialoguePage = document.getElementById('dialogue');
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        dialoguePage.classList.add('active');
        
        // 更新导航栏状态
        document.querySelectorAll('.main-nav li').forEach(item => {
            if (item.getAttribute('data-page') === 'dialogue') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 重置对话
        apiService.resetConversation();
        
        // 提取场景角色和任务信息（支持对象格式）
        const botRole = typeof this.currentScene.botRole === 'object' ? this.currentScene.botRole.chinese : this.currentScene.botRole;
        const userRole = typeof this.currentScene.userRole === 'object' ? this.currentScene.userRole.chinese : this.currentScene.userRole;
        const dialogueTask = typeof this.currentScene.dialogueTask === 'object' ? this.currentScene.dialogueTask.chinese : this.currentScene.dialogueTask;
        
        // 添加场景信息到对话
        const sceneInfo = `情景：你是${botRole}，我是${userRole}。我的任务是${dialogueTask}。请你严格扮演你的角色，用自然的中文与我对话。每次回复请严格按照如下格式输出：\n第一行是你的回复内容的拼音，\n第二行是你的回复内容的中文原文，\n第三行是你的回复内容的英文翻译。不要添加任何"拼音：" "中文：" "英文："等标签，只输出三行内容。`;
        
        // 发送场景信息作为系统消息
        chatManager.addSystemMessage(sceneInfo);
        
        // 自动发送一条欢迎消息
        chatManager.sendInitialBotMessage();
        
        console.log('开始对话完成');
    }
    
    // 更新当前场景信息
    updateCurrentSceneInfo() {
        if (this.currentScene) {
            document.getElementById('current-scene-title').textContent = this.currentScene.title;
            document.querySelector('.current-scene-info').classList.remove('hidden');
            document.getElementById('chat-container').classList.remove('hidden');
            
            // 重置对话
            apiService.resetConversation();
            
            // 提取场景角色和任务信息（支持对象格式）
            const botRole = typeof this.currentScene.botRole === 'object' ? this.currentScene.botRole.chinese : this.currentScene.botRole;
            const userRole = typeof this.currentScene.userRole === 'object' ? this.currentScene.userRole.chinese : this.currentScene.userRole;
            const dialogueTask = typeof this.currentScene.dialogueTask === 'object' ? this.currentScene.dialogueTask.chinese : this.currentScene.dialogueTask;
            
            // 添加场景信息到对话
            const sceneInfo = `情景：你是${botRole}，我是${userRole}。我的任务是${dialogueTask}。请你严格扮演你的角色，用自然的中文与我对话。每次回复请严格按照如下格式输出：第一行是你的回复内容的拼音，第二行是你的回复内容的中文原文，第三行是你的回复内容的英文翻译。不要添加任何"拼音：" "中文：" "英文："等标签，只输出三行内容。`;
            
            // 发送场景信息作为系统消息
            chatManager.addSystemMessage(sceneInfo);
            
            // 自动发送一条欢迎消息
            chatManager.sendInitialBotMessage();
        }
    }
    
    // 渲染场景列表
    renderSceneList() {
        this.sceneList.innerHTML = '';
        
        if (this.scenes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = '暂无场景，请先创建场景';
            this.sceneList.appendChild(emptyMessage);
            return;
        }
        
        // 添加标题，区分预设场景和自定义场景
        const presetScenesTitle = document.createElement('h4');
        presetScenesTitle.className = 'scene-list-title';
        presetScenesTitle.textContent = '预设场景';
        this.sceneList.appendChild(presetScenesTitle);
        
        // 先显示预设场景
        const presetScenes = this.scenes.filter(scene => scene.isPreset === true);
        console.log('渲染预设场景数量:', presetScenes.length);
        
        if (presetScenes.length > 0) {
            presetScenes.forEach(scene => {
                console.log('渲染预设场景:', scene.title, '(isPreset=', scene.isPreset, ')');
                this.createSceneItem(scene);
            });
        } else {
            console.warn('没有找到预设场景，可能isPreset属性未正确设置');
            
            // 如果找不到预设场景，显示一条消息
            const noPresetsMessage = document.createElement('div');
            noPresetsMessage.className = 'empty-message';
            noPresetsMessage.textContent = '预设场景未加载，请刷新页面';
            this.sceneList.appendChild(noPresetsMessage);
        }
        
        // 如果有自定义场景，添加自定义场景标题
        const customScenes = this.scenes.filter(scene => !scene.isPreset);
        if (customScenes.length > 0) {
            const customScenesTitle = document.createElement('h4');
            customScenesTitle.className = 'scene-list-title';
            customScenesTitle.textContent = '我的场景';
            customScenesTitle.style.marginTop = '1.5rem';
            this.sceneList.appendChild(customScenesTitle);
            
            // 按创建时间降序排序自定义场景
            const sortedCustomScenes = [...customScenes].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            // 显示自定义场景
            sortedCustomScenes.forEach(scene => this.createSceneItem(scene));
        }
    }
    
    // 创建场景项
    createSceneItem(scene) {
        const sceneItem = document.createElement('div');
        sceneItem.className = 'scene-item';
        
        // 添加预设场景样式
        if (scene.isPreset) {
            sceneItem.classList.add('preset-scene');
            console.log('添加preset-scene类到场景:', scene.title);
        }
        
        sceneItem.setAttribute('data-id', scene.id);
        
        const title = document.createElement('h3');
        title.textContent = scene.title;
        
        const description = document.createElement('p');
        description.textContent = scene.description;
        
        // 只为非预设场景显示日期
        if (!scene.isPreset) {
            const date = document.createElement('div');
            date.className = 'scene-date';
            date.textContent = new Date(scene.createdAt).toLocaleString();
            sceneItem.appendChild(date);
        }
        
        sceneItem.appendChild(title);
        sceneItem.appendChild(description);
        
        // 为非预设场景添加角色信息的简要显示
        if (!scene.isPreset) {
            // 获取角色的中文文本
            const botRoleText = typeof scene.botRole === 'object' ? scene.botRole.chinese : scene.botRole;
            const userRoleText = typeof scene.userRole === 'object' ? scene.userRole.chinese : scene.userRole;
            
            // 创建角色信息元素
            const rolesInfo = document.createElement('div');
            rolesInfo.className = 'scene-roles-info';
            rolesInfo.innerHTML = `
                <span class="scene-bot-role">${botRoleText}</span> vs 
                <span class="scene-user-role">${userRoleText}</span>
            `;
            sceneItem.appendChild(rolesInfo);
        }
        
        // 添加点击事件
        sceneItem.addEventListener('click', () => {
            this.setCurrentScene(scene);
        });
        
        this.sceneList.appendChild(sceneItem);
    }
    
    // 显示场景详情
    showSceneDetails(scene) {
        // 处理botRole、userRole和dialogueTask可能是对象的情况
        const botRoleText = typeof scene.botRole === 'object' ? 
            `<div>${scene.botRole.chinese}</div><div class="translation">${scene.botRole.english}</div>` : 
            scene.botRole;
            
        const userRoleText = typeof scene.userRole === 'object' ? 
            `<div>${scene.userRole.chinese}</div><div class="translation">${scene.userRole.english}</div>` : 
            scene.userRole;
            
        const dialogueTaskText = typeof scene.dialogueTask === 'object' ? 
            `<div>${scene.dialogueTask.chinese}</div><div class="translation">${scene.dialogueTask.english}</div>` : 
            scene.dialogueTask;

        const content = `
            <div class="scene-details">
                <h3>${scene.title}</h3>
                <p>${scene.description}</p>
                <div class="role-info">
                    <div class="role-item">
                        <h4>AI角色</h4>
                        <div>${botRoleText}</div>
                    </div>
                    <div class="role-item">
                        <h4>你的角色</h4>
                        <div>${userRoleText}</div>
                    </div>
                </div>
                <div class="task-info">
                    <h4>对话任务</h4>
                    <div>${dialogueTaskText}</div>
                </div>
            </div>
        `;
        
        uiManager.showModal(content);
    }
    
    // 清除场景缓存，添加参数以控制是否重置所有数据
    resetScenesCache(forceReset = false) {
        if (forceReset) {
            console.log('重置所有场景缓存...');
            localStorage.removeItem(CONFIG.STORAGE_KEYS.SCENES);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_SCENE);
        } else {
            console.log('保留用户场景，只更新预设场景...');
            // 不删除场景数据，而是在loadScenes中合并预设和用户场景
        }
    }
}

// 创建场景管理器实例
const sceneManager = new SceneManager(); 

// 将场景管理器绑定到全局window对象，确保在其他脚本中可以访问
window.sceneManager = sceneManager; 