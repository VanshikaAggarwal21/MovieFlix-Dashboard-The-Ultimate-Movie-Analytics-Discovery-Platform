import React, { useState, useEffect } from 'react';
import { getPaginatedMovies, downloadCSV } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const SORT_OPTIONS = [
  { label: 'Rating ↑', value: 'rating' },
  { label: 'Rating ↓', value: '-rating' },
  { label: 'Year ↑', value: 'year' },
  { label: 'Year ↓', value: '-year' },
];

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username;
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const limit = 7;
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies(page, query, sort, selectedGenres);
    // eslint-disable-next-line
  }, [page, sort, selectedGenres]);

  useEffect(() => {
    getPaginatedMovies({ limit: 1000 })
      .then(data => {
        const genreSet = new Set();
        (data.movies || []).forEach(m => (m.genre || []).forEach(g => genreSet.add(g)));
        setGenres(Array.from(genreSet).sort());
      });
  }, []);

  const fetchMovies = async (pageNum, search = '', sortVal = '', genresArr = []) => {
    setLoading(true);
    setError('');
    try {
      const filter = genresArr.length ? `genre:${genresArr.join(',')}` : '';
      const { movies, total } = await getPaginatedMovies({ search, limit, offset: (pageNum - 1) * limit, sort: sortVal, filter });
      setMovies(movies);
      setTotal(total);
    } catch (err) {
      setError('Failed to fetch movies');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies(1, query, sort, selectedGenres);
  };

  const handleDownloadCSV = async () => {
    try {
      const blob = await downloadCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'movies.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('CSV download failed (are you logged in?)');
    }
  };

  const handleGenreChange = (e) => {
    const value = e.target.value;
    setSelectedGenres(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    );
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <div style={{ maxWidth: 900, margin: '32px auto 0 auto', padding: 16 }}>
        <div className="button-group">
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies by title..."
              style={{ width: 300, padding: 8 }}
            />
            <button type="submit">Search</button>
          </form>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} style={{ padding: 8 }}>
            <option value="">Sort By</option>
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>Filter by Genre:</span>
            {genres.length > 0 ? (
              <select value={selectedGenres[0] || 'NA'} onChange={e => {
                const value = e.target.value;
                if (value === 'NA') {
                  setSelectedGenres([]);
                } else {
                  setSelectedGenres([value]);
                }
                setPage(1);
              }} style={{ minWidth: 120, padding: 8, height: 32 }}>
                <option value="NA">NA</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            ) : (
              <span style={{ color: '#888', fontStyle: 'italic', marginLeft: 8 }}>No genres available</span>
            )}
          </div>
          <button onClick={() => navigate('/stats')}>Movie Stats</button>
          <button onClick={handleDownloadCSV}>Download CSV</button>
        </div>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {movies.map(movie => (
            <div key={movie.imdbID} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 8, width: 200 }}>
              <img src={movie.poster} alt={movie.title} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
              <h3>{movie.title} ({movie.year})</h3>
              <p>Genre: {movie.genre?.join(', ')}</p>
              <p>Rating: {movie.rating || 'N/A'}</p>
              <Link to={`/movie/${movie.imdbID}`}>View Details</Link>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              style={{ padding: 8, background: page === i + 1 ? '#1976d2' : '#eee', color: page === i + 1 ? '#fff' : '#000', border: 'none', borderRadius: 4 }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home; 