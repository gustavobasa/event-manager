const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false, // tire esta linha se quiser ver os SQLs no terminal
});

module.exports = sequelize;