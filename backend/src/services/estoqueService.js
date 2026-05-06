import { estoqueRepository } from '../repositories/estoqueRepository.js';

export const estoqueService = {
  getAll: async () => estoqueRepository.findAll(),
  getByProduto: async (produtoId) => estoqueRepository.findByProduto(produtoId),
  registrarEntrada: async (produtoId, quantidade, motivo, usuarioId = null) => estoqueRepository.registrarMovimentacao(produtoId, 'entrada', quantidade, motivo || 'Entrada manual', null, usuarioId),
  registrarSaida: async (produtoId, quantidade, motivo, usuarioId = null) => estoqueRepository.registrarMovimentacao(produtoId, 'saida', quantidade, motivo || 'Saída manual', null, usuarioId),
  ajustarEstoque: async (produtoId, novaQuantidade, motivo, usuarioId = null) => estoqueRepository.registrarMovimentacao(produtoId, 'ajuste', novaQuantidade, motivo || 'Ajuste manual', null, usuarioId)
};
