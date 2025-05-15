const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chunk = sequelize.define('Chunk', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    chunk_index: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  return Chunk;
};