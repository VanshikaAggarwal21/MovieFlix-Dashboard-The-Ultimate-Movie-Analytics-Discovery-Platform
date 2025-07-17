const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    await authService.register(username, password);
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const token = await authService.login(username, password);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}; 