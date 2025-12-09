const { getMoviesCollection } = require('../config/db');

exports.getAllMovies = async (req, res) => {
  const { title, director, year } = req.query;
  const moviesCollection = getMoviesCollection();

  const query = {};
  if (title) query.title = { $regex: title, $options: 'i' };
  if (director) query.director = { $regex: director, $options: 'i' };
  if (year) {
    const yearNumber = Number(year);
    if (Number.isNaN(yearNumber)) {
      return res.status(400).json({ error: 'year filter must be a number' });
    }
    query.year = yearNumber;
  }

  const movies = await moviesCollection.find(query).toArray();
  res.json(movies);
};

exports.getMovieById = async (req, res) => {
  const moviesCollection = getMoviesCollection();
  const id = Number(req.params.id);
  const movie = await moviesCollection.findOne({ id });
  if (!movie) return res.status(404).json({ error: 'Movie not found' });
  res.json(movie);
};

exports.createMovie = async (req, res) => {
  const moviesCollection = getMoviesCollection();
  const { title, director, year } = req.validatedMovie;

  const lastMovie = await moviesCollection.find().sort({ id: -1 }).limit(1).toArray();
  const nextId = lastMovie.length ? lastMovie[0].id + 1 : 1;

  const newMovie = { id: nextId, title, director, year };
  await moviesCollection.insertOne(newMovie);
  res.status(201).json(newMovie);
};

exports.updateMovie = async (req, res) => {
  const moviesCollection = getMoviesCollection();
  const id = Number(req.params.id);
  const existing = await moviesCollection.findOne({ id });
  if (!existing) return res.status(404).json({ error: 'Movie not found' });

  const { title, director, year } = req.validatedMovie;

  await moviesCollection.updateOne({ id }, { $set: { title, director, year } });
  const updated = await moviesCollection.findOne({ id });
  res.json(updated);
};


exports.deleteMovie = async (req, res) => {
  const moviesCollection = getMoviesCollection();
  const id = Number(req.params.id);
  const result = await moviesCollection.deleteOne({ id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.status(204).end();
};
