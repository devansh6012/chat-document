const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChatHistory = sequelize.define('ChatHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  return ChatHistory;
};