const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { addUser, findUserByUsername } = require('../models/users');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

exports.signup = async (req, res) => {
  const { username, password, name, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  if (findUserByUsername(username)) {
    return res.status(409).json({ error: 'username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10); // like slide demo
  addUser({ username, password: passwordHash, name, email });

  res.status(201).json({ message: 'User created' });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = findUserByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username: user.username },          // payload = user info
    JWT_SECRET,                           // secret from .env
    { expiresIn: JWT_EXPIRES_IN }         // e.g. 1h, like slide
  );

  res.json({ token });
};
