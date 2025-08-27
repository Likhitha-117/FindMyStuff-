// 📁 server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const LostItem = require('./models/LostItem');     // Add your item models
const FoundItem = require('./models/FoundItem');
const jwt = require('jsonwebtoken');

// 🔁 Load environment variables and connect to DB
dotenv.config();
connectDB();

// 🔁 Initialize Express
const app = express();
const server = http.createServer(app);

// 🔁 Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔁 API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lost-items', require('./routes/lostItemRoutes'));
app.use('/api/found-items', require('./routes/foundItemRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// 🔁 Test route
app.get('/', (req, res) => {
  res.send('Server working 🚀');
});

// ============================
// ✅ SOCKET.IO LOGIC
// ============================
const onlineUsers = new Map();

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ JWT Middleware for Socket.IO
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.userId} (${socket.id})`);
  onlineUsers.set(socket.userId, socket.id);

  // ✅ Handle sending messages
  socket.on('sendMessage', async ({ itemId, text, type }) => {
    try {
      // Determine item type and fetch owner
      let item;
      if (type === 'lost') {
        item = await LostItem.findById(itemId);
      } else if (type === 'found') {
        item = await FoundItem.findById(itemId);
      }

      if (!item) {
        return socket.emit('messageSent', { success: false, error: 'Item not found' });
      }

      const recipientId = item.user.toString(); // Owner of the item

      const newMessage = await Message.create({
        sender: socket.userId,
        recipient: recipientId,
        text
      });

      const populatedMessage = await newMessage.populate('sender', 'name');

      // Send to recipient if online
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('getMessage', {
          senderId: socket.userId,
          senderName: populatedMessage.sender.name,
          text,
          timestamp: populatedMessage.createdAt
        });
      }

      // Acknowledge sender
      socket.emit('messageSent', { success: true, messageId: newMessage._id });

    } catch (err) {
      console.error("❌ Error saving message:", err.message);
      socket.emit('messageSent', { success: false });
    }
  });

  // ✅ Handle disconnect
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId);
    console.log(`❌ User disconnected: ${socket.userId}`);
  });
});

// 🔁 Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🟢 Server with Socket.IO running on port ${PORT}`);
});
