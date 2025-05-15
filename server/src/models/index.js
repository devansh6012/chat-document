const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'rag_chatbot',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// Define models
const User = require('./user')(sequelize);
const Document = require('./document')(sequelize);
const Chunk = require('./chunk')(sequelize);
const Embedding = require('./embedding')(sequelize);
const ChatHistory = require('./chatHistory')(sequelize);

// Define associations
User.hasMany(Document);
Document.belongsTo(User, { 
  foreignKey: { 
    allowNull: true  // Allow documents without users
  } 
});

Document.hasMany(Chunk);
Chunk.belongsTo(Document);

Chunk.hasOne(Embedding);
Embedding.belongsTo(Chunk);

User.hasMany(ChatHistory);
ChatHistory.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Document,
  Chunk,
  Embedding,
  ChatHistory
};