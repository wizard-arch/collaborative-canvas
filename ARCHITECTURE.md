# Architecture

This explains how the collaborative canvas works.

## Data Flow

Here's how drawing works:

1. User draws on canvas with mouse
2. Canvas captures the drawing path (all the points)
3. When user finishes drawing, path is sent to server via websocket
4. Server saves the path and sends it to all other connected users
5. Other users receive the path and draw it on their canvas

Simple flow: User → Canvas → WebSocket → Server → Other Users → Their Canvas

## WebSocket Protocol

### Client sends to Server:
- `join` - when user connects (sends name)
- `draw` - when user finishes drawing (sends path data with color, width, tool)
- `clear` - when user wants to clear canvas

### Server sends to Client:
- `allDrawings` - all existing drawings when user first joins
- `newDrawing` - when someone else draws something
- `clear` - when canvas is cleared
- `users` - list of online users

### Drawing Data Structure:
```javascript
{
  path: [{x: 10, y: 20}, {x: 15, y: 25}, ...],  // array of points
  color: '#FF0000',
  width: 5,
  tool: 'brush' or 'eraser',
  id: 1234567890,
  userId: 'socket-id-123'
}
```

## Conflict Resolution

When multiple users draw at the same time:
- Each drawing is saved separately
- Server sends them in order received
- Canvas draws them one after another
- Last one drawn appears on top (normal canvas behavior)
- Works fine for basic use, might get messy with many users

## Performance Decisions

- **Fixed canvas size**: 800x600 - easier to code, no resizing issues
- **Store paths as arrays**: Simple, works for small drawings
- **Send complete path**: One message per stroke instead of many small messages
- **In-memory storage**: Fast but data is lost on restart (didn't have time for database)

## Undo/Redo Strategy

Not implemented. Would need to:
- Keep history of all actions
- Track which user did what
- Handle conflicts when one user undoes another's action
- Too complicated for 3-day project
