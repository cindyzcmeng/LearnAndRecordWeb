// 日记管理服务
class DiaryManager {
    constructor() {
        this.diaries = [];
        this.currentRecording = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordTimer = null;
        this.recordTime = 0;
        
        // 语音日记页面元素
        this.recordStatus = document.getElementById('record-status');
        this.recordTimerElement = document.getElementById('record-timer');
        this.startRecordBtn = document.getElementById('start-record-btn');
        this.stopRecordBtn = document.getElementById('stop-record-btn');
        this.diaryForm = document.getElementById('diary-form');
        this.diaryTitle = document.getElementById('diary-title');
        this.diaryText = document.getElementById('diary-text');
        this.saveDiaryBtn = document.getElementById('save-diary-btn');
        this.cancelDiaryBtn = document.getElementById('cancel-diary-btn');
        
        // 日记列表页面元素
        this.diariesContainer = document.getElementById('diaries-container');
        
        // 日记详情页面元素
        this.detailDiaryTitle = document.getElementById('detail-diary-title');
        this.detailDiaryText = document.getElementById('detail-diary-text');
        this.detailFeedbackContent = document.getElementById('detail-feedback-content');
        this.backToListBtn = document.getElementById('back-to-list-btn');
        this.deleteDiaryBtn = document.getElementById('delete-diary-btn');
        
        this.loadDiaries();
        this.initEventListeners();
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 开始录音按钮
        this.startRecordBtn.addEventListener('click', () => {
            this.startRecording();
        });
        
        // 停止录音按钮
        this.stopRecordBtn.addEventListener('click', () => {
            this.stopRecording();
        });
        
        // 保存日记按钮
        this.saveDiaryBtn.addEventListener('click', () => {
            this.saveDiary();
        });
        
        // 取消按钮
        this.cancelDiaryBtn.addEventListener('click', () => {
            this.cancelDiary();
        });
        
        // 返回列表按钮
        this.backToListBtn.addEventListener('click', () => {
            uiManager.navigateTo('diary-list');
        });
        
        // 删除日记按钮
        this.deleteDiaryBtn.addEventListener('click', () => {
            this.deleteDiary();
        });
        
        // 历史记录标签过滤功能
        this.initHistoryTabs();
    }
    
    // 初始化历史记录标签过滤功能
    initHistoryTabs() {
        const historyTabs = document.querySelectorAll('.history-tab');
        historyTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有标签的active类
                historyTabs.forEach(t => t.classList.remove('active'));
                
                // 添加active类到当前点击的标签
                tab.classList.add('active');
                
                // 获取过滤类型
                const filterType = tab.getAttribute('data-type');
                
                // 根据类型过滤日记列表
                this.filterDiaryList(filterType);
            });
        });
    }
    
    // 根据类型过滤日记列表
    filterDiaryList(filterType) {
        // 如果无日记，直接返回
        if (this.diaries.length === 0) return;
        
        // 获取排序后的日记
        const sortedDiaries = [...this.diaries].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // 清空容器
        this.diariesContainer.innerHTML = '';
        
        // 根据类型过滤
        let filteredDiaries = sortedDiaries;
        if (filterType === 'diary') {
            filteredDiaries = sortedDiaries.filter(diary => !diary.isConversation);
        } else if (filterType === 'conversation') {
            filteredDiaries = sortedDiaries.filter(diary => diary.isConversation);
        }
        
        // 如果过滤后没有内容，显示空消息
        if (filteredDiaries.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = `没有${filterType === 'diary' ? '日记' : '对话'}记录`;
            this.diariesContainer.appendChild(emptyMessage);
            return;
        }
        
        // 显示过滤后的日记列表
        filteredDiaries.forEach(diary => {
            const diaryItem = document.createElement('div');
            diaryItem.className = 'diary-item';
            diaryItem.setAttribute('data-id', diary.id);
            
            const header = document.createElement('div');
            header.className = 'diary-item-header';
            
            const title = document.createElement('h3');
            title.textContent = diary.title;
            
            const date = document.createElement('div');
            date.className = 'diary-date';
            date.textContent = new Date(diary.createdAt).toLocaleString();
            
            header.appendChild(title);
            header.appendChild(date);
            
            const preview = document.createElement('p');
            preview.className = 'diary-preview';
            preview.textContent = diary.text.substr(0, 100) + (diary.text.length > 100 ? '...' : '');
            
            diaryItem.appendChild(header);
            diaryItem.appendChild(preview);
            
            // 添加点击事件
            diaryItem.addEventListener('click', () => {
                this.viewDiaryDetail(diary);
            });
            
            this.diariesContainer.appendChild(diaryItem);
        });
    }
    
    // 加载保存的日记
    loadDiaries() {
        const savedDiaries = localStorage.getItem(CONFIG.STORAGE_KEYS.DIARIES);
        if (savedDiaries) {
            try {
                this.diaries = JSON.parse(savedDiaries);
                this.renderDiaryList();
            } catch (e) {
                console.error('无法解析保存的日记:', e);
                this.diaries = [];
            }
        }
    }
    
    // 保存日记到本地存储
    saveDiaries() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.DIARIES, JSON.stringify(this.diaries));
    }
    
    // 开始录音
    async startRecording() {
        // 直接显示日记表单，不请求麦克风权限
        this.diaryForm.classList.remove('hidden');
        
        // 更新录音状态
        this.recordStatus.textContent = '语音识别功能暂未上线，请先使用手机自带的语音识别输入功能';
        
        // 重置录音界面
        this.startRecordBtn.classList.remove('hidden');
        this.stopRecordBtn.classList.add('hidden');
        this.recordTimerElement.textContent = '00:00';
        
        // 清空录音相关数据
        this.currentRecording = null;
        this.audioChunks = [];
        
        // 在文本框中添加默认提示文本
        this.diaryText.value = '请在此输入您的日记内容，或使用手机自带的语音输入功能';
        this.diaryText.focus(); // 聚焦到文本框，便于用户直接输入
        
        // 以下代码已禁用，不会执行 - 保留代码仅供参考
        /*
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.addEventListener('dataavailable', (event) => {
                this.audioChunks.push(event.data);
            });
            
            this.mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.currentRecording = URL.createObjectURL(audioBlob);
                
                // 自动识别语音
                this.recognizeSpeech(audioBlob);
                
                // 显示日记表单
                this.diaryForm.classList.remove('hidden');
                
                // 重置录音界面
                this.recordStatus.textContent = '录音已完成，请填写日记信息';
                this.startRecordBtn.classList.remove('hidden');
                this.recordTimerElement.textContent = '00:00';
                
                // 停止所有轨道
                stream.getTracks().forEach(track => track.stop());
            });
            
            // 开始录音
            this.mediaRecorder.start();
            this.startRecordTimer();
            
            // 更新UI
            this.recordStatus.textContent = '正在录音...';
            this.startRecordBtn.classList.add('hidden');
            this.stopRecordBtn.classList.remove('hidden');
            
        } catch (error) {
            console.error('无法访问麦克风:', error);
            uiManager.showError('无法访问麦克风: ' + error.message);
        }
        */
    }
    /*
    // 开始计时器
    startRecordTimer() {
        this.recordTime = 0;
        clearInterval(this.recordTimer);
        
        this.recordTimer = setInterval(() => {
            this.recordTime++;
            const minutes = Math.floor(this.recordTime / 60).toString().padStart(2, '0');
            const seconds = (this.recordTime % 60).toString().padStart(2, '0');
            this.recordTimerElement.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }
    
    // 停止录音
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            clearInterval(this.recordTimer);
            this.stopRecordBtn.classList.add('hidden');
        }
    }
    */
   
    // 语音识别
    recognizeSpeech(audioBlob) {
        // 在这里集成语音识别API
        // 由于Web Speech API不支持直接从Blob识别，这里我们使用一个模拟实现
        // 在实际应用中，你可能需要使用专门的语音识别服务
        
        // 模拟识别延迟
        uiManager.showLoading();
        
        setTimeout(() => {
            uiManager.hideLoading();
            // 这里仅作演示，实际应用中请替换为真实的语音识别API
            this.diaryText.value = '这是语音识别的结果。在实际应用中，这里会显示您刚才录制的语音内容的文字记录。您可以编辑这些文字以纠正任何识别错误。';
        }, 1500);
    }
    
    // 保存日记
    async saveDiary() {
        const title = this.diaryTitle.value.trim();
        const text = this.diaryText.value.trim();
        
        if (!title || !text) {
            uiManager.showError('请填写日记标题和内容');
            return;
        }
        
        try {
            uiManager.showLoading();
            
            // 获取反馈
            const feedback = await apiService.sendMessage(text, true);
            
            // 创建新日记
            const diary = {
                id: Date.now().toString(),
                title,
                text,
                feedback,
                //audioUrl: this.currentRecording,
                createdAt: new Date().toISOString(),
                isConversation: false // 默认为日记类型，非对话类型
            };
            
            // 添加到日记列表
            this.diaries.push(diary);
            this.saveDiaries();
            
            // 更新UI
            this.renderDiaryList();
            this.resetDiaryForm();
            
            uiManager.hideLoading();
            
            // 显示保存成功提示
            uiManager.showModal(`
                <div class="success-message">
                    <h3>保存成功</h3>
                    <p>您的日记已保存，并已生成语言反馈</p>
                    <button class="primary-btn" onclick="uiManager.hideModal(); uiManager.navigateTo('diary-list');">查看历史记录</button>
                </div>
            `);
            
        } catch (error) {
            uiManager.hideLoading();
            uiManager.showError('保存日记失败: ' + error.message);
        }
    }
    
    // 取消日记
    cancelDiary() {
        this.resetDiaryForm();
    }
    
    // 重置日记表单
    resetDiaryForm() {
        this.diaryForm.classList.add('hidden');
        this.diaryTitle.value = '';
        this.diaryText.value = '';
        this.currentRecording = null;
        this.recordStatus.textContent = '点击下方按钮开始录音';
    }
    
    // 渲染日记列表
    renderDiaryList() {
        // 获取当前选中的标签类型
        const activeTab = document.querySelector('.history-tab.active');
        if (activeTab) {
            // 如果有选中的标签，使用该标签的过滤类型
            const filterType = activeTab.getAttribute('data-type');
            this.filterDiaryList(filterType);
            return;
        }
        
        // 如果没有选中的标签（初始加载），使用默认显示全部
        this.diariesContainer.innerHTML = '';
        
        if (this.diaries.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = '暂无历史记录';
            this.diariesContainer.appendChild(emptyMessage);
            return;
        }
        
        // 按创建时间降序排序
        const sortedDiaries = [...this.diaries].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        sortedDiaries.forEach(diary => {
            const diaryItem = document.createElement('div');
            diaryItem.className = 'diary-item';
            diaryItem.setAttribute('data-id', diary.id);
            
            const header = document.createElement('div');
            header.className = 'diary-item-header';
            
            const title = document.createElement('h3');
            title.textContent = diary.title;
            
            const date = document.createElement('div');
            date.className = 'diary-date';
            date.textContent = new Date(diary.createdAt).toLocaleString();
            
            header.appendChild(title);
            header.appendChild(date);
            
            const preview = document.createElement('p');
            preview.className = 'diary-preview';
            preview.textContent = diary.text.substr(0, 100) + (diary.text.length > 100 ? '...' : '');
            
            diaryItem.appendChild(header);
            diaryItem.appendChild(preview);
            
            // 添加点击事件
            diaryItem.addEventListener('click', () => {
                this.viewDiaryDetail(diary);
            });
            
            this.diariesContainer.appendChild(diaryItem);
        });
    }
    
    // 查看日记详情
    viewDiaryDetail(diary) {
        this.detailDiaryTitle.textContent = diary.title;
        // 判断是否为对话类条目
        if (diary.isConversation) {
            // 解析对话内容，假设格式为：\n分隔的"我: 内容"或"对方: 内容"
            const lines = diary.text.split(/\n+/).filter(line => line.trim());
            let html = '';
            let firstUserSkipped = false;
            lines.forEach(line => {
                if (line.startsWith('我:')) {
                    const content = line.replace('我:', '').trim();
                    // 跳过第一句"请开始对话"
                    if (!firstUserSkipped && content === '请开始对话') {
                        firstUserSkipped = true;
                        return;
                    }
                    firstUserSkipped = true;
                    html += `<div class="user-message message">${content}</div>`;
                } else if (line.startsWith('对方:')) {
                    html += `<div class="bot-message message">${line.replace('对方:', '').trim()}</div>`;
                } else {
                    html += `<div class="message">${line.trim()}</div>`;
                }
            });
            this.detailDiaryText.innerHTML = html;
        } else {
            // 普通日记
            this.detailDiaryText.textContent = diary.text;
        }
        this.detailFeedbackContent.innerHTML = uiManager.formatFeedback(diary.feedback);
        // 设置删除按钮的数据ID
        this.deleteDiaryBtn.setAttribute('data-id', diary.id);
        // 导航到详情页
        uiManager.navigateTo('diary-detail');
    }
    
    // 删除日记
    deleteDiary() {
        const diaryId = this.deleteDiaryBtn.getAttribute('data-id');
        
        if (!diaryId) return;
        
        uiManager.showConfirm('确定要删除这篇日记吗？此操作不可撤销。', () => {
            // 从列表中删除
            this.diaries = this.diaries.filter(diary => diary.id !== diaryId);
            this.saveDiaries();
            
            // 更新UI
            this.renderDiaryList();
            
            // 返回列表页
            uiManager.navigateTo('diary-list');
        });
    }
}

// 创建日记管理器实例
const diaryManager = new DiaryManager(); 