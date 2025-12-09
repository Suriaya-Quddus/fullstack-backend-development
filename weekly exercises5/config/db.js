const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'moviesdb';

let moviesCollection;

async function initDatabase(app, port) {
  await client.connect();
  console.log('Connected to MongoDB');
  const db = client.db(dbName);
  moviesCollection = db.collection('movies');

  const count = await moviesCollection.countDocuments();
  if (count === 0) {
    const initialMovies = [
      { id: 1, title: 'Inception', director: 'Christopher Nolan', year: 2010 },
      { id: 2, title: 'The Matrix', director: 'The Wachowskis', year: 1999 },
      { id: 3, title: 'Parasite', director: 'Bong Joon-ho', year: 2019 }
    ];
    await moviesCollection.insertMany(initialMovies);
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = { initDatabase, getMoviesCollection: () => moviesCollection };
