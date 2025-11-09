// websocket stuff

class WS {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    this.socket = io();
    
    this.socket.on('connect', () => {
      this.connected = true;
      if (this.onConnect) this.onConnect();
    });
    
    this.socket.on('allDrawings', (drawings) => {
      if (this.onAllDrawings) this.onAllDrawings(drawings);
    });
    
    this.socket.on('newDrawing', (drawing) => {
      if (this.onNewDrawing) this.onNewDrawing(drawing);
    });
    
    this.socket.on('clear', () => {
      if (this.onClear) this.onClear();
    });
    
    this.socket.on('undo', (data) => {
      if (this.onUndo) this.onUndo(data);
    });
    
    this.socket.on('redo', (data) => {
      if (this.onRedo) this.onRedo(data);
    });
    
    this.socket.on('users', (users) => {
      if (this.onUsers) this.onUsers(users);
    });
  }

  join(name) {
    this.socket.emit('join', name);
  }

  sendDraw(drawing) {
    this.socket.emit('draw', drawing);
  }

  sendClear() {
    this.socket.emit('clear');
  }

  sendUndo() {
    if (this.socket && this.connected) {
      this.socket.emit('undo');
    }
  }

  sendRedo() {
    if (this.socket && this.connected) {
      this.socket.emit('redo');
    }
  }
}
