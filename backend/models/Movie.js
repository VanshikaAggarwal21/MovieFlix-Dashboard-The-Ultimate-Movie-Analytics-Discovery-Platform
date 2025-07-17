const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  imdbID: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  year: Number,
  genre: [String],
  director: String,
  actors: [String],
  plot: String,
  poster: String,
  runtime: Number,
  rating: Number,
  cachedAt: { type: Date, default: Date.now },
  raw: { type: mongoose.Schema.Types.Mixed },
});

module.exports = mongoose.model('Movie', MovieSchema); 