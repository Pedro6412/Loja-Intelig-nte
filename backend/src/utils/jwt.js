import jwt from 'jsonwebtoken';

export const generateToken = (userId, perfil) => {
  return jwt.sign(
    { userId, perfil },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};
