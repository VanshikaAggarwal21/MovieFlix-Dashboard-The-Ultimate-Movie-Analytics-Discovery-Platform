import React, { useEffect, useState } from 'react';
import { getMovieById } from '../services/api';
import { useParams } from 'react-router-dom';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMovie() {
      try {
        const data = await getMovieById(id);
        setMovie(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch movie');
      }
      setLoading(false);
    }
    fetchMovie();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!movie) return <p>Movie not found.</p>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 16 }}>
      <h2>{movie.title} ({movie.year})</h2>
      <img src={movie.poster} alt={movie.title} style={{ width: 300, height: 450, objectFit: 'cover' }} />
      <p><strong>Genre:</strong> {movie.genre?.join(', ')}</p>
      <p><strong>Director:</strong> {movie.director}</p>
      <p><strong>Actors:</strong> {movie.actors?.join(', ')}</p>
      <p><strong>Plot:</strong> {movie.plot}</p>
      <p><strong>Runtime:</strong> {movie.runtime} min</p>
      <p><strong>Rating:</strong> {movie.rating || 'N/A'}</p>
    </div>
  );
}

export default MovieDetails; 