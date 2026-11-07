const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
const eventRoutes = require('./eventRoutes');

const app = express();

// Precisa vir ANTES das rotas para o Express conseguir ler o body em JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentação interativa (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(eventRoutes);

// Exporta apenas a instância do Express (sem app.listen) para o Supertest
module.exports = app;
