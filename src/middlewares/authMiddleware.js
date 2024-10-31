// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({ error: 'Utilisateur non authentifié.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide.' });
    console.log(user); // This should show the token payload with `user_id`
    if (!user.user_id)
      return res
        .status(403)
        .json({ error: 'ID utilisateur manquant dans le token.' });
    req.user = user;
    next();
  });
};

export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }
    next();
  };
};

export default authenticateToken;
