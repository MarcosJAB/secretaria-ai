/**
 * Utilitários para manipulação de strings
 */

/**
 * Remove acentos de uma string
 * @param {string} str - String a ser processada
 * @returns {string} String sem acentos
 */
const removeAccents = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Converte uma string para slug (para URLs)
 * @param {string} str - String a ser convertida
 * @returns {string} Slug gerado
 */
const slugify = (str) => {
  return removeAccents(str)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífens
    .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
};

/**
 * Capitaliza a primeira letra de cada palavra
 * @param {string} str - String a ser capitalizada
 * @returns {string} String capitalizada
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Trunca uma string para o tamanho máximo especificado
 * @param {string} str - String a ser truncada
 * @param {number} maxLength - Tamanho máximo
 * @param {string} suffix - Sufixo a ser adicionado (padrão: '...')
 * @returns {string} String truncada
 */
const truncate = (str, maxLength, suffix = '...') => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Extrai números de uma string
 * @param {string} str - String a ser processada
 * @returns {string} Apenas os números da string
 */
const extractNumbers = (str) => {
  return str.replace(/\D/g, '');
};

/**
 * Formata um número de telefone brasileiro
 * @param {string} phone - Número de telefone (apenas dígitos)
 * @returns {string} Telefone formatado
 */
const formatPhone = (phone) => {
  const numbers = extractNumbers(phone);
  
  // Verifica se é celular com 9 dígitos ou telefone fixo com 8
  if (numbers.length === 11) {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
  } else if (numbers.length === 10) {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
  }
  
  // Retorna o original se não conseguir formatar
  return phone;
};

/**
 * Formata um CPF
 * @param {string} cpf - CPF (apenas dígitos)
 * @returns {string} CPF formatado
 */
const formatCPF = (cpf) => {
  const numbers = extractNumbers(cpf);
  if (numbers.length !== 11) return cpf;
  
  return `${numbers.substring(0, 3)}.${numbers.substring(3, 6)}.${numbers.substring(6, 9)}-${numbers.substring(9)}`;
};

/**
 * Formata um CNPJ
 * @param {string} cnpj - CNPJ (apenas dígitos)
 * @returns {string} CNPJ formatado
 */
const formatCNPJ = (cnpj) => {
  const numbers = extractNumbers(cnpj);
  if (numbers.length !== 14) return cnpj;
  
  return `${numbers.substring(0, 2)}.${numbers.substring(2, 5)}.${numbers.substring(5, 8)}/${numbers.substring(8, 12)}-${numbers.substring(12)}`;
};

/**
 * Gera um ID único baseado em timestamp e número aleatório
 * @returns {string} ID único
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Sanitiza uma string para evitar injeção de HTML
 * @param {string} str - String a ser sanitizada
 * @returns {string} String sanitizada
 */
const sanitizeHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Verifica se uma string é um email válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} Verdadeiro se for um email válido
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Verifica se uma string é um CPF válido
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} Verdadeiro se for um CPF válido
 */
const isValidCPF = (cpf) => {
  const numbers = extractNumbers(cpf);
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return digit1 === parseInt(numbers.charAt(9)) && digit2 === parseInt(numbers.charAt(10));
};

module.exports = {
  removeAccents,
  slugify,
  capitalize,
  truncate,
  extractNumbers,
  formatPhone,
  formatCPF,
  formatCNPJ,
  generateUniqueId,
  sanitizeHTML,
  isValidEmail,
  isValidCPF
};