const request = require('supertest');

// Isolamento do banco: nenhum acesso ao SQLite real nos testes
jest.mock('./database', () => ({
  literal: jest.fn(),
  sync: jest.fn(),
}));

jest.mock('./models', () => ({
  Event: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Registration: {
    count: jest.fn(),
    create: jest.fn(),
  },
}));

const app = require('./app');
const { Event, Registration } = require('./models');

describe('API de Eventos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('GET /events', () => {
    it('deve listar os eventos e retornar status 200', async () => {
      // Arrange
      const eventos = [
        { id: 1, title: 'Workshop de Node.js', capacity: 30, registrationsCount: 5 },
      ];
      Event.findAll.mockResolvedValue(eventos);

      // Act
      const response = await request(app).get('/events');

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(eventos);
      expect(Event.findAll).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 500 quando o banco falhar', async () => {
      // Arrange
      Event.findAll.mockRejectedValue(new Error('falha no banco'));

      // Act
      const response = await request(app).get('/events');

      // Assert
      expect(response.statusCode).toBe(500);
    });
  });

  describe('POST /events', () => {
    it('deve criar um evento e retornar status 201', async () => {
      // Arrange
      const novoEvento = {
        title: 'Workshop de Node.js',
        date: '2026-12-01T19:00:00.000Z',
        capacity: 30,
      };
      Event.create.mockResolvedValue({ id: 1, ...novoEvento });

      // Act
      const response = await request(app).post('/events').send(novoEvento);

      // Assert
      expect(response.statusCode).toBe(201);
      expect(response.body).toMatchObject({ id: 1, title: 'Workshop de Node.js' });
      expect(Event.create).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 400 quando os dados forem inválidos', async () => {
      // Arrange
      const eventoInvalido = { title: 'Sem data nem capacidade' };

      // Act
      const response = await request(app).post('/events').send(eventoInvalido);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(Event.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /events/:id/register', () => {
    const participante = { participantName: 'Maria Silva', email: 'maria@email.com' };

    it('deve barrar a inscrição e retornar 403 quando o evento estiver lotado', async () => {
      // Arrange: evento com capacidade 2 que já tem 2 inscritos
      Event.findByPk.mockResolvedValue({ id: 1, title: 'Workshop', capacity: 2 });
      Registration.count.mockResolvedValue(2);

      // Act
      const response = await request(app).post('/events/1/register').send(participante);

      // Assert
      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe('Evento lotado');
      expect(Registration.create).not.toHaveBeenCalled();
    });

    it('deve inscrever o participante e retornar 201 quando houver vaga', async () => {
      // Arrange
      Event.findByPk.mockResolvedValue({ id: 1, title: 'Workshop', capacity: 2 });
      Registration.count.mockResolvedValue(1);
      Registration.create.mockResolvedValue({ id: 10, ...participante, eventId: 1 });

      // Act
      const response = await request(app).post('/events/1/register').send(participante);

      // Assert
      expect(response.statusCode).toBe(201);
      expect(Registration.create).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 404 quando o evento não existir', async () => {
      // Arrange
      Event.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).post('/events/999/register').send(participante);

      // Assert
      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api-docs', () => {
    it('deve servir o painel do Swagger', async () => {
      // Act
      const response = await request(app).get('/api-docs/');

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('swagger-ui');
    });
  });
});
