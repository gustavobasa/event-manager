const sequelize = require('./database');
require('./models'); // carrega os models e os relacionamentos
const app = require('./app');

const PORT = 3000;

// Sincroniza os models com o banco e só depois sobe o servidor
sequelize
  .sync()
  .then(() => {
    console.log('Banco de dados sincronizado');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Documentação em http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Erro ao sincronizar o banco:', err);
  });
