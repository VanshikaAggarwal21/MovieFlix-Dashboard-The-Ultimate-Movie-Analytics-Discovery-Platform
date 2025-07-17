const movieService = require('../services/movieService');
const { Parser } = require('json2csv');
const Movie = require('../models/Movie');

exports.searchMovies = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) return res.status(400).json({ error: 'Missing search query' });
    const movies = await movieService.searchMoviesByTitle(search);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await movieService.fetchMovieById(id);
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCache = async (req, res) => {
  try {
    await movieService.clearOldCache();
    res.json({ message: 'Old cache cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await movieService.getMovieStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.paginatedSearch = async (req, res) => {
  try {
    const { search = '', limit = 10, offset = 0, sort = '', filter = '' } = req.query;
    const result = await movieService.searchMovies({ search, limit: parseInt(limit), offset: parseInt(offset), sort, filter });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const movies = await Movie.find();
    const fields = ['imdbID', 'title', 'year', 'genre', 'director', 'actors', 'plot', 'runtime', 'rating'];
    const parser = new Parser({ fields });
    const csv = parser.parse(movies.map(m => ({
      ...m.toObject(),
      genre: m.genre?.join(', '),
      actors: m.actors?.join(', ')
    })));
    res.header('Content-Type', 'text/csv');
    res.attachment('movies.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 