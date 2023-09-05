document.addEventListener('DOMContentLoaded', function() {
  setInterval(function() {
    let options = {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };

    let horaFormatada = new Date().toLocaleString('pt-BR', options);

    document.getElementById('hora_inicio').value = horaFormatada;
  }, 1000);
});

