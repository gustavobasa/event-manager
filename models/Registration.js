const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Registration = sequelize.define('Registration', {
  participantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // o campo eventId é criado automaticamente pelo relacionamento (index.js)
});

module.exports = Registration;