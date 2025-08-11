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
            size: 12,
            shapeType: 'circle',
            opacity: 100,
            speed: 200,
            turnType: 'angular',
            minFreq: 1.5,
            maxFreq: 3,
            playArea: 60,
            axisMode: 'horizontal',
            pauseAtTurns: 200,
            gridOverlay: false,
            circleRadius: 60,
            viewingDistance: 60,
            screenPPI: 110
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
        this.playBounds = { x: 0, y: 0, width: 0, height: 0 };
        this.circleAngle = 0;
        this.pauseUntil = 0;
        this.sessionLog = [];
        this.sessionStartTime = performance.now();
        
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
        
        const playAreaInput = document.getElementById('playArea');
        const playAreaValue = document.getElementById('playAreaValue');
        playAreaInput.value = this.settings.playArea;
        playAreaValue.textContent = this.settings.playArea;
        playAreaInput.addEventListener('input', (e) => {
            this.settings.playArea = parseInt(e.target.value);
            playAreaValue.textContent = this.settings.playArea;
            this.updatePlayBounds();
            this.saveSettings();
        });
        
        const axisModeSelect = document.getElementById('axisMode');
        axisModeSelect.value = this.settings.axisMode;
        axisModeSelect.addEventListener('change', (e) => {
            this.settings.axisMode = e.target.value;
            this.updateAxisModeVisibility();
            this.initPosition();
            this.saveSettings();
        });
        
        const circleRadiusInput = document.getElementById('circleRadius');
        const circleRadiusValue = document.getElementById('circleRadiusValue');
        circleRadiusInput.value = this.settings.circleRadius;
        circleRadiusValue.textContent = this.settings.circleRadius;
        circleRadiusInput.addEventListener('input', (e) => {
            this.settings.circleRadius = parseInt(e.target.value);
            circleRadiusValue.textContent = this.settings.circleRadius;
            this.saveSettings();
        });
        
        const pauseAtTurnsInput = document.getElementById('pauseAtTurns');
        pauseAtTurnsInput.value = this.settings.pauseAtTurns;
        pauseAtTurnsInput.addEventListener('input', (e) => {
            this.settings.pauseAtTurns = parseInt(e.target.value);
            this.saveSettings();
        });
        
        const gridOverlayInput = document.getElementById('gridOverlay');
        gridOverlayInput.checked = this.settings.gridOverlay;
        gridOverlayInput.addEventListener('change', (e) => {
            this.settings.gridOverlay = e.target.checked;
            this.applySettings();
            this.saveSettings();
        });
        
        const viewingDistanceInput = document.getElementById('viewingDistance');
        viewingDistanceInput.value = this.settings.viewingDistance;
        viewingDistanceInput.addEventListener('input', (e) => {
            this.settings.viewingDistance = parseInt(e.target.value);
            this.saveSettings();
        });
        
        const screenPPIInput = document.getElementById('screenPPI');
        screenPPIInput.value = this.settings.screenPPI;
        screenPPIInput.addEventListener('input', (e) => {
            this.settings.screenPPI = parseInt(e.target.value);
            this.saveSettings();
        });
        
        const exportLogBtn = document.getElementById('exportLogBtn');
        exportLogBtn.addEventListener('click', () => {
            this.exportLogToCSV();
        });
        
        this.updateAxisModeVisibility();
    }
    
    updateAxisModeVisibility() {
        const circleRadiusContainer = document.getElementById('circleRadiusContainer');
        if (circleRadiusContainer) {
            circleRadiusContainer.style.display = this.settings.axisMode === 'circle' ? 'block' : 'none';
        }
    }
    
    handleKeyboard(e) {
        const focusedElement = document.activeElement;
        const isInputFocused = focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'SELECT' || focusedElement.tagName === 'TEXTAREA');
        
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
            case 'd':
                if (!isInputFocused) {
                    e.preventDefault();
                    this.logDiplopiaMark();
                }
                break;
        }
    }
    
    toggleSettings() {
        this.settingsMenu.classList.toggle('hidden');
    }
    
    resetToDefaults() {
        const confirmReset = confirm('Reset all settings and clear session log?');
        if (!confirmReset) return;
        
        this.settings = { ...this.defaults };
        this.sessionLog = [];
        this.sessionStartTime = performance.now();
        
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
        document.getElementById('playArea').value = this.settings.playArea;
        document.getElementById('playAreaValue').textContent = this.settings.playArea;
        document.getElementById('axisMode').value = this.settings.axisMode;
        document.getElementById('circleRadius').value = this.settings.circleRadius;
        document.getElementById('circleRadiusValue').textContent = this.settings.circleRadius;
        document.getElementById('pauseAtTurns').value = this.settings.pauseAtTurns;
        document.getElementById('gridOverlay').checked = this.settings.gridOverlay;
        document.getElementById('viewingDistance').value = this.settings.viewingDistance;
        document.getElementById('screenPPI').value = this.settings.screenPPI;
        
        document.getElementById('lastDiplopiaMark').textContent = 'Last diplopia mark: -';
        
        this.updateAxisModeVisibility();
        this.updatePlayBounds();
        this.initPosition();
    }
    
    applySettings() {
        this.app.classList.toggle('dark-theme', this.settings.theme === 'dark');
        
        this.shape.className = 'shape ' + this.settings.shapeType;
        
        if (this.settings.shapeType !== 'cursor') {
            this.shape.style.width = this.settings.size + 'px';
            this.shape.style.height = this.settings.size + 'px';
        }
        
        this.shape.style.opacity = this.settings.opacity / 100;
        
        const gridOverlay = document.getElementById('gridOverlayElement');
        if (gridOverlay) {
            gridOverlay.classList.toggle('visible', this.settings.gridOverlay);
        }
        
        this.updatePlayBounds();
    }
    
    updateBounds() {
        this.bounds.width = window.innerWidth;
        this.bounds.height = window.innerHeight;
        this.updatePlayBounds();
    }
    
    updatePlayBounds() {
        const playAreaRatio = this.settings.playArea / 100;
        const playWidth = this.bounds.width * playAreaRatio;
        const playHeight = this.bounds.height * playAreaRatio;
        
        this.playBounds.width = playWidth;
        this.playBounds.height = playHeight;
        this.playBounds.x = (this.bounds.width - playWidth) / 2;
        this.playBounds.y = (this.bounds.height - playHeight) / 2;
        
        this.clampPositionToPlayArea();
    }
    
    clampPositionToPlayArea() {
        const shapeHalfSize = this.settings.shapeType === 'cursor' ? 8 : this.settings.size / 2;
        
        this.position.x = Math.max(this.playBounds.x + shapeHalfSize, 
                                   Math.min(this.playBounds.x + this.playBounds.width - shapeHalfSize, this.position.x));
        this.position.y = Math.max(this.playBounds.y + shapeHalfSize, 
                                   Math.min(this.playBounds.y + this.playBounds.height - shapeHalfSize, this.position.y));
        
        this.updateShapePosition();
    }
    
    initPosition() {
        this.position.x = this.playBounds.x + this.playBounds.width / 2;
        this.position.y = this.playBounds.y + this.playBounds.height / 2;
        
        if (this.settings.axisMode === 'circle') {
            this.circleAngle = 0;
        } else if (this.settings.turnType === 'curved') {
            const angle = Math.random() * Math.PI * 2;
            this.velocity.x = Math.cos(angle) * this.settings.speed;
            this.velocity.y = Math.sin(angle) * this.settings.speed;
        }
        
        this.updateShapePosition();
    }
    
    pickNewTarget() {
        if (this.settings.axisMode === 'circle') {
            return;
        }
        
        const shapeHalfSize = this.settings.shapeType === 'cursor' ? 8 : this.settings.size / 2;
        
        switch (this.settings.axisMode) {
            case 'horizontal':
                this.target.x = this.playBounds.x + shapeHalfSize + Math.random() * (this.playBounds.width - 2 * shapeHalfSize);
                this.target.y = this.playBounds.y + this.playBounds.height / 2;
                break;
            case 'vertical':
                this.target.x = this.playBounds.x + this.playBounds.width / 2;
                this.target.y = this.playBounds.y + shapeHalfSize + Math.random() * (this.playBounds.height - 2 * shapeHalfSize);
                break;
            default:
                this.target.x = this.playBounds.x + shapeHalfSize + Math.random() * (this.playBounds.width - 2 * shapeHalfSize);
                this.target.y = this.playBounds.y + shapeHalfSize + Math.random() * (this.playBounds.height - 2 * shapeHalfSize);
                break;
        }
        
        if (this.settings.turnType === 'angular') {
            const dx = this.target.x - this.position.x;
            const dy = this.target.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.velocity.x = (dx / distance) * this.settings.speed;
                this.velocity.y = (dy / distance) * this.settings.speed;
            }
        }
        
        this.turnDuration = this.settings.minFreq + Math.random() * (this.settings.maxFreq - this.settings.minFreq);
        this.nextTargetTime = performance.now() + this.turnDuration * 1000 + this.settings.pauseAtTurns;
        this.pauseUntil = performance.now() + this.settings.pauseAtTurns;
    }
    
    update(currentTime) {
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            return;
        }
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (this.isPaused) return;
        
        if (this.pauseUntil > currentTime) return;
        
        if (this.settings.axisMode === 'circle') {
            this.updateCircleMovement(deltaTime);
        } else {
            this.updateWaypointMovement(currentTime, deltaTime);
        }
        
        this.updateVisualAngleReadout();
    }
    
    updateCircleMovement(deltaTime) {
        const centerX = this.playBounds.x + this.playBounds.width / 2;
        const centerY = this.playBounds.y + this.playBounds.height / 2;
        
        const angularSpeed = this.settings.speed / this.settings.circleRadius;
        this.circleAngle += angularSpeed * deltaTime;
        
        if (this.circleAngle >= 2 * Math.PI) {
            this.circleAngle -= 2 * Math.PI;
        }
        
        this.position.x = centerX + Math.cos(this.circleAngle) * this.settings.circleRadius;
        this.position.y = centerY + Math.sin(this.circleAngle) * this.settings.circleRadius;
        
        this.updateShapePosition();
    }
    
    updateWaypointMovement(currentTime, deltaTime) {
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
        
        this.handleBoundaryCollisions();
        this.updateShapePosition();
    }
    
    handleBoundaryCollisions() {
        const shapeHalfSize = this.settings.shapeType === 'cursor' ? 8 : this.settings.size / 2;
        
        if (this.position.x - shapeHalfSize < this.playBounds.x) {
            this.position.x = this.playBounds.x + shapeHalfSize;
            this.velocity.x = Math.abs(this.velocity.x);
            if (this.settings.turnType === 'angular') {
                this.pickNewTarget();
            }
        } else if (this.position.x + shapeHalfSize > this.playBounds.x + this.playBounds.width) {
            this.position.x = this.playBounds.x + this.playBounds.width - shapeHalfSize;
            this.velocity.x = -Math.abs(this.velocity.x);
            if (this.settings.turnType === 'angular') {
                this.pickNewTarget();
            }
        }
        
        if (this.position.y - shapeHalfSize < this.playBounds.y) {
            this.position.y = this.playBounds.y + shapeHalfSize;
            this.velocity.y = Math.abs(this.velocity.y);
            if (this.settings.turnType === 'angular') {
                this.pickNewTarget();
            }
        } else if (this.position.y + shapeHalfSize > this.playBounds.y + this.playBounds.height) {
            this.position.y = this.playBounds.y + this.playBounds.height - shapeHalfSize;
            this.velocity.y = -Math.abs(this.velocity.y);
            if (this.settings.turnType === 'angular') {
                this.pickNewTarget();
            }
        }
    }
    
    updateShapePosition() {
        const shapeHalfSize = this.settings.shapeType === 'cursor' ? 8 : this.settings.size / 2;
        const x = this.position.x - shapeHalfSize;
        const y = this.position.y - shapeHalfSize;
        this.shape.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
    
    calculateVisualAngle(pixelOffset) {
        const cm = (Math.abs(pixelOffset) / this.settings.screenPPI) * 2.54;
        return 2 * Math.atan(cm / (2 * this.settings.viewingDistance)) * 180 / Math.PI;
    }
    
    updateVisualAngleReadout() {
        const centerX = this.bounds.width / 2;
        const offsetX = this.position.x - centerX;
        const eccDegX = this.calculateVisualAngle(offsetX);
        const sign = offsetX >= 0 ? '+' : '-';
        
        const eccentricityElement = document.getElementById('currentEccentricity');
        if (eccentricityElement) {
            eccentricityElement.textContent = `Current eccentricity: ${sign}${eccDegX.toFixed(1)}°`;
        }
    }
    
    logDiplopiaMark() {
        const currentTime = performance.now();
        const sessionTimeMs = currentTime - this.sessionStartTime;
        
        const centerX = this.bounds.width / 2;
        const centerY = this.bounds.height / 2;
        const offsetX = this.position.x - centerX;
        const offsetY = this.position.y - centerY;
        
        const normX = offsetX / (this.playBounds.width / 2);
        const normY = offsetY / (this.playBounds.height / 2);
        
        const eccDegX = this.calculateVisualAngle(offsetX);
        
        const logEntry = {
            iso_timestamp: new Date().toISOString(),
            t_ms_since_session_start: Math.round(sessionTimeMs),
            x_px: Math.round(this.position.x),
            y_px: Math.round(this.position.y),
            norm_x: parseFloat(normX.toFixed(3)),
            norm_y: parseFloat(normY.toFixed(3)),
            ecc_deg_x: parseFloat(eccDegX.toFixed(1)),
            speed_px_s: this.settings.speed,
            dot_size_px: this.settings.size,
            play_area_pct: this.settings.playArea,
            axis_mode: this.settings.axisMode,
            turn_min_s: this.settings.minFreq,
            turn_max_s: this.settings.maxFreq,
            pause_ms: this.settings.pauseAtTurns,
            circle_radius_px: this.settings.circleRadius,
            theme: this.settings.theme,
            opacity: this.settings.opacity,
            shape: this.settings.shapeType
        };
        
        this.sessionLog.push(logEntry);
        
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const lastDiplopiaMark = document.getElementById('lastDiplopiaMark');
        if (lastDiplopiaMark) {
            lastDiplopiaMark.textContent = `Last diplopia mark: ${eccDegX.toFixed(1)}° (time ${time})`;
        }
        
        this.showToast('Marked');
    }
    
    showToast(message) {
        const toast = document.getElementById('toastMessage');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('visible');
            setTimeout(() => {
                toast.classList.remove('visible');
            }, 1500);
        }
    }
    
    exportLogToCSV() {
        if (this.sessionLog.length === 0) {
            this.showToast('No data to export');
            return;
        }
        
        const headers = [
            'iso_timestamp', 't_ms_since_session_start', 'x_px', 'y_px',
            'norm_x', 'norm_y', 'ecc_deg_x', 'speed_px_s', 'dot_size_px',
            'play_area_pct', 'axis_mode', 'turn_min_s', 'turn_max_s',
            'pause_ms', 'circle_radius_px', 'theme', 'opacity', 'shape'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
        this.sessionLog.forEach(entry => {
            const row = headers.map(header => {
                const value = entry[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvContent += row.join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eye-coordination-log-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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