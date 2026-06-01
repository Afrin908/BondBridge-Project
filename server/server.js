const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// NEW ROUTES
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/blocks', require('./routes/blockRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'BondBridge API is running',
    mongo: 'connected',
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'BondBridge API Running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});