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
        
        // 查看场景详情按钮
        document.getElementById('view-scene-details').addEventListener('click', () => {
            if (this.currentScene) {
                this.showSceneDetails(this.currentScene);
            }
        });
    }
    
    // 加载保存的场景
    loadScenes() {
        const savedScenes = localStorage.getItem(CONFIG.STORAGE_KEYS.SCENES);
        if (savedScenes) {
            try {
                this.scenes = JSON.parse(savedScenes);
                this.renderSceneList();
            } catch (e) {
                console.error('无法解析保存的场景:', e);
                this.scenes = [];
            }
        }
        
        // 加载当前场景
        const currentSceneId = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_SCENE);
        if (currentSceneId) {
            this.currentScene = this.scenes.find(scene => scene.id === currentSceneId);
            if (this.currentScene) {
                this.updateCurrentSceneInfo();
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
        
        // 按创建时间降序排序
        const sortedScenes = [...this.scenes].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedScenes.forEach(scene => {
            const sceneItem = document.createElement('div');
            sceneItem.className = 'scene-item';
            sceneItem.setAttribute('data-id', scene.id);
            
            const title = document.createElement('h3');
            title.textContent = scene.title;
            
            const description = document.createElement('p');
            description.textContent = scene.description;
            
            const date = document.createElement('div');
            date.className = 'scene-date';
            date.textContent = new Date(scene.createdAt).toLocaleString();
            
            sceneItem.appendChild(title);
            sceneItem.appendChild(description);
            sceneItem.appendChild(date);
            
            // 添加点击事件
            sceneItem.addEventListener('click', () => {
                this.setCurrentScene(scene);
            });
            
            this.sceneList.appendChild(sceneItem);
        });
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
}

// 创建场景管理器实例
const sceneManager = new SceneManager(); 