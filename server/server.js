const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// socket.io - copied this from a tutorial
const io = new Server(server, {
  cors: {
    origin: "*"  // allow all for now
  }
});

const PORT = 3000;

// serve files
app.use(express.static(path.join(__dirname, '../client')));

// store drawings here - just an array
let allDrawings = [];

// history for undo/redo
let history = [];
let redoStack = [];

// store users
let users = {};

io.on('connection', (socket) => {
  console.log('someone connected');

  // user joins
  socket.on('join', (name) => {
    users[socket.id] = {
      name: name || 'User',
      color: '#FF6B6B'  // everyone gets same color, didn't have time to do different colors
    };
    
    // send them existing drawings
    socket.emit('allDrawings', allDrawings);
    
    // tell others
    io.emit('users', Object.values(users));
  });

  // someone drew something
  socket.on('draw', (drawing) => {
    // make unique id - use timestamp + random string
    drawing.id = 'draw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    drawing.userId = socket.id;
    allDrawings.push(drawing);  // save it
    history.push({ type: 'draw', drawing: drawing });  // add to history
    redoStack = [];  // clear redo stack when new action
    io.emit('newDrawing', drawing);  // send to everyone including sender so they get the ID
    console.log('New drawing saved with id:', drawing.id);
  });

  // undo
  socket.on('undo', () => {
    if (history.length > 0) {
      const lastAction = history.pop();
      if (lastAction.type === 'draw') {
        // remove the drawing
        const index = allDrawings.findIndex(d => d.id === lastAction.drawing.id);
        if (index !== -1) {
          const removed = allDrawings.splice(index, 1)[0];
          redoStack.push(lastAction);
          io.emit('undo', { drawingId: lastAction.drawing.id });
          console.log('Undo: removed drawing', lastAction.drawing.id);
        } else {
          console.log('Undo: drawing not found', lastAction.drawing.id);
        }
      }
    } else {
      console.log('Undo: no history');
    }
  });

  // redo
  socket.on('redo', () => {
    if (redoStack.length > 0) {
      const action = redoStack.pop();
      if (action.type === 'draw') {
        allDrawings.push(action.drawing);
        history.push(action);
        io.emit('redo', { drawing: action.drawing });
        console.log('Redo: restored drawing', action.drawing.id);
      }
    } else {
      console.log('Redo: nothing to redo');
    }
  });

  // clear canvas
  socket.on('clear', () => {
    // save to history before clearing
    history.push({ type: 'clear', drawings: [...allDrawings] });
    redoStack = [];
    allDrawings = [];
    io.emit('clear');
  });

  // disconnect
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('users', Object.values(users));
  });
});

server.listen(PORT, () => {
  console.log('server running on port', PORT);
});
