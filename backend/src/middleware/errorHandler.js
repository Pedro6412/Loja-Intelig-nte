export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({ error: 'Dados invalidos enviados para a API' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Token invalido' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Registro ja existe' });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'Referencia invalida para relacionamento' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro nao encontrado' });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message || 'Erro na requisicao' });
  }

  if (err.message && err.message.toLowerCase().includes('nao encontrado')) {
    return res.status(404).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Erro interno do servidor' });
};
