// ========== 认证和用户管理模块 ==========
const Auth = {
    // Supabase 配置
    SUPABASE_URL: 'https://qwjluoxicuhqrneysoqv.supabase.co',
    SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_QyUkspawlcN9ZB9MOzQIyA_ZD4-awrh',
    
    currentUser: null,
    currentToken: null,
    
    // 允许的用户名列表
    allowedUsernames: ["昊昊", "朋朋", "党党", "金金", "淼淼", "文文", "静静", "瑶瑶", "杰杰", "楠楠", "萌萌", "姜姜", "真真", "东东", "羊羊"],

    // 初始化
    async initialize() {
        try {
            console.log('初始化认证模块...');
            
            // 检查本地存储中是否有 token
            this.currentToken = localStorage.getItem('supabase_token');
            
            if (this.currentToken) {
                // 尝试获取用户信息
                await this.fetchUserProfile();
            } else {
                // 未登录，显示登录面板
                console.log('无现有会话，显示登录面板');
                document.getElementById('loginPanel').style.display = 'flex';
                Utils.disableButtons();
            }
            
            // 初始化粒子特效
            Utils.initParticleEffect();
            
        } catch (error) {
            console.error('初始化错误:', error);
        }
    },

    // 登录/注册处理
    async handleLogin() {
        const username = document.getElementById('usernameSelect').value;
        const password = document.getElementById('passwordInput').value;
        
        // 验证输入
        if (!username) {
            Utils.showMessage('loginMessage', '请从名单中选择一个昵称！');
            return;
        }
        
        if (!password || password.length < 3) {
            Utils.showMessage('loginMessage', '密码至少需要3个字符！');
            return;
        }
        
        // 检查用户名是否在允许的名单中
        if (!this.allowedUsernames.includes(username)) {
            Utils.showMessage('loginMessage', '昵称不在允许的名单中！');
            return;
        }
        
        Utils.showMessage('loginMessage', '处理中...');
        
        try {
            const email = `${username}@englishlearner.com`;
            
            // 1. 首先尝试登录
            console.log('尝试登录:', email);
            const loginResponse = await this.makeRequest('/auth/v1/token?grant_type=password', {
                method: 'POST',
                body: {
                    email: email,
                    password: password
                }
            });
            
            if (loginResponse.ok) {
                // 登录成功
                const loginData = await loginResponse.json();
                console.log('登录成功:', loginData);
                
                // 保存 token
                this.currentToken = loginData.access_token;
                localStorage.setItem('supabase_token', this.currentToken);
                
                // 获取用户信息
                await this.fetchUserProfile();
                
                Utils.showMessage('loginMessage', '登录成功！正在进入学习...', true);
            } else {
                // 登录失败，尝试注册
                const errorData = await loginResponse.json();
                console.log('登录失败，尝试注册:', errorData);
                
                if (loginResponse.status === 400 && errorData.msg?.includes('Invalid login credentials')) {
                    // 尝试注册
                    const signupResponse = await this.makeRequest('/auth/v1/signup', {
                        method: 'POST',
                        body: {
                            email: email,
                            password: password,
                            data: {
                                username: username,
                                points: 0,
                                days: 0,
                                sentences: 0
                            }
                        }
                    });
                    
                    if (signupResponse.ok) {
                        const signupData = await signupResponse.json();
                        console.log('注册成功:', signupData);
                        
                        // 自动登录新用户
                        const autoLoginResponse = await this.makeRequest('/auth/v1/token?grant_type=password', {
                            method: 'POST',
                            body: {
                                email: email,
                                password: password
                            }
                        });
                        
                        if (autoLoginResponse.ok) {
                            const loginData = await autoLoginResponse.json();
                            this.currentToken = loginData.access_token;
                            localStorage.setItem('supabase_token', this.currentToken);
                            
                            await this.fetchUserProfile();
                            Utils.showMessage('loginMessage', '注册成功！正在进入学习...', true);
                        } else {
                            Utils.showMessage('loginMessage', '注册成功但自动登录失败，请手动登录');
                            return;
                        }
                    } else {
                        const signupError = await signupResponse.json();
                        if (signupError.msg?.includes('User already registered')) {
                            Utils.showMessage('loginMessage', '该昵称已被注册，请使用正确密码登录！');
                        } else {
                            Utils.showMessage('loginMessage', '注册失败: ' + (signupError.msg || '未知错误'));
                        }
                        return;
                    }
                } else {
                    Utils.showMessage('loginMessage', '登录失败: ' + (errorData.msg || '未知错误'));
                    return;
                }
            }
            
            // 成功后的处理
            setTimeout(() => {
                document.getElementById('loginPanel').style.display = 'none';
                Utils.enableButtons();
                learning.refreshSentence();
                learning.initDrag();
                learning.updateTaskProgress();
                learning.fetchAllUsersRanking();
            }, 1000);
            
        } catch (error) {
            console.error('登录/注册错误:', error);
            Utils.showMessage('loginMessage', '操作失败：' + (error.message || '未知错误'));
        }
    },

    // 通用的请求方法
    async makeRequest(endpoint, options = {}) {
        const url = `${this.SUPABASE_URL}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'apikey': this.SUPABASE_PUBLISHABLE_KEY,
            'Accept': 'application/json'
        };
        
        // 如果有 token，添加 Authorization 头
        if (this.currentToken) {
            defaultHeaders['Authorization'] = `Bearer ${this.currentToken}`;
        }
        
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: { ...defaultHeaders, ...options.headers },
            body: options.body ? JSON.stringify(options.body) : undefined
        });
        
        return response;
    },

    // 获取用户资料
    async fetchUserProfile() {
        try {
            if (!this.currentToken) {
                console.log('无 token，无法获取用户信息');
                return;
            }
            
            const response = await this.makeRequest('/auth/v1/user');
            
            if (response.ok) {
                const userData = await response.json();
                console.log('用户信息:', userData);
                
                this.currentUser = {
                    id: userData.id,
                    username: userData.user_metadata?.username || '未知用户',
                    points: userData.user_metadata?.points || 0,
                    days: userData.user_metadata?.days || 0,
                    sentences: userData.user_metadata?.sentences || 0,
                    email: userData.email
                };
                
                console.log('当前用户对象:', this.currentUser);
                
                // 更新学习模块的用户数据
                learning.setUserData(
                    this.currentUser.points,
                    this.currentUser.days,
                    this.currentUser.sentences
                );
                
                // 更新界面
                learning.updateTaskStats();
                document.getElementById('currentUserId').textContent = 
                    `你：${this.currentUser.username} (积分: ${this.currentUser.points})`;
                
                // 获取所有用户排名
                await learning.fetchAllUsersRanking();
            } else {
                console.error('获取用户信息失败，状态码:', response.status);
                // token 可能过期，清除它
                localStorage.removeItem('supabase_token');
                this.currentToken = null;
                document.getElementById('loginPanel').style.display = 'flex';
            }
            
        } catch (error) {
            console.error('获取用户信息失败:', error);
        }
    },

    // 更新用户资料
    async updateUserProfile(userData) {
        try {
            if (!this.currentToken) {
                console.log('无 token，无法更新用户信息');
                return;
            }
            
            const response = await this.makeRequest('/auth/v1/user', {
                method: 'PUT',
                body: {
                    data: userData
                }
            });
            
            if (response.ok) {
                const updatedData = await response.json();
                console.log('用户资料更新成功:', updatedData);
                
                // 更新本地用户数据
                if (this.currentUser) {
                    this.currentUser.points = userData.points || this.currentUser.points;
                    this.currentUser.days = userData.days || this.currentUser.days;
                    this.currentUser.sentences = userData.sentences || this.currentUser.sentences;
                }
                
                return true;
            } else {
                console.error('更新用户资料失败，状态码:', response.status);
                return false;
            }
            
        } catch (error) {
            console.error('更新用户资料失败:', error);
            return false;
        }
    },

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    },

    // 退出登录
    async logout() {
        this.currentToken = null;
        this.currentUser = null;
        localStorage.removeItem('supabase_token');
        document.getElementById('loginPanel').style.display = 'flex';
        Utils.disableButtons();
    },

    // 获取所有用户（简化版，只返回当前用户）
    async getAllUsers() {
        const users = [];
        if (this.currentUser) {
            users.push({
                username: this.currentUser.username,
                points: this.currentUser.points,
                days: this.currentUser.days,
                sentences: this.currentUser.sentences
            });
        }
        return users;
    }
};