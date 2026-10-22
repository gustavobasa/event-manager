const express = require('express');
const router = express.Router();
const sequelize = require('./database');
const { Event, Registration } = require('./models');
const { validateEvent, validateRegistration } = require('./middlewares/validate');

// Criar um novo evento
router.post('/events', validateEvent, async (req, res) => {
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