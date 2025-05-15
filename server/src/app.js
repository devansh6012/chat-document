const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { sequelize, User } = require('./models');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const chatRoutes = require('./routes/chat');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// Database initialization and seed data
const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    
    // Force true will drop tables if they exist
    await sequelize.sync({ force: true });
    console.log('Database synced with force: true');
    
    // Create a default user
    await User.findOrCreate({
      where: { id: 1 },
      defaults: {
        username: 'default_user',
        password: 'password123' // In production, this should be hashed
      }
    });
    console.log('Default user created');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

initDb();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;