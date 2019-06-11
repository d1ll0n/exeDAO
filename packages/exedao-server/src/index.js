const startServer = require('./server');

startServer().catch((err) => console.error(err.stack));
