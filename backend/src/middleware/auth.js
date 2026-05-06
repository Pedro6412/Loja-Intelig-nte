import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userPerfil = decoded.perfil;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.userPerfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

export const gerenteAdminMiddleware = (req, res, next) => {
  if (req.userPerfil !== 'admin' && req.userPerfil !== 'gerente') {
    return res.status(403).json({ error: 'Acesso negado. Apenas gerentes ou administradores.' });
  }
  next();
};
