// main file

let canvas;
let ws;
let joined = false;
let allDrawings = [];

window.onload = () => {
  // get canvas
  const canvasEl = document.getElementById('drawingCanvas');
  canvas = new CanvasManager(canvasEl);
  
  // websocket
  ws = new WS();
  ws.connect();
  
  // when connected, auto-join
  ws.onConnect = () => {
    document.getElementById('connectionStatus').textContent = 'Connected';
    // auto join with random name
    const name = 'User' + Math.floor(Math.random() * 1000);
    ws.join(name);
    joined = true;
  };
  
  // get all drawings when joining
  ws.onAllDrawings = (drawings) => {
    allDrawings = drawings;
    canvas.redrawAll(drawings);
  };
  
  // new drawing (from anyone including ourselves)
  ws.onNewDrawing = (drawing) => {
    // check if we already have this drawing (avoid duplicates)
    const exists = allDrawings.find(d => d.id === drawing.id);
    if (!exists) {
      allDrawings.push(drawing);
      // draw it (even if it's ours, server version is the source of truth)
      canvas.drawOther(drawing);
    }
  };
  
  // clear
  ws.onClear = () => {
    canvas.clear();
    allDrawings = [];
  };

  // undo
  ws.onUndo = (data) => {
    console.log('Client undo: looking for', data.drawingId);
    // remove drawing from local array
    const index = allDrawings.findIndex(d => d.id === data.drawingId);
    console.log('Found at index:', index, 'Total drawings:', allDrawings.length);
    if (index !== -1) {
      allDrawings.splice(index, 1);
      // redraw everything
      canvas.redrawAll(allDrawings);
    } else {
      console.log('Drawing not found for undo');
    }
  };

  // redo
  ws.onRedo = (data) => {
    // add drawing back
    allDrawings.push(data.drawing);
    canvas.drawOther(data.drawing);
  };
  
  // users list
  ws.onUsers = (users) => {
    const list = document.getElementById('usersList');
    list.innerHTML = '';
    users.forEach(u => {
      const div = document.createElement('div');
      div.textContent = u.name;
      list.appendChild(div);
    });
  };
  
  // when we finish drawing
  canvas.onDrawEnd = (drawing) => {
    // don't add to array yet - wait for server to send it back with ID
    ws.sendDraw(drawing);
  };
  
  // color picker
  document.getElementById('colorPicker').onchange = (e) => {
    canvas.setColor(e.target.value);
  };
  
  // stroke width
  document.getElementById('strokeWidth').oninput = (e) => {
    const w = e.target.value;
    document.getElementById('strokeWidthValue').textContent = w + 'px';
    canvas.setWidth(w);
  };
  
  // undo button
  document.getElementById('undoBtn').onclick = () => {
    if (joined) {
      ws.sendUndo();
    }
  };

  // redo button
  document.getElementById('redoBtn').onclick = () => {
    if (joined) {
      ws.sendRedo();
    }
  };

  // clear button
  document.getElementById('clearBtn').onclick = () => {
    if (joined && confirm('Clear?')) {
      ws.sendClear();
    }
  };
  
  // tool buttons
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      canvas.setTool(btn.dataset.tool);
    };
  });
};
