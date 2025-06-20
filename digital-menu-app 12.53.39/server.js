const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static('public'));
app.use('/dashboard', express.static('dashboard'));
app.use(express.json());

io.on('connection', (socket) => {
  console.log('Owner or client connected');
});

app.post('/order', (req, res) => {
  const order = req.body;
  io.emit('newOrder', order);
  res.status(200).json({ message: 'Order received' });
});

const PORT = 3000;
http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));