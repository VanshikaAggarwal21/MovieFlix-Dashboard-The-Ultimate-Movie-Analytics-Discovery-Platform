const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../utils/authMiddleware');

// Search movies by title
router.get('/movies', movieController.searchMovies);
// Get movie by ID
router.get('/movies/:id', movieController.getMovieById);
// Clear old cache (admin only)
router.delete('/cache', authMiddleware, movieController.clearCache);
// Movie stats (genre distribution, avg rating, avg runtime by year)
router.get('/stats', authMiddleware, movieController.getStats);
// Paginated search from DB
router.get('/movies-paginated', movieController.paginatedSearch);
// Export movies as CSV
router.get('/movies-csv', authMiddleware, movieController.exportCSV);

module.exports = router;
