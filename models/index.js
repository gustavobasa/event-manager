const Event = require('./Event');
const Registration = require('./Registration');

// Um Event tem várias Registrations (1:N)
Event.hasMany(Registration, { foreignKey: 'eventId', as: 'registrations' });
Registration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

module.exports = { Event, Registration };