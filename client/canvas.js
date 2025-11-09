// canvas drawing - took me a while to figure this out

class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.drawing = false;
    this.path = [];
    this.color = '#000000';
    this.width = 5;
    this.tool = 'brush';  // brush or eraser
    
    // set size
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    // white background
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.setupEvents();
  }

  setupEvents() {
    // mouse stuff - basic event handlers
    this.canvas.onmousedown = (e) => {
      this.drawing = true;
      const pos = this.getPos(e);
      this.path = [pos];
      this.lastX = pos.x;
      this.lastY = pos.y;
    };
    
    this.canvas.onmousemove = (e) => {
      if (!this.drawing) return;
      const pos = this.getPos(e);
      this.path.push(pos);
      
      // draw
      this.ctx.lineWidth = this.width;
      this.ctx.lineCap = 'round';
      
      // eraser or brush?
      if (this.tool === 'eraser') {
        this.ctx.globalCompositeOperation = 'destination-out';  // erases
      } else {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.color;
      }
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
      this.ctx.globalCompositeOperation = 'source-over';  // reset
      
      this.lastX = pos.x;
      this.lastY = pos.y;
    };
    
    this.canvas.onmouseup = () => {
      if (this.drawing && this.onDrawEnd) {
        this.onDrawEnd({
          path: this.path,
          color: this.color,
          width: this.width,
          tool: this.tool
        });
      }
      this.drawing = false;
      this.path = [];
    };
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  // draw something someone else drew
  drawOther(drawing) {
    this.ctx.lineWidth = drawing.width;
    this.ctx.lineCap = 'round';
    
    // handle eraser
    if (drawing.tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = drawing.color;
    }
    
    this.ctx.beginPath();
    if (drawing.path.length > 0) {
      this.ctx.moveTo(drawing.path[0].x, drawing.path[0].y);
      for (let i = 1; i < drawing.path.length; i++) {
        this.ctx.lineTo(drawing.path[i].x, drawing.path[i].y);
      }
    }
    this.ctx.stroke();
    this.ctx.globalCompositeOperation = 'source-over';  // reset
  }

  // redraw everything
  redrawAll(drawings) {
    // clear
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // draw all
    drawings.forEach(d => this.drawOther(d));
  }

  clear() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setColor(c) {
    this.color = c;
  }

  setWidth(w) {
    this.width = w;
  }

  setTool(tool) {
    this.tool = tool;
    // change cursor
    this.canvas.style.cursor = tool === 'eraser' ? 'grab' : 'crosshair';
  }
}
