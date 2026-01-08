// ========== 学习功能和数据管理模块 ==========
const Learning = {
    // 学习状态
    currentSentence: "",
    currentSentenceChinese: "",
    currentModalSentence: "",
    currentModalChinese: "",
    
    // 每日任务数据
    dailyTaskCount: 0,
    dailyTaskTarget: 5,
    persistDays: 0,
    lastCheckinDate: "",
    userPoints: 0,
    
    // 拖拽相关
    dragPanel: null,
    dragStartX: 0,
    dragStartY: 0,

    // 设置用户数据
    setUserData(points, days, sentences) {
        this.userPoints = points;
        this.persistDays = days;
        
        // 从本地存储恢复今日任务数
        const today = Utils.formatDate(new Date());
        const storedDate = localStorage.getItem('lastCheckinDate');
        if (storedDate === today) {
            this.dailyTaskCount = localStorage.getItem('dailyTaskCount') ? 
                parseInt(localStorage.getItem('dailyTaskCount')) : 0;
        } else {
            this.dailyTaskCount = 0;
        }
    },

    // 初始化拖拽
    initDrag() {
        const panel = document.getElementById('floatingPanel');
        panel.addEventListener('mousedown', function(e) {
            Utils.createParticle(e);
            Learning.dragPanel = panel;
            Learning.dragStartX = e.clientX - panel.offsetLeft;
            Learning.dragStartY = e.clientY - panel.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (Learning.dragPanel) {
                const x = e.clientX - Learning.dragStartX;
                const y = e.clientY - Learning.dragStartY;
                Learning.dragPanel.style.left = x + 'px';
                Learning.dragPanel.style.top = y + 'px';
                Learning.dragPanel.style.transform = 'none';
            }
        });

        document.addEventListener('mouseup', function() {
            Learning.dragPanel = null;
        });
    },

    // 刷新句子
    refreshSentence() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;
        
        Utils.createParticle(event);
        const sentenceItem = Content.getRandomSentence();
        this.currentSentence = sentenceItem.en;
        this.currentSentenceChinese = sentenceItem.cn;
        
        // 处理英文句子
        const englishElement = document.getElementById('sentenceEnglish');
        englishElement.innerHTML = Content.processSentence(this.currentSentence);
        document.getElementById('sentenceChinese').textContent = this.currentSentenceChinese;
        
        document.getElementById('guideBar').textContent = 
            `📖 请熟读当前句子，已完成 ${this.dailyTaskCount}/${this.dailyTaskTarget} 句，当前积分: ${this.userPoints}`;
    },

    // 显示单词弹窗
    showWordModal(word) {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;
        
        Utils.createParticle(event);
        const wordData = Content.getWordInfo(word);
        if (!wordData) return;
        
        document.getElementById('wordName').textContent = word;
        document.getElementById('wordPronunciation').textContent = wordData.pronunciation;
        document.getElementById('wordMeaning').textContent = wordData.meaning;
        document.getElementById('wordExample').textContent = wordData.example;
        
        document.getElementById('wordModal').style.display = 'flex';
    },

    // 关闭单词弹窗
    closeWordModal() {
        Utils.createParticle(event);
        document.getElementById('wordModal').style.display = 'none';
    },

    // 触发默写弹窗
    triggerModalNow() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) {
            alert('请先登录！');
            document.getElementById('loginPanel').style.display = 'flex';
            return;
        }
        
        Utils.createParticle(event);
        this.currentModalSentence = this.currentSentence;
        this.currentModalChinese = this.currentSentenceChinese;
        document.getElementById('inputArea').value = '';
        document.getElementById('chineseHint').style.display = 'none';
        document.getElementById('chineseHint').textContent = '';
        document.getElementById('modal').style.display = 'flex';
    },

    // 切换中文提示
    toggleChineseHint() {
        Utils.createParticle(event);
        const hintElement = document.getElementById('chineseHint');
        if (hintElement.style.display === 'none' || hintElement.style.display === '') {
            hintElement.textContent = `中文翻译：${this.currentModalChinese}`;
            hintElement.style.display = 'block';
        } else {
            hintElement.style.display = 'none';
        }
    },

    // 关闭默写弹窗
    closeModal() {
        Utils.createParticle(event);
        document.getElementById('modal').style.display = 'none';
    },

    // 检查答案
    async checkAnswer() {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;
        
        Utils.createParticle(event);
        const userInput = document.getElementById('inputArea').value.trim().toLowerCase();
        const correctAnswer = this.currentModalSentence.trim().toLowerCase();
        const resultAlert = document.getElementById('resultAlert');
        const resultTitle = document.getElementById('resultTitle');
        const resultContent = document.getElementById('resultContent');

        if (userInput === correctAnswer) {
            // 回答正确
            this.dailyTaskCount++;
            
            // 添加积分
            await this.addUserPoints(1);
            
            resultTitle.className = 'result-title result-correct';
            resultTitle.textContent = '✅ 记忆完全正确！';
            resultContent.textContent = `原文：${this.currentModalSentence}\n\n✅ 获得 +1 积分！\n已完成 ${this.dailyTaskCount}/${this.dailyTaskTarget} 句\n当前积分: ${this.userPoints}`;
            
            // 更新任务进度
            this.updateTaskProgress();
            
            // 检查是否完成今日任务
            if (this.dailyTaskCount >= this.dailyTaskTarget) {
                // 完成每日任务额外奖励积分
                await this.addUserPoints(5);
                
                // 增加坚持天数
                const today = Utils.formatDate(new Date());
                if (this.lastCheckinDate !== today) {
                    this.persistDays++;
                    this.lastCheckinDate = today;
                    localStorage.setItem('persistDays', this.persistDays);
                    
                    // 连续打卡7天额外奖励
                    if (this.persistDays % 7 === 0) {
                        await this.addUserPoints(10);
                    }
                    
                    // 更新用户资料
                    await Auth.updateUserProfile({
                        points: this.userPoints,
                        days: this.persistDays,
                        sentences: this.persistDays * 5 + this.dailyTaskCount
                    });
                }
                
                // 显示打卡成功
                document.getElementById('checkinText').textContent = 
                    `你已坚持学习 ${this.persistDays} 天，获得 +5 积分奖励！\n当前总积分: ${this.userPoints}`;
                document.getElementById('checkinAlert').style.display = 'block';
                
                // 重置每日计数
                this.dailyTaskCount = 0;
                localStorage.setItem('dailyTaskCount', 0);
            }
        } else {
            resultTitle.className = 'result-title result-error';
            resultTitle.textContent = '❌ 记忆有错误哦！';
            resultContent.textContent = `你的输入：${userInput}\n正确原文：${this.currentModalSentence}`;
        }

        document.getElementById('modal').style.display = 'none';
        resultAlert.style.display = 'block';
        
        setTimeout(() => this.refreshSentence(), 500);
    },

    // 关闭结果弹窗
    closeResultAlert() {
        Utils.createParticle(event);
        document.getElementById('resultAlert').style.display = 'none';
    },

    // 更新任务进度
    updateTaskProgress() {
        const progressPercent = (this.dailyTaskCount / this.dailyTaskTarget) * 100;
        document.getElementById('progressFill').style.width = `${progressPercent}%`;
        document.getElementById('progressText').textContent = `${this.dailyTaskCount}/${this.dailyTaskTarget}`;
        document.getElementById('guideBar').textContent = 
            `📖 请熟读当前句子，已完成 ${this.dailyTaskCount}/${this.dailyTaskTarget} 句，当前积分: ${this.userPoints}`;
    },

    // 更新任务统计
    updateTaskStats() {
        document.getElementById('taskStats').textContent = `已坚持 ${this.persistDays} 天 | 积分: ${this.userPoints}`;
    },

    // 关闭打卡成功弹窗
    closeCheckinAlert() {
        Utils.createParticle(event);
        document.getElementById('checkinAlert').style.display = 'none';
        this.updateTaskProgress();
    },

    // 显示积分说明弹窗
    showPointsModal() {
        Utils.createParticle(event);
        document.getElementById('pointsModal').style.display = 'flex';
    },

    // 关闭积分说明弹窗
    closePointsModal() {
        Utils.createParticle(event);
        document.getElementById('pointsModal').style.display = 'none';
    },

    // 添加用户积分
    async addUserPoints(pointsToAdd) {
        const currentUser = Auth.getCurrentUser();
        if (!currentUser) return;
        
        this.userPoints += pointsToAdd;
        
        // 保存今日任务数到本地存储
        const today = Utils.formatDate(new Date());
        localStorage.setItem('dailyTaskCount', this.dailyTaskCount);
        localStorage.setItem('lastCheckinDate', today);
        
        // 更新用户资料（云端）
        await Auth.updateUserProfile({
            points: this.userPoints,
            days: this.persistDays,
            sentences: this.persistDays * 5 + this.dailyTaskCount
        });
        
        // 更新界面
        this.updateTaskStats();
        document.getElementById('currentUserId').textContent = 
            `你：${currentUser.username} (积分: ${this.userPoints})`;
        
        // 更新排行榜
        await this.fetchAllUsersRanking();
    },

    // 获取所有用户排名
    async fetchAllUsersRanking() {
        try {
            const users = await Auth.getAllUsers();
            
            // 按积分排序
            users.sort((a, b) => b.points - a.points);
            
            // 渲染排行榜
            this.renderRankingList(users);
            
        } catch (error) {
            console.error('获取排行榜数据失败:', error);
        }
    },

    // 渲染排行榜
    renderRankingList(users) {
        const rankingList = document.getElementById('rankingList');
        const currentUser = Auth.getCurrentUser();
        
        if (!users || users.length === 0) {
            rankingList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #8a7d74;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📊</div>
                    <div>暂无排行榜数据</div>
                </div>
            `;
            return;
        }
        
        rankingList.innerHTML = '';
        
        users.forEach((user, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'ranking-item';
            
            // 为前三名添加特殊样式
            let rankClass = '';
            if (index === 0) rankClass = 'top1';
            else if (index === 1) rankClass = 'top2';
            else if (index === 2) rankClass = 'top3';
            
            // 突出显示当前用户
            const isCurrentUser = currentUser && user.username === currentUser.username;
            if (isCurrentUser) {
                rankItem.style.background = 'rgba(255, 240, 245, 0.8)';
                rankItem.style.border = '1px solid #ffcccc';
            }
            
            rankItem.innerHTML = `
                <div class="rank-number ${rankClass}">${index + 1}</div>
                <div class="rank-info">
                    <div class="rank-name">${user.username} ${isCurrentUser ? '👤' : ''}</div>
                    <div class="rank-stats">
                        <div class="rank-days">
                            <span>📅</span> ${user.days}天
                        </div>
                        <div class="rank-sentences">
                            <span>📖</span> ${user.sentences}句
                        </div>
                        <div class="rank-points">
                            <span>⭐</span> ${user.points}分
                        </div>
                    </div>
                </div>
            `;
            
            rankingList.appendChild(rankItem);
        });
    }
};