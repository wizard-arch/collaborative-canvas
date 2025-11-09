# Collaborative Canvas

A simple drawing app where multiple people can draw together on the same canvas in real-time.

## Setup Instructions

1. Make sure you have Node.js installed

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and go to:
```
http://localhost:3000
```

## How to Test with Multiple Users

1. Start the server (follow setup instructions above)

2. Open `http://localhost:3000` in multiple browser windows or tabs

3. Each window will auto-join with a random name

4. Start drawing in one window - you should see it appear in the other windows in real-time!

5. Try different colors and brush sizes

6. Test the eraser tool

## Known Limitations

- Canvas size is fixed at 800x600 pixels
- All drawings are lost when the server restarts (stored in memory only)
- Might lag if too many users are drawing at the same time

## Time Spent

Worked on this for about 3 days. Most time was spent figuring out how websockets work and getting the canvas coordinates right.

## References

- MDN Canvas API documentation: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Socket.io documentation: https://socket.io/docs/v4/
- Express.js documentation: https://expressjs.com/
- Canvas drawing tutorial: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial
- WebSocket basics: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
