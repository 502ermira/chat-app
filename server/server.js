const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error('User not found'));
    }
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('send_message', async (data) => {
    console.log('message: ', data);
    try {
      const message = new Message({
        sender: socket.user._id,
        recipient: data.recipientId,
        message: data.message,
      });
      await message.save();
      io.to(data.recipientId).emit('receive_message', {
        sender: socket.user.username,
        message: data.message,
        timestamp: message.createdAt,
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

server.listen(5000, () => {
  console.log('listening on *:5000');
});
