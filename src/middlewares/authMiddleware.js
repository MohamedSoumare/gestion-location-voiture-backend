import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Stores user info in req.user for subsequent routes
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
  }
  next();
};
