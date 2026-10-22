const express = require('express');
const sequelize = require('./database');
require('./models'); // carrega os models e os relacionamentos
const eventRoutes = require('./eventRoutes');

const app = express();
const PORT = 3000;

// Precisa vir ANTES das rotas para o Express conseguir ler o body em JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(eventRoutes);

// Sincroniza os models com o banco e só depois sobe o servidor
sequelize
  .sync()
  .then(() => {
    console.log('Banco de dados sincronizado');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao sincronizar o banco:', err);
  });