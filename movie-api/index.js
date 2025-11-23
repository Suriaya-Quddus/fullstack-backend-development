const express = require('express');
const app = express();
const PORT = 3000;

// NEW: import morgan
const morgan = require('morgan');
// Let Express understand JSON in request bodies
app.use(express.json());

// NEW: log all requests in "dev" format
app.use(morgan('dev'));

// Simple in-memory "database"
let movies = [
  { id: 1, title: "Inception", director: "Christopher Nolan", year: 2010 },
  { id: 2, title: "The Matrix", director: "The Wachowskis", year: 1999 },
  { id: 3, title: "Parasite", director: "Bong Joon-ho", year: 2019 }
];

// ---- Default route (just info page) ----
app.get('/', (req, res) => {
  let items = movies
    .map(m => `<li>${m.title} (${m.year}) - ${m.director} [id:${m.id}]</li>`)
    .join('');
  res.send(`
    <h1>Movie Collection</h1>
    <ul>${items}</ul>
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

// ---- GET /movies - get all movies, with optional filters ----
app.get('/movies', (req, res) => {
  // Read possible filters from query string
  const { title, director, year } = req.query;

  // Start with all movies
  let filtered = movies;

  // Filter by title (if provided)
  if (title) {
    const titleLower = title.toLowerCase();
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(titleLower)
    );
  }

  // Filter by director (if provided)
  if (director) {
    const directorLower = director.toLowerCase();
    filtered = filtered.filter(m =>
      m.director.toLowerCase().includes(directorLower)
    );
  }

  // Filter by year (if provided)
  if (year) {
    const yearNumber = Number(year);
    if (Number.isNaN(yearNumber)) {
      return res.status(400).json({ error: 'year filter must be a number' });
    }
    filtered = filtered.filter(m => m.year === yearNumber);
  }

  // Return the (possibly) filtered list
  res.json(filtered);
});


// ---- GET /movies/:id - get one movie by id ----
app.get('/movies/:id', (req, res) => {
  const id = Number(req.params.id);
  const movie = movies.find(m => m.id === id);

  if (!movie) {
    // Movie not found
    return res.status(404).json({ error: 'Movie not found' });
  }

  res.json(movie);
});

// ---- POST /movies - create a new movie ----
app.post('/movies', (req, res) => {
  const { title, director, year } = req.body;

  // 1) Basic required fields
  if (!title || !director || year === undefined) {
    return res.status(400).json({ error: 'title, director and year are required' });
  }

  // 2) Check year is a number
  const yearNumber = Number(year);
  if (Number.isNaN(yearNumber)) {
    return res.status(400).json({ error: 'year must be a number' });
  }

  // 3) Check year is realistic
  const currentYear = new Date().getFullYear();
  if (yearNumber < 1888 || yearNumber > currentYear + 1) {
    return res.status(400).json({
      error: `year must be between 1888 and ${currentYear + 1}`
    });
  }

  // 4) Create new id
  let nextId;
  if (movies.length === 0) {
    nextId = 1;
  } else {
    nextId = movies[movies.length - 1].id + 1;
  }

  const newMovie = {
    id: nextId,
    title,
    director,
    year: yearNumber
  };

  movies.push(newMovie);

  // 201 = Created
  res.status(201).json(newMovie);
});

// ---- PUT /movies/:id - update existing movie ----
app.put('/movies/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, director, year } = req.body;

  const index = movies.findIndex(m => m.id === id);
  if (index === -1) {
    // Movie not found
    return res.status(404).json({ error: 'Movie not found' });
  }

  // For this exercise, require all three fields when updating
  if (!title || !director || year === undefined) {
    return res.status(400).json({ error: 'title, director and year are required' });
  }

  const yearNumber = Number(year);
  if (Number.isNaN(yearNumber)) {
    return res.status(400).json({ error: 'year must be a number' });
  }

  const currentYear = new Date().getFullYear();
  if (yearNumber < 1888 || yearNumber > currentYear + 1) {
    return res.status(400).json({
      error: `year must be between 1888 and ${currentYear + 1}`
    });
  }

  // Update the movie
  movies[index] = {
    id,
    title,
    director,
    year: yearNumber
  };

  res.json(movies[index]);
});

// ---- DELETE /movies/:id - delete a movie ----
app.delete('/movies/:id', (req, res) => {
  const id = Number(req.params.id);
  const originalLength = movies.length;

  movies = movies.filter(m => m.id !== id);

  if (movies.length === originalLength) {
    // Nothing removed -> id not found
    return res.status(404).json({ error: 'Movie not found' });
  }

  // 204 = No Content
  res.status(204).end();
});

// ---- Catch-all route for unknown paths ----
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ---- Start the server ----
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
