import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
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

// const authMiddleware = (req, res, next) => {
//   // Exemple : vérifier le token et récupérer l'utilisateur
//   const token = req.headers['authorization'];
//   // Logique pour vérifier le token et récupérer l'utilisateur
//   req.user = { id: userId }; // Assignez l'ID de l'utilisateur
//   next();
// };
