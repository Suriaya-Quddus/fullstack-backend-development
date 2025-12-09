// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const { initDatabase } = require('./config/db');
const moviesRouter = require('./routes/movies');
const authRouter = require('./routes/auth');

const app = express();
const PORT = 3000;

// Global middlewares
app.use(express.json());
app.use(morgan('dev'));

// Default info page
app.get('/', (req, res) => {
  res.send(`
    <h1>Movie Collection (MongoDB)</h1>
    <p>Try these endpoints:</p>
    <pre>
GET /movies
GET /movies/1
POST /movies   (JSON body)
PUT /movies/1  (JSON body)
DELETE /movies/1
    </pre>
  `);
});

// Use modular routes
app.use('/movies', moviesRouter);
app.use('/auth', authRouter);

// Catch-all route for unknown paths
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start DB + server (DB logic in config/db.js)
initDatabase(app, PORT);
