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
        
        // 预设场景数据
        this.presetScenes = [
            {
                id: 'preset-1',
                title: '餐厅点餐',
                description: '在中国餐厅点菜并询问菜品',
                botRole: '热情的中国餐厅服务员',
                userRole: '初次到中国餐厅用餐的外国游客',
                dialogueTask: '点餐并了解几道中国特色菜品的做法和原料',
                createdAt: new Date('2023-01-01').toISOString(),
                isPreset: true
            },
            {
                id: 'preset-2',
                title: '医院问诊',
                description: '在医院看感冒并描述症状',
                botRole: '细心的医生',
                userRole: '感冒生病的患者',
                dialogueTask: '描述感冒症状并咨询治疗方案和注意事项',
                createdAt: new Date('2023-01-02').toISOString(),
                isPreset: true
            },
            {
                id: 'preset-3',
                title: '购物讨价还价',
                description: '在市场购物并讨价还价',
                botRole: '小商品市场的摊主',
                userRole: '想要购买纪念品的游客',
                dialogueTask: '询问商品价格，讨价还价，并了解商品特色',
                createdAt: new Date('2023-01-03').toISOString(),
                isPreset: true
            },
            {
                id: 'preset-4',
                title: '宾馆入住',
                description: '办理宾馆入住并询问相关服务',
                botRole: '宾馆前台服务人员',
                userRole: '刚到达宾馆的旅客',
                dialogueTask: '办理入住手续，询问宾馆设施和周边景点',
                createdAt: new Date('2023-01-04').toISOString(),
                isPreset: true
            },
            {
                id: 'preset-5',
                title: '路边问路',
                description: '询问如何到达某个景点',
                botRole: '热心的当地居民',
                userRole: '迷路的旅行者',
                dialogueTask: '询问到达景点的路线、交通方式和所需时间',
                createdAt: new Date('2023-01-05').toISOString(),
                isPreset: true
            }
        ];
        
        // 修改为默认不清除缓存
        this.resetScenesCache(false);
        
        this.loadScenes();
        this.initEventListeners();
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 生成场景按钮
        this.generateSceneBtn.addEventListener('click', () => {
            this.generateScene();
        });
        
        // 开始对话按钮
        this.startDialogueBtn.addEventListener('click', () => {
            this.startDialogue();
        });
        
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
    }
    
    // 加载保存的场景
    loadScenes() {
        // 先清空场景列表
        this.scenes = [];
        
        // 获取用户自定义场景
        let userScenes = [];
        const savedScenes = localStorage.getItem(CONFIG.STORAGE_KEYS.SCENES);
        if (savedScenes) {
            try {
                // 筛选出非预设场景（用户自定义场景）
                userScenes = JSON.parse(savedScenes).filter(scene => !scene.isPreset);
                console.log(`找到${userScenes.length}个用户自定义场景`);
            } catch (e) {
                console.error('无法解析保存的场景:', e);
                userScenes = [];
            }
        }
        
        // 合并预设场景和用户场景
        this.scenes = [...this.presetScenes, ...userScenes];
        
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
        this.updateCurrentSceneInfo();
        this.updateViewDetailsButtonState();
    }
    
    // 更新当前场景信息
    updateCurrentSceneInfo() {
        if (this.currentScene) {
            document.getElementById('current-scene-title').textContent = this.currentScene.title;
            document.querySelector('.current-scene-info').classList.remove('hidden');
            document.getElementById('scene-selection').classList.add('hidden');
            document.getElementById('chat-container').classList.remove('hidden');
            
            // 重置对话
            apiService.resetConversation();
            
            // 添加场景信息到对话
            const sceneInfo = `情景：我是${this.currentScene.botRole}，你是${this.currentScene.userRole}。你的任务是${this.currentScene.dialogueTask}。请开始对话。`;
            
            // 发送场景信息作为系统消息
            chatManager.addSystemMessage(sceneInfo);
            
            // 自动发送一条欢迎消息
            chatManager.sendInitialBotMessage();
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
                createdAt: new Date().toISOString()
            };
            
            // 更新UI
            this.botRole.textContent = scene.botRole;
            this.userRole.textContent = scene.userRole;
            this.dialogueTask.textContent = scene.dialogueTask;
            this.sceneResult.classList.remove('hidden');
            
            // 添加到场景列表
            this.scenes.push(scene);
            this.saveScenes();
            this.renderSceneList();
            
            uiManager.hideLoading();
        } catch (error) {
            uiManager.hideLoading();
            uiManager.showError('生成场景失败: ' + error.message);
        }
    }
    
    // 开始对话
    startDialogue() {
        if (!this.scenes.length) return;
        
        // 获取最新生成的场景
        const latestScene = this.scenes[this.scenes.length - 1];
        
        // 设置为当前场景
        this.setCurrentScene(latestScene);
        
        // 导航到对话页面
        uiManager.navigateTo('dialogue');
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
        const presetScenes = this.scenes.filter(scene => scene.isPreset);
        presetScenes.forEach(scene => this.createSceneItem(scene));
        
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
        if (scene.isPreset) sceneItem.classList.add('preset-scene');
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
        
        // 添加点击事件
        sceneItem.addEventListener('click', () => {
            this.setCurrentScene(scene);
        });
        
        this.sceneList.appendChild(sceneItem);
    }
    
    // 显示场景详情
    showSceneDetails(scene) {
        const content = `
            <div class="scene-details">
                <h3>${scene.title}</h3>
                <p>${scene.description}</p>
                <div class="role-info">
                    <div class="role-item">
                        <h4>AI角色</h4>
                        <p>${scene.botRole}</p>
                    </div>
                    <div class="role-item">
                        <h4>你的角色</h4>
                        <p>${scene.userRole}</p>
                    </div>
                </div>
                <div class="task-info">
                    <h4>对话任务</h4>
                    <p>${scene.dialogueTask}</p>
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