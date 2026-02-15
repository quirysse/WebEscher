// WebEscher - Escher-inspired tiling application
class WebEscher {
    constructor() {
        this.tilingCanvas = document.getElementById('tilingCanvas');
        this.editorCanvas = document.getElementById('editorCanvas');
        this.tilingCtx = this.tilingCanvas.getContext('2d');
        this.editorCtx = this.editorCanvas.getContext('2d');
        
        this.wallpaperGroup = null;
        this.baseShape = 'square';
        this.shapePoints = [];
        this.tileSize = 80;
        this.selectedPoint = null;
        this.isDragging = false;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Event listeners
        document.getElementById('wallpaperGroup').addEventListener('change', (e) => {
            this.wallpaperGroup = e.target.value;
            this.resetShape();
        });
        
        document.getElementById('baseShape').addEventListener('change', (e) => {
            this.baseShape = e.target.value;
            this.resetShape();
        });
        
        document.getElementById('resetShape').addEventListener('click', () => {
            this.resetShape();
        });
        
        document.getElementById('clearCanvas').addEventListener('click', () => {
            this.clearAll();
        });
        
        // Mouse events for shape editing
        this.editorCanvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.editorCanvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.editorCanvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.editorCanvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));
        
        this.resetShape();
    }
    
    resizeCanvas() {
        const wrapper = document.querySelector('.canvas-wrapper');
        const width = wrapper.clientWidth;
        const height = wrapper.clientHeight;
        
        this.tilingCanvas.width = width;
        this.tilingCanvas.height = height;
        this.editorCanvas.width = width;
        this.editorCanvas.height = height;
        
        this.render();
    }
    
    resetShape() {
        this.shapePoints = this.getDefaultShape(this.baseShape);
        this.render();
    }
    
    getDefaultShape(shape) {
        const centerX = this.tileSize / 2;
        const centerY = this.tileSize / 2;
        const size = this.tileSize / 2;
        
        switch (shape) {
            case 'square':
                return [
                    { x: 0, y: 0 },
                    { x: this.tileSize, y: 0 },
                    { x: this.tileSize, y: this.tileSize },
                    { x: 0, y: this.tileSize }
                ];
            case 'triangle':
                return [
                    { x: centerX, y: centerY - size },
                    { x: centerX + size, y: centerY + size },
                    { x: centerX - size, y: centerY + size }
                ];
            case 'hexagon':
                const hexPoints = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i - Math.PI / 6;
                    hexPoints.push({
                        x: centerX + size * Math.cos(angle),
                        y: centerY + size * Math.sin(angle)
                    });
                }
                return hexPoints;
            default:
                return this.getDefaultShape('square');
        }
    }
    
    clearAll() {
        this.tilingCtx.clearRect(0, 0, this.tilingCanvas.width, this.tilingCanvas.height);
        this.editorCtx.clearRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
        this.wallpaperGroup = null;
        document.getElementById('wallpaperGroup').value = '';
        this.shapePoints = [];
    }
    
    onMouseDown(e) {
        const rect = this.editorCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find if we clicked near a control point
        for (let i = 0; i < this.shapePoints.length; i++) {
            const dx = x - this.shapePoints[i].x;
            const dy = y - this.shapePoints[i].y;
            if (Math.sqrt(dx * dx + dy * dy) < 10) {
                this.selectedPoint = i;
                this.isDragging = true;
                break;
            }
        }
    }
    
    onMouseMove(e) {
        if (!this.isDragging || this.selectedPoint === null) return;
        
        const rect = this.editorCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.shapePoints[this.selectedPoint] = { x, y };
        this.render();
    }
    
    onMouseUp(e) {
        this.isDragging = false;
        this.selectedPoint = null;
    }
    
    render() {
        // Clear canvases
        this.tilingCtx.clearRect(0, 0, this.tilingCanvas.width, this.tilingCanvas.height);
        this.editorCtx.clearRect(0, 0, this.editorCanvas.width, this.editorCanvas.height);
        
        if (this.shapePoints.length === 0 || !this.wallpaperGroup) {
            // Draw instructions
            this.editorCtx.fillStyle = '#999';
            this.editorCtx.font = '18px sans-serif';
            this.editorCtx.textAlign = 'center';
            this.editorCtx.fillText(
                'Sélectionnez un groupe de pavage pour commencer',
                this.editorCanvas.width / 2,
                this.editorCanvas.height / 2
            );
            return;
        }
        
        // Render tiling
        this.renderTiling();
        
        // Render editor overlay (control points for the first tile)
        this.renderEditor();
    }
    
    renderTiling() {
        const cols = Math.ceil(this.tilingCanvas.width / this.tileSize) + 2;
        const rows = Math.ceil(this.tilingCanvas.height / this.tileSize) + 2;
        
        this.tilingCtx.strokeStyle = '#333';
        this.tilingCtx.lineWidth = 2;
        this.tilingCtx.fillStyle = 'rgba(102, 126, 234, 0.3)';
        
        for (let row = -1; row < rows; row++) {
            for (let col = -1; col < cols; col++) {
                this.drawTile(col, row);
            }
        }
    }
    
    drawTile(col, row) {
        const tx = col * this.tileSize;
        const ty = row * this.tileSize;
        
        this.tilingCtx.save();
        this.tilingCtx.translate(tx, ty);
        
        // Apply transformations based on wallpaper group
        this.applyWallpaperTransform(col, row);
        
        // Draw the shape
        this.tilingCtx.beginPath();
        if (this.shapePoints.length > 0) {
            this.tilingCtx.moveTo(this.shapePoints[0].x, this.shapePoints[0].y);
            for (let i = 1; i < this.shapePoints.length; i++) {
                this.tilingCtx.lineTo(this.shapePoints[i].x, this.shapePoints[i].y);
            }
            this.tilingCtx.closePath();
            this.tilingCtx.fill();
            this.tilingCtx.stroke();
        }
        
        this.tilingCtx.restore();
    }
    
    applyWallpaperTransform(col, row) {
        const centerX = this.tileSize / 2;
        const centerY = this.tileSize / 2;
        
        switch (this.wallpaperGroup) {
            case 'p1':
                // No symmetry - just translation
                break;
                
            case 'p2':
                // 180° rotation
                if ((col + row) % 2 === 1) {
                    this.tilingCtx.translate(centerX, centerY);
                    this.tilingCtx.rotate(Math.PI);
                    this.tilingCtx.translate(-centerX, -centerY);
                }
                break;
                
            case 'pm':
                // Vertical reflection
                if (col % 2 === 1) {
                    this.tilingCtx.translate(this.tileSize, 0);
                    this.tilingCtx.scale(-1, 1);
                }
                break;
                
            case 'pg':
                // Glide reflection
                if (col % 2 === 1) {
                    this.tilingCtx.translate(0, centerY);
                    this.tilingCtx.translate(this.tileSize, 0);
                    this.tilingCtx.scale(-1, 1);
                }
                break;
                
            case 'pmm':
                // Perpendicular reflections
                if (col % 2 === 1) {
                    this.tilingCtx.translate(this.tileSize, 0);
                    this.tilingCtx.scale(-1, 1);
                }
                if (row % 2 === 1) {
                    this.tilingCtx.translate(0, this.tileSize);
                    this.tilingCtx.scale(1, -1);
                }
                break;
                
            case 'pmg':
                // Reflection + glide
                if (col % 2 === 1) {
                    this.tilingCtx.translate(this.tileSize, 0);
                    this.tilingCtx.scale(-1, 1);
                }
                if (row % 2 === 1) {
                    this.tilingCtx.translate(centerX, this.tileSize);
                    this.tilingCtx.scale(1, -1);
                }
                break;
                
            case 'pgg':
                // Perpendicular glides
                if ((col + row) % 2 === 1) {
                    this.tilingCtx.translate(centerX, centerY);
                    this.tilingCtx.rotate(Math.PI);
                    this.tilingCtx.translate(-centerX, -centerY);
                }
                break;
                
            case 'cm':
                // Single reflection (rhombic)
                if (col % 2 === 1) {
                    this.tilingCtx.translate(this.tileSize, 0);
                    this.tilingCtx.scale(-1, 1);
                }
                break;
                
            case 'cmm':
                // Diagonal reflections
                if (col % 2 === 1) {
                    this.tilingCtx.translate(this.tileSize, 0);
                    this.tilingCtx.scale(-1, 1);
                }
                if (row % 2 === 1) {
                    this.tilingCtx.translate(0, this.tileSize);
                    this.tilingCtx.scale(1, -1);
                }
                break;
                
            case 'p4':
                // 90° rotation
                const rotation = (col % 2) * 2 + (row % 2);
                this.tilingCtx.translate(centerX, centerY);
                this.tilingCtx.rotate((Math.PI / 2) * rotation);
                this.tilingCtx.translate(-centerX, -centerY);
                break;
                
            case 'p4m':
                // 90° rotation + reflections
                const rot4m = (col % 2) * 2 + (row % 2);
                this.tilingCtx.translate(centerX, centerY);
                this.tilingCtx.rotate((Math.PI / 2) * rot4m);
                if ((col + row) % 2 === 1) {
                    this.tilingCtx.scale(-1, 1);
                }
                this.tilingCtx.translate(-centerX, -centerY);
                break;
                
            case 'p4g':
                // 90° rotation + glides
                const rot4g = ((col % 2) * 2 + (row % 2)) % 4;
                this.tilingCtx.translate(centerX, centerY);
                this.tilingCtx.rotate((Math.PI / 2) * rot4g);
                this.tilingCtx.translate(-centerX, -centerY);
                break;
                
            case 'p3':
                // 120° rotation
                const rot3 = (col + row * 2) % 3;
                this.tilingCtx.translate(centerX, centerY);
                this.tilingCtx.rotate((2 * Math.PI / 3) * rot3);
                this.tilingCtx.translate(-centerX, -centerY);
                break;
                
            case 'p3m1':
            case 'p31m':
                // 120° rotation + reflections
                const rot3m = (col + row * 2) % 3;
                this.tilingCtx.translate(centerX, centerY);
                this.tilingCtx.rotate((2 * Math.PI / 3) * rot3m);
                if ((col % 2) !== (row % 2)) {
                    this.tilingCtx.scale(-1, 1);
                }
                this.tilingCtx.translate(-centerX, -centerY);
                break;
                
            case 'p6':
                // 60° rotation
                const rot6 = (col * 3 + row * 2) % 6;
                this.tilingCtx.translate(centerX, centerY);
                this.tilingCtx.rotate((Math.PI / 3) * rot6);
                this.tilingCtx.translate(-centerX, -centerY);
                break;
                
            case 'p6m':
                // 60° rotation + reflections
                const rot6m = (col * 3 + row * 2) % 6;
                this.tilingCtx.translate(centerX, centerY);
                this.tilingCtx.rotate((Math.PI / 3) * rot6m);
                if ((col + row) % 2 === 1) {
                    this.tilingCtx.scale(-1, 1);
                }
                this.tilingCtx.translate(-centerX, -centerY);
                break;
        }
    }
    
    renderEditor() {
        // Draw control points for editing
        this.editorCtx.fillStyle = '#667eea';
        this.editorCtx.strokeStyle = '#fff';
        this.editorCtx.lineWidth = 2;
        
        // Draw lines connecting points
        this.editorCtx.strokeStyle = '#667eea';
        this.editorCtx.lineWidth = 1;
        this.editorCtx.setLineDash([5, 5]);
        this.editorCtx.beginPath();
        if (this.shapePoints.length > 0) {
            this.editorCtx.moveTo(this.shapePoints[0].x, this.shapePoints[0].y);
            for (let i = 1; i < this.shapePoints.length; i++) {
                this.editorCtx.lineTo(this.shapePoints[i].x, this.shapePoints[i].y);
            }
            this.editorCtx.closePath();
            this.editorCtx.stroke();
        }
        this.editorCtx.setLineDash([]);
        
        // Draw control points
        for (let i = 0; i < this.shapePoints.length; i++) {
            this.editorCtx.beginPath();
            this.editorCtx.arc(
                this.shapePoints[i].x,
                this.shapePoints[i].y,
                6,
                0,
                Math.PI * 2
            );
            this.editorCtx.fillStyle = this.selectedPoint === i ? '#ff6b6b' : '#667eea';
            this.editorCtx.fill();
            this.editorCtx.strokeStyle = '#fff';
            this.editorCtx.stroke();
        }
        
        // Draw label
        this.editorCtx.fillStyle = '#667eea';
        this.editorCtx.font = '14px sans-serif';
        this.editorCtx.fillText('Zone d\'édition (faites glisser les points)', 10, 20);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WebEscher();
});
