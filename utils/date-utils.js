/**
 * Utilitários para manipulação de datas
 */

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada
 */
const formatDateBR = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data e hora para o formato brasileiro (DD/MM/YYYY HH:MM)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data e hora formatadas
 */
const formatDateTimeBR = (date) => {
  const d = new Date(date);
  return d.toLocaleString('pt-BR');
};

/**
 * Converte uma data para o formato ISO 8601 (YYYY-MM-DDTHH:MM:SS.sssZ)
 * @param {Date|string} date - Data a ser convertida
 * @returns {string} Data no formato ISO
 */
const toISOString = (date) => {
  const d = new Date(date);
  return d.toISOString();
};

/**
 * Adiciona dias a uma data
 * @param {Date|string} date - Data base
 * @param {number} days - Número de dias a adicionar
 * @returns {Date} Nova data
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Verifica se uma data é hoje
 * @param {Date|string} date - Data a verificar
 * @returns {boolean} Verdadeiro se a data for hoje
 */
const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
};

/**
 * Verifica se uma data está no futuro
 * @param {Date|string} date - Data a verificar
 * @returns {boolean} Verdadeiro se a data estiver no futuro
 */
const isFuture = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

/**
 * Calcula a diferença em dias entre duas datas
 * @param {Date|string} date1 - Primeira data
 * @param {Date|string} date2 - Segunda data
 * @returns {number} Diferença em dias
 */
const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Extrai data e hora de uma string de texto em linguagem natural
 * @param {string} text - Texto contendo informações de data/hora
 * @returns {Object|null} Objeto com data e hora ou null se não encontrado
 */
const extractDateTimeFromText = (text) => {
  // Implementação básica para extrair datas de texto em português
  // Em uma implementação real, seria usado um parser mais robusto
  
  // Padrões comuns de data em português
  const patterns = [
    // DD/MM/YYYY
    {
      regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g,
      parse: (match) => {
        const [_, day, month, year] = match;
        return new Date(year, month - 1, day);
      }
    },
    // DD de MÊS de YYYY
    {
      regex: /(\d{1,2}) de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro) de (\d{4})/gi,
      parse: (match) => {
        const [_, day, monthName, year] = match;
        const months = {
          janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5,
          julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
        };
        return new Date(parseInt(year), months[monthName.toLowerCase()], parseInt(day));
      }
    },
    // Hoje, amanhã, etc.
    {
      regex: /(hoje|amanhã|depois de amanhã)/gi,
      parse: (match) => {
        const [_, term] = match;
        const today = new Date();
        switch (term.toLowerCase()) {
          case 'hoje': return today;
          case 'amanhã': return addDays(today, 1);
          case 'depois de amanhã': return addDays(today, 2);
          default: return null;
        }
      }
    }
  ];
  
  // Tentar encontrar uma data no texto
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern.regex);
    for (const match of matches) {
      const date = pattern.parse(match);
      if (date) {
        // Tentar extrair hora (formato HH:MM)
        const timeMatch = text.match(/(\d{1,2}):(\d{2})(\s*[ap]m)?/i);
        if (timeMatch) {
          let [_, hours, minutes, ampm] = timeMatch;
          hours = parseInt(hours);
          minutes = parseInt(minutes);
          
          // Ajustar para formato 24h se necessário
          if (ampm && ampm.toLowerCase().includes('p') && hours < 12) {
            hours += 12;
          } else if (ampm && ampm.toLowerCase().includes('a') && hours === 12) {
            hours = 0;
          }
          
          date.setHours(hours, minutes);
        }
        
        return {
          date,
          isoString: date.toISOString(),
          formattedDate: formatDateBR(date),
          formattedDateTime: formatDateTimeBR(date)
        };
      }
    }
  }
  
  return null;
};

module.exports = {
  formatDateBR,
  formatDateTimeBR,
  toISOString,
  addDays,
  isToday,
  isFuture,
  daysDifference,
  extractDateTimeFromText
};