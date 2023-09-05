
// Exemplo de uso:
// const data = "2023-07-21 11:28:41.982918";
// const dataFormatada = formatarDataHora(data);
// console.log(dataFormatada); // Deve imprimir "21/07/2023, 08:28"

function formatarDataHora(data) {
  const origin = new Date(data);
  
  // Defina o fuso horário para o Brasil (BRT - Horário de Brasília)
  const timeZoneOffset = -3; // BRT é UTC-3
  
  // Ajuste o valor da hora para o fuso horário correto
  origin.setHours(origin.getHours() + timeZoneOffset);
  
  const options = { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' };
  const formattedDateTime = origin.toLocaleString('pt-BR', options);

  return formattedDateTime;
}