// 📁 server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message'); // ✅ Mongoose model

// 🔁 Load environment variables and connect to DB
dotenv.config();
connectDB();

// 🔁 Initialize Express and create HTTP server
const app = express();
const server = http.createServer(app);

// 🔁 Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // 🔐 Replace with frontend domain in production
    methods: ["GET", "POST"]
  }
});

// 🔁 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// 🔁 API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lost-items', require('./routes/lostItemRoutes'));
app.use('/api/found-items', require('./routes/foundItemRoutes'));
app.use('/api/messages', messageRoutes);

// 🔁 Test route
app.get('/', (req, res) => {
  res.send('Server working 🚀');
});

// ============================
// ✅ SOCKET.IO LOGIC
// ============================
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // ✅ Register user as online
  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} is now online`);
  });

  // ✅ Handle and store messages
  socket.on('sendMessage', async ({ senderId, recipientId, text }) => {
    try {
      // Save message to DB
      const newMessage = await Message.create({
        sender: senderId,
        recipient: recipientId,
        text: text
      });

      // ✅ Populate sender's name from User collection
      const populatedMessage = await newMessage.populate('sender', 'name');

      // ✅ Send to recipient if online
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('getMessage', {
          senderId,
          senderName: populatedMessage.sender.name,
          text,
          timestamp: populatedMessage.createdAt
        });
      }
    } catch (err) {
      console.error("❌ Error saving message:", err.message);
    }
  });

  // ✅ Handle user disconnect
  socket.on('disconnect', () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// 🔁 Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🟢 Server with Socket.IO running on port ${PORT}`);
});
