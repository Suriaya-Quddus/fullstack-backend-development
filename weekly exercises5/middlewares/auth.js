const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const token = header.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { username, iat, exp }
    next();             // continue to controller
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
