// ========== 通用工具函数 ==========
const Utils = {
    // 创建粒子特效
    createParticle(e) {
        if (!e) return;
        
        const container = document.getElementById('particle-container');
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const isCherry = Math.random() > 0.5;
            const size = Math.random() * 10 + 5;
            
            particle.style.position = 'absolute';
            particle.style.left = `${e.clientX}px`;
            particle.style.top = `${e.clientY}px`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.borderRadius = isCherry ? '50% 0 50% 50%' : '50%';
            particle.style.backgroundColor = isCherry 
                ? `rgba(${255}, ${Math.floor(Math.random()*50)+200}, ${Math.floor(Math.random()*50)+200}, ${Math.random()*0.8+0.2})`
                : `rgba(${Math.floor(Math.random()*50)+200}, ${Math.floor(Math.random()*50)+200}, ${255}, ${Math.random()*0.8+0.2})`;
            particle.style.opacity = '0';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '99999';
            particle.style.transform = 'translate(-50%, -50%)';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes particleFly {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.8; transform: translate(${x}px, ${y}px) scale(0.8); }
                    100% { opacity: 0; transform: translate(${x*1.5}px, ${y*1.5}px) scale(0); }
                }
            `;
            document.head.appendChild(style);
            
            particle.style.animation = `particleFly ${Math.random()*2+1}s ease forwards`;
            container.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
                style.remove();
            }, 3000);
        }
    },

    // 初始化粒子特效
    initParticleEffect() {
        document.addEventListener('click', function(e) {
            Utils.createParticle(e);
        });
    },

    // 日期格式化
    formatDate(date) {
        return date.toLocaleDateString();
    },

    // 显示消息
    showMessage(elementId, message, isSuccess = false) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = isSuccess ? 'login-message login-success' : 'login-message';
        }
    },

    // 禁用按钮
    disableButtons() {
        const buttons = document.querySelectorAll('.btn-secondary, .btn-primary');
        buttons.forEach(btn => btn.disabled = true);
    },

    // 启用按钮
    enableButtons() {
        const buttons = document.querySelectorAll('.btn-secondary, .btn-primary');
        buttons.forEach(btn => btn.disabled = false);
    }
};