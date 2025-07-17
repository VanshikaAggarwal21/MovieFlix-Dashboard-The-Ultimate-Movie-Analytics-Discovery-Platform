const axios = require('axios');
const Movie = require('../models/Movie');

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const CACHE_TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS || '24', 10);

function parseOMDbMovie(data) {
  return {
    imdbID: data.imdbID,
    title: data.Title,
    year: data.Year ? parseInt(data.Year) : null,
    genre: data.Genre ? data.Genre.split(',').map(g => g.trim()) : [],
    director: data.Director,
    actors: data.Actors ? data.Actors.split(',').map(a => a.trim()) : [],
    plot: data.Plot,
    poster: data.Poster,
    runtime: data.Runtime ? parseInt(data.Runtime) : null,
    rating: data.imdbRating ? parseFloat(data.imdbRating) : null,
    raw: data,
  };
}

async function fetchMovieById(imdbID) {

  let movie = await Movie.findOne({ imdbID });
  if (movie && Date.now() - movie.cachedAt.getTime() < CACHE_TTL_HOURS * 3600 * 1000) {
    return movie;
  }

  const url = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}`;
  const { data } = await axios.get(url);
  if (data.Response === 'False') throw new Error(data.Error);
  const parsed = parseOMDbMovie(data);
  movie = await Movie.findOneAndUpdate(
    { imdbID },
    { ...parsed, cachedAt: new Date() },
    { upsert: true, new: true }
  );
  return movie;
}

async function searchMoviesByTitle(title) {
  
  const url = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(title)}`;
  const { data } = await axios.get(url);
  if (data.Response === 'False') throw new Error(data.Error);
 
  const movies = await Promise.all(
    data.Search.map(async (item) => {
      try {
        return await fetchMovieById(item.imdbID);
      } catch (e) {
        return null;
      }
    })
  );
  return movies.filter(Boolean);
}

async function searchMovies({ search, limit = 10, offset = 0, sort = '', filter = '' }) {
  const query = search ? { title: new RegExp(search, 'i') } : {};

  if (filter && filter.startsWith('genre:')) {
    const genres = filter.replace('genre:', '').split(',').map(g => g.trim()).filter(Boolean);
    if (genres.length > 0) {
      query.genre = { $in: genres };
    }
  }
 
  let sortObj = {};
  if (sort) {
    
    const dir = sort.startsWith('-') ? -1 : 1;
    const field = sort.replace(/^-/, '');
    sortObj[field] = dir;
  }
  let movies = await Movie.find(query).sort(sortObj).skip(offset).limit(limit);
  let total = await Movie.countDocuments(query);
  if (movies.length === 0 && search) {
    await searchMoviesByTitle(search);
    movies = await Movie.find(query).sort(sortObj).skip(offset).limit(limit);
    total = await Movie.countDocuments(query);
  }
  return { movies, total };
}

async function clearOldCache() {
  const expiry = new Date(Date.now() - CACHE_TTL_HOURS * 3600 * 1000);
  await Movie.deleteMany({ cachedAt: { $lt: expiry } });
}

async function getMovieStats() {
  const movies = await Movie.find();
  
  const genreCount = {};
  let totalRating = 0, ratingCount = 0;
  const runtimeByYear = {};
  movies.forEach(movie => {
   
    (movie.genre || []).forEach(g => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  
    if (typeof movie.rating === 'number') {
      totalRating += movie.rating;
      ratingCount++;
    }
  
    if (movie.year && typeof movie.runtime === 'number') {
      if (!runtimeByYear[movie.year]) runtimeByYear[movie.year] = { total: 0, count: 0 };
      runtimeByYear[movie.year].total += movie.runtime;
      runtimeByYear[movie.year].count++;
    }
  });
  const avgRating = ratingCount ? (totalRating / ratingCount) : null;
  const avgRuntimeByYear = Object.entries(runtimeByYear).map(([year, { total, count }]) => ({
    year,
    avgRuntime: total / count
  }));
  return {
    genreCount,
    avgRating,
    avgRuntimeByYear
  };
}

module.exports = {
  fetchMovieById,
  searchMoviesByTitle,
  clearOldCache,
  getMovieStats,
  searchMovies,
}; 