const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { validateMovie } = require('../middlewares/validation');
const auth = require('../middlewares/auth'); // new

router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Protected: only logged-in users
router.post('/', auth, validateMovie, movieController.createMovie);
router.put('/:id', auth, validateMovie, movieController.updateMovie);
router.delete('/:id', auth, movieController.deleteMovie);

module.exports = router;
