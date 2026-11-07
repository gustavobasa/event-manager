const express = require('express');
const router = express.Router();
const sequelize = require('./database');
const { Event, Registration } = require('./models');
const { validateEvent, validateRegistration } = require('./middlewares/validate');

// Criar um novo evento
router.post('/events', validateEvent, async (req, res) => {
  /*
    #swagger.tags = ['Eventos']
    #swagger.description = 'Cria um novo evento.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dados do evento a ser criado.',
      required: true,
      schema: { $ref: '#/definitions/EventInput' }
    }
    #swagger.responses[201] = { description: 'Evento criado com sucesso.' }
    #swagger.responses[400] = { description: 'Dados inválidos.' }
    #swagger.responses[500] = { description: 'Erro interno ao criar o evento.' }
  */
  try {
    const { title, date, capacity } = req.body;
    const event = await Event.create({ title, date, capacity });
    return res.status(201).json(event);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao criar o evento' });
  }
});

// Listar eventos com a contagem de inscrições atuais
router.get('/events', async (req, res) => {
  /*
    #swagger.tags = ['Eventos']
    #swagger.description = 'Lista todos os eventos com a contagem de inscrições atuais.'
    #swagger.responses[200] = { description: 'Lista de eventos.' }
    #swagger.responses[500] = { description: 'Erro interno ao listar os eventos.' }
  */
  try {
    const events = await Event.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM Registrations WHERE Registrations.eventId = Event.id)'
            ),
            'registrationsCount',
          ],
        ],
      },
    });
    return res.json(events);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao listar os eventos' });
  }
});

// Registrar um participante em um evento
router.post('/events/:id/register', validateRegistration, async (req, res) => {
  /*
    #swagger.tags = ['Inscrições']
    #swagger.description = 'Inscreve um participante em um evento, respeitando a capacidade máxima.'
    #swagger.parameters['id'] = { in: 'path', description: 'ID do evento.', required: true, type: 'integer' }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Dados do participante.',
      required: true,
      schema: { $ref: '#/definitions/RegistrationInput' }
    }
    #swagger.responses[201] = { description: 'Inscrição realizada com sucesso.' }
    #swagger.responses[400] = { description: 'Dados inválidos.' }
    #swagger.responses[403] = { description: 'Evento lotado.' }
    #swagger.responses[404] = { description: 'Evento não encontrado.' }
    #swagger.responses[500] = { description: 'Erro interno ao registrar participante.' }
  */
  try {
    // a. Busca o evento pelo ID
    const event = await Event.findByPk(req.params.id);

    // b. Evento não existe
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    // c. Conta as inscrições existentes
    const registrationsCount = await Registration.count({
      where: { eventId: event.id },
    });

    // d. Evento lotado
    if (registrationsCount >= event.capacity) {
      return res.status(403).json({ message: 'Evento lotado' });
    }

    // e. Há vaga: cria a inscrição
    const { participantName, email } = req.body;
    const registration = await Registration.create({
      participantName,
      email,
      eventId: event.id,
    });

    return res.status(201).json(registration);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao registrar participante' });
  }
});

module.exports = router;