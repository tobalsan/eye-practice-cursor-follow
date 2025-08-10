class EyeTrainingApp {
    constructor() {
        this.shape = document.getElementById('shape');
        this.app = document.getElementById('app');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsMenu = document.getElementById('settingsMenu');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.defaults = {
            theme: 'light',
            size: 8,
            shapeType: 'circle',
            opacity: 100,
            speed: 400,
            turnType: 'angular',
            minFreq: 1.5,
            maxFreq: 3
        };
        
        this.settings = { ...this.defaults };
        this.isPaused = false;
        this.animationId = null;
        this.lastTime = 0;
        
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };
        this.nextTargetTime = 0;
        this.turnDuration = 0;
        
        this.bounds = { width: 0, height: 0 };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateBounds();
        this.applySettings();
        this.initPosition();
        this.pickNewTarget();
        this.start();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('eyeTrainingSettings');
        if (saved) {
            try {
                this.settings = { ...this.defaults, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        }
    }
    
    saveSettings() {
        localStorage.setItem('eyeTrainingSettings', JSON.stringify(this.settings));
    }
    
    setupEventListeners() {
        this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.toggleSettings());
        this.resetBtn.addEventListener('click', () => this.resetToDefaults());
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        window.addEventListener('resize', () => this.updateBounds());
        
        const themeSelect = document.getElementById('theme');
        themeSelect.value = this.settings.theme;
        themeSelect.addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.applySettings();
            this.saveSettings();
        });
        
        const sizeInput = document.getElementById('size');
        const sizeValue = document.getElementById('sizeValue');
        sizeInput.value = this.settings.size;
        sizeValue.textContent = this.settings.size;
        sizeInput.addEventListener('input', (e) => {
            this.settings.size = parseInt(e.target.value);
            sizeValue.textContent = this.settings.size;
            this.applySettings();
            this.saveSettings();
        });
        
        const shapeSelect = document.getElementById('shape-select');
        shapeSelect.value = this.settings.shapeType;
        shapeSelect.addEventListener('change', (e) => {
            this.settings.shapeType = e.target.value;
            this.applySettings();
            this.saveSettings();
        });
        
        const opacityInput = document.getElementById('opacity');
        const opacityValue = document.getElementById('opacityValue');
        opacityInput.value = this.settings.opacity;
        opacityValue.textContent = this.settings.opacity;
        opacityInput.addEventListener('input', (e) => {
            this.settings.opacity = parseInt(e.target.value);
            opacityValue.textContent = this.settings.opacity;
            this.applySettings();
            this.saveSettings();
        });
        
        const speedInput = document.getElementById('speed');
        const speedValue = document.getElementById('speedValue');
        speedInput.value = this.settings.speed;
        speedValue.textContent = this.settings.speed;
        speedInput.addEventListener('input', (e) => {
            this.settings.speed = parseInt(e.target.value);
            speedValue.textContent = this.settings.speed;
            this.saveSettings();
        });
        
        const turnTypeSelect = document.getElementById('turnType');
        turnTypeSelect.value = this.settings.turnType;
        turnTypeSelect.addEventListener('change', (e) => {
            this.settings.turnType = e.target.value;
            this.saveSettings();
        });
        
        const minFreqInput = document.getElementById('minFreq');
        const maxFreqInput = document.getElementById('maxFreq');
        minFreqInput.value = this.settings.minFreq;
        maxFreqInput.value = this.settings.maxFreq;
        
        minFreqInput.addEventListener('change', (e) => {
            this.settings.minFreq = parseFloat(e.target.value);
            if (this.settings.minFreq > this.settings.maxFreq) {
                this.settings.maxFreq = this.settings.minFreq;
                maxFreqInput.value = this.settings.maxFreq;
            }
            this.saveSettings();
        });
        
        maxFreqInput.addEventListener('change', (e) => {
            this.settings.maxFreq = parseFloat(e.target.value);
            if (this.settings.maxFreq < this.settings.minFreq) {
                this.settings.minFreq = this.settings.maxFreq;
                minFreqInput.value = this.settings.minFreq;
            }
            this.saveSettings();
        });
    }
    
    handleKeyboard(e) {
        switch(e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
            case 'r':
                if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    this.resetToDefaults();
                }
                break;
            case 't':
                e.preventDefault();
                this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
                document.getElementById('theme').value = this.settings.theme;
                this.applySettings();
                this.saveSettings();
                break;
        }
    }
    
    toggleSettings() {
        this.settingsMenu.classList.toggle('hidden');
    }
    
    resetToDefaults() {
        this.settings = { ...this.defaults };
        this.applySettings();
        this.saveSettings();
        
        document.getElementById('theme').value = this.settings.theme;
        document.getElementById('size').value = this.settings.size;
        document.getElementById('sizeValue').textContent = this.settings.size;
        document.getElementById('shape-select').value = this.settings.shapeType;
        document.getElementById('opacity').value = this.settings.opacity;
        document.getElementById('opacityValue').textContent = this.settings.opacity;
        document.getElementById('speed').value = this.settings.speed;
        document.getElementById('speedValue').textContent = this.settings.speed;
        document.getElementById('turnType').value = this.settings.turnType;
        document.getElementById('minFreq').value = this.settings.minFreq;
        document.getElementById('maxFreq').value = this.settings.maxFreq;
    }
    
    applySettings() {
        this.app.classList.toggle('dark-theme', this.settings.theme === 'dark');
        
        this.shape.className = 'shape ' + this.settings.shapeType;
        
        if (this.settings.shapeType !== 'cursor') {
            this.shape.style.width = this.settings.size + 'px';
            this.shape.style.height = this.settings.size + 'px';
        }
        
        this.shape.style.opacity = this.settings.opacity / 100;
    }
    
    updateBounds() {
        this.bounds.width = window.innerWidth;
        this.bounds.height = window.innerHeight;
    }
    
    initPosition() {
        this.position.x = this.bounds.width / 2;
        this.position.y = this.bounds.height / 2;
        this.updateShapePosition();
    }
    
    pickNewTarget() {
        this.target.x = Math.random() * this.bounds.width;
        this.target.y = Math.random() * this.bounds.height;
        
        const dx = this.target.x - this.position.x;
        const dy = this.target.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.velocity.x = (dx / distance) * this.settings.speed;
            this.velocity.y = (dy / distance) * this.settings.speed;
        }
        
        this.turnDuration = this.settings.minFreq + Math.random() * (this.settings.maxFreq - this.settings.minFreq);
        this.nextTargetTime = performance.now() + this.turnDuration * 1000;
    }
    
    update(currentTime) {
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            return;
        }
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (this.isPaused) return;
        
        const shouldPickNewTarget = currentTime >= this.nextTargetTime;
        const dx = this.target.x - this.position.x;
        const dy = this.target.y - this.position.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
        const arrivedAtTarget = distanceToTarget < this.settings.speed * deltaTime;
        
        if (shouldPickNewTarget || arrivedAtTarget) {
            this.pickNewTarget();
            return;
        }
        
        if (this.settings.turnType === 'curved' && distanceToTarget > 0) {
            const targetAngle = Math.atan2(dy, dx);
            const currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
            
            let angleDiff = targetAngle - currentAngle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            const maxTurnRate = Math.PI * 2;
            const turnAmount = Math.max(-maxTurnRate * deltaTime, Math.min(maxTurnRate * deltaTime, angleDiff));
            const newAngle = currentAngle + turnAmount;
            
            this.velocity.x = Math.cos(newAngle) * this.settings.speed;
            this.velocity.y = Math.sin(newAngle) * this.settings.speed;
        } else if (distanceToTarget > 0) {
            this.velocity.x = (dx / distanceToTarget) * this.settings.speed;
            this.velocity.y = (dy / distanceToTarget) * this.settings.speed;
        }
        
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        const shapeHalfSize = this.settings.shapeType === 'cursor' ? 8 : this.settings.size / 2;
        
        if (this.position.x - shapeHalfSize < 0) {
            this.position.x = shapeHalfSize;
            this.velocity.x = Math.abs(this.velocity.x);
            this.pickNewTarget();
        } else if (this.position.x + shapeHalfSize > this.bounds.width) {
            this.position.x = this.bounds.width - shapeHalfSize;
            this.velocity.x = -Math.abs(this.velocity.x);
            this.pickNewTarget();
        }
        
        if (this.position.y - shapeHalfSize < 0) {
            this.position.y = shapeHalfSize;
            this.velocity.y = Math.abs(this.velocity.y);
            this.pickNewTarget();
        } else if (this.position.y + shapeHalfSize > this.bounds.height) {
            this.position.y = this.bounds.height - shapeHalfSize;
            this.velocity.y = -Math.abs(this.velocity.y);
            this.pickNewTarget();
        }
        
        this.updateShapePosition();
    }
    
    updateShapePosition() {
        const shapeHalfSize = this.settings.shapeType === 'cursor' ? 8 : this.settings.size / 2;
        const x = this.position.x - shapeHalfSize;
        const y = this.position.y - shapeHalfSize;
        this.shape.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
    
    animate(currentTime) {
        this.update(currentTime);
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    start() {
        if (this.animationId) return;
        this.lastTime = 0;
        this.animate(performance.now());
    }
    
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTime = performance.now();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EyeTrainingApp();
});