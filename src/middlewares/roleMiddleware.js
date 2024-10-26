export const checkRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res
      .status(403)
      .json({ error: 'Accès refusé. Vous n\'êtes pas autorisé.' });
  }
  next();
};
