const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API de Gestão de Eventos',
    description: 'API RESTful para criar eventos e inscrever participantes.',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  definitions: {
    EventInput: {
      title: 'Workshop de Node.js',
      date: '2026-12-01T19:00:00.000Z',
      capacity: 30,
    },
    RegistrationInput: {
      participantName: 'Maria Silva',
      email: 'maria@email.com',
    },
  },
};

const outputFile = './swagger_output.json';
const routes = ['./eventRoutes.js'];

swaggerAutogen(outputFile, routes, doc);
