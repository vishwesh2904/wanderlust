const User = require('../models/user');
const { signToken, setTokenCookie, clearTokenCookie } = require('../utils/jwt');

module.exports.signup = async (req, res, _next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username, role: 'guest' });
    const registeredUser = await User.register(newUser, password);
    const token = signToken(registeredUser);
    setTokenCookie(res, token);
    res.status(201).json({
      user: {
        id: registeredUser._id,
        username: registeredUser.username,
        email: registeredUser.email,
        role: registeredUser.role,
      },
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

module.exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const { user } = await User.authenticate()(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = signToken(user);
    setTokenCookie(res, token);
    res.json({
      message: 'Welcome to RoamNest!',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ message: 'You are logged out!' });
};

module.exports.getMe = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ user: null });
    }
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET);
    const user = await User.findById(decoded.id).select('username email role');
    if (!user) {
      return res.status(401).json({ user: null });
    }
    res.json({
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch {
    res.status(401).json({ user: null });
  }
};

module.exports.upgradeToHost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'host') {
      return res.status(400).json({ error: 'You are already a Host' });
    }
    user.role = 'host';
    await user.save();
    const token = signToken(user);
    setTokenCookie(res, token);
    res.json({
      message: 'Congratulations! You are now a Host.',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
