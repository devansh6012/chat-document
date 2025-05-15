const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Embedding = sequelize.define('Embedding', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    embedding: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
      get() {
        const value = this.getDataValue('embedding');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('embedding', JSON.stringify(value));
      }
    }
  });

  return Embedding;
};