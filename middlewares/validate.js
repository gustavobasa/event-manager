const Joi = require('joi');

// Schema para criação de evento
const eventSchema = Joi.object({
  title: Joi.string().required(),
  date: Joi.date().iso().required(),
  capacity: Joi.number().integer().greater(0).required(),
}).required();

// Schema para inscrição de participante
const registrationSchema = Joi.object({
  participantName: Joi.string().required(),
  email: Joi.string().email().required(),
}).required();

// Fábrica de middleware: recebe um schema e devolve o middleware
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: 'Dados inválidos',
        details: error.details.map((d) => d.message),
      });
    }

    req.body = value; // usa os dados já validados/convertidos
    next();
  };
}

module.exports = {
  validateEvent: validate(eventSchema),
  validateRegistration: validate(registrationSchema),
};