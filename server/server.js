const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const messageRoutes = require('./routes/messageRoutes');
const chatRoutes = require('./routes/chatRoutes');
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
app.use(express.json({ limit: '11mb' }));

// Middleware to add io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware to authenticate socket connections
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

// Socket connection handling
io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.join(socket.user._id.toString());

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const message = new Message({
        sender: socket.user._id,
        recipient: data.recipientId,
        message: data.message || null,
        image: data.image ? Buffer.from(data.image, 'base64') : null,
        imageType: data.imageType || null
      });
      await message.save();

      io.to(data.recipientId).emit('receive_message', {
        _id: message._id,
        sender: socket.user,
        recipient: data.recipientId,
        message: data.message || null,
        image: data.image ? `data:${data.imageType};base64,${data.image}` : null,
        timestamp: message.timestamp,
        seen: message.seen,
        seenAt: message.seenAt, 
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Handle marking messages as seen
  socket.on('messages_seen', async ({ friendId }) => {
    try {
      const messages = await Message.find({
        sender: friendId,
        recipient: socket.user._id,
        seen: false
      });

      const bulkOperations = messages.map(message => ({
        updateOne: {
          filter: { _id: message._id },
          update: {
            seen: true,
            seenAt: message.seenAt || new Date() 
          }
        }
      }));

      if (bulkOperations.length > 0) {
        await Message.bulkWrite(bulkOperations);
      }

      io.to(friendId).emit('messages_seen', { friendId });
    } catch (error) {
      console.error('Error marking messages as seen:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chats', chatRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

server.listen(5000, () => {
  console.log('listening on *:5000');
});
