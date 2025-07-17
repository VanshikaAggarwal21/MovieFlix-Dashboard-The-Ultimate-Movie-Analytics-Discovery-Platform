import React, { useEffect, useState } from 'react';
import { getStats, downloadCSV } from '../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to fetch stats');
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!stats) return <p>No stats available.</p>;

  const handleDownload = async () => {
    const blob = await downloadCSV();
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'movies.csv');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  
  const genreLabels = Object.keys(stats.genreCount);
  const genreData = Object.values(stats.genreCount);
  const runtimeLabels = stats.avgRuntimeByYear.map(x => x.year);
  const runtimeData = stats.avgRuntimeByYear.map(x => x.avgRuntime);

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 16 }}>
      <h2>Stats Dashboard</h2>
      <button onClick={handleDownload} style={{ marginBottom: 16 }}>Download Movies as CSV</button>
      <div style={{ marginBottom: 32 }}>
        <h4>Genres Distribution</h4>
        <Pie data={{
          labels: genreLabels,
          datasets: [{ data: genreData, backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#B2FF66', '#FF66B2', '#66B2FF'
          ] }],
        }} />
      </div>
      <div style={{ marginBottom: 32 }}>
        <h4>Average Ratings</h4>
        <Bar data={{
          labels: ['Average Rating'],
          datasets: [{ label: 'Rating', data: [stats.avgRating], backgroundColor: '#36A2EB' }],
        }} options={{ scales: { y: { min: 0, max: 10 } } }} />
      </div>
      <div>
        <h4>Average Runtime by Year</h4>
        <Line data={{
          labels: runtimeLabels,
          datasets: [{ label: 'Avg Runtime (min)', data: runtimeData, borderColor: '#FF6384', backgroundColor: '#FFB1C1' }],
        }} />
      </div>
    </div>
  );
}

export default Stats; 