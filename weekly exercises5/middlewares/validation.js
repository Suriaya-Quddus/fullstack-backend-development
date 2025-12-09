const Joi = require('joi');

const movieSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  director: Joi.string().min(2).max(60).required(),
  year: Joi.number().integer().min(1888).max(new Date().getFullYear() + 1).required()
});

function validateMovie(req, res, next) {
  const { error, value } = movieSchema.validate(req.body, { abortEarly: false });
  if (error) {
    // controller-level business validation
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message)
    });
  }
  req.validatedMovie = value; // optional, for controller
  next();
}

module.exports = { validateMovie };

