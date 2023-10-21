$(document).ready(function () {

  var newDate = new Date();
  var dateMin = new Date();
  dateMin.setDate(dateMin.getDate() - 3);

  var dateMax = new Date();
  dateMax.setDate(dateMax.getDate() + 1);

  $('#inputData').val(formatDate(newDate));
  $('#inputData').attr('min', formatDate(dateMin));
  $('#inputData').attr('max', formatDate(dateMax));

  function formatDate(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  var loading = `
    <div class="loading-div">
      <i class="fas fa-spinner fa-pulse"></i>
    </div>`;

  $('.content-games').html(loading);

  $(".main-games").on("click", ".header-game, .chevron-game", function (e) {
    if ($(this).parent('.box-games').hasClass('clicked')) {
      $(this).parent('.box-games').find('.chevron-game').removeClass('active');
      $(this).parent('.box-games').removeClass('clicked');
      $(this).parent('.box-games').addClass('hidden');
      $(this).parent('.box-games').find('.main-game').stop().slideUp(500);
    } else {
      let dataDateMyBet = $(this).parent('.box-games').data('datebet');
      let dataMyBet = $(this).parent('.box-games').data('mybet');
      $(this).parent('.box-games').find('.chevron-game').addClass('active');
      $(this).parent('.box-games').addClass('clicked');
      $(this).parent('.box-games').removeClass('hidden');
      $(this).parent('.box-games').find('.main-game').stop().slideDown(500);
      $(this).parent('.main-game').html(loading);
      addBets(this, dataDateMyBet, dataMyBet);
    }
  });

  function view_tr(idGame) {

    axios.get(`./api/game/bet/${idGame}`).then(response => {
      let data = response.data.campo_resposta_game;
      let dataResult = response.data.campo_resposta_resultado;

      $('.btn-view-poule').html(`<i class="far fa-eye"></i>`);
      $('.modal-mybet').addClass('open');
      $('.modal-mybet').removeClass('d-none');

      const dataRealized = luxon.DateTime.fromFormat(data.campo_jogo_data_criacao, 'yyyy-MM-dd HH:mm:ss');
      const dataRun = luxon.DateTime.fromFormat(data.campo_jogo_data, 'yyyy-MM-dd');

      const dataFormatedRealized = dataRealized.toFormat('dd/MM/yyyy HH:mm:ss');
      const dataFormatedRun = dataRun.toFormat('dd/MM/yyyy HH:mm:ss');

      let valueGame = ``;

      if (data.campo_jogo_modalidade == 'Milhar Centena') {
        if (data.campo_jogo_colocacao == '1º ao 5º Prêmio') {
          Hundred = ((data.campo_jogo_valor_aposta * 600) / 2) / 5
        } else {
          Hundred = (data.campo_jogo_valor_aposta * 600) / 2
        }
        newHundred = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Hundred)
        newPrizeHundred = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(data.campo_jogo_possibilidade_de_premiacao)
        newPrize = 'MC: ' + newPrizeHundred + ' / C: ' + newHundred
        valueGame = newPrize;
      } else {
        valueGame = `R$ ${parseFloat(data.campo_jogo_possibilidade_de_premiacao).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2,})}`
      }

      let infoPoule = `
      <blockquote class="poule">
        <h1 class="title-poule">Mega Bicho</h1>
        <hr>
        <div class="date-final">
          <h2>Corre em</h2>
          <span class="date-final">
          ${dataFormatedRun.split(' ')[0]} - ${data.campo_loteria_horario.slice(0, 5)} h
          </span>
        </div>
        <hr>
        <div class="info-user">
          <h2>ID <span class="id-game">#${data.campo_jogo_ident}</span></h2>
          <h2 class="user-name">${data.campo_jogo_nome_usuario}</h2>
          <h2>APOSTA REALIZADA EM</h2>
          <span class="realized">${dataFormatedRealized}</span>
        </div>
        <hr>
        <div class="info-game">
          <h2>TIPO DE JOGO:</h2>
          <span class="modalitie-bet">${data.campo_jogo_modalidade}</span>
          <h2>COLOCAÇÕES:</h2>
          <span class="placement-bets">${data.campo_jogo_colocacao}</span>
          <h2>PALPITE:</h2>
          <span class="guess-bet">${data.campo_jogo_palpite}</span>
          <h2>COTAÇÃO:</h2>
          <span class="quotation-bet">R$${parseFloat(data.campo_jogo_cotacao).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2,})}</span>
          <hr>
          <div class="total-bet">
            <h2>TOTAL: <span class="game-bet">R$ ${parseFloat(data.campo_jogo_valor_aposta).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2,})}</span></h2>
          </div>
          <hr>
          <div class="possible-prize">
            <h2>PRÊMIO POSSÍVEL:</h2>
            <span class="prize">${valueGame}</span>
            <h2>COMBINAÇÕES: <span class="combination">${data.campo_jogo_combinacao}</span></h2>
          </div>
          <hr>
          <h2>RECLAME MÁXIMO 3 DIAS</h2>
          <h3>BOA SORTE!</h3>
        </div>
      </blockquote>
      `;

      let infoResume = `
      <div class="modalitie">
        <h2>Tipo de jogo:</h2>
        <span>${data.campo_jogo_modalidade}</span>
      </div>
      <div class="guess">
        <h2>Palpites:</h2>
        <span>${data.campo_jogo_palpite}</span>
      </div>
      <div class="loterie">
        <h2>Horário:</h2>
        <span>${data.campo_jogo_loteria}</span>
      </div>
      <div class="placements">
        <h2>Colocações</h2>
        <span>${data.campo_jogo_colocacao}</span>
      </div>
      <div class="value-bet">
        <h2>Valor da aposta:</h2>
        <span>R$ ${parseFloat(data.campo_jogo_valor_aposta).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2,})}</span>
      </div>
      `;

      $('.container-poule').html(infoPoule);
      $('.content-resume').html(infoResume);

      if (data.campo_jogo_status == 1) {
        $('.title-resume').html('Resumo');
      } else if (data.campo_jogo_status == 2) {
        $('.title-resume').html('Premiado');
        $('.title-resume').addClass('winner');
        $('.title-resume').removeClass('loser');
      } else if (data.campo_jogo_status == 3) {
        $('.title-resume').html('Não premiado');
        $('.title-resume').addClass('loser');
        $('.title-resume').removeClass('winner');
      }

      if (dataResult) {
        let infoResult = `
        <div id="resultados">
          <div id="resultados-info">
              <p>1°</p>
              <p>${dataResult.campo_resultado_primeira_colocacao} - ${dataResult.campo_resultado_primeiro_grupo}</p>
              <p>${dataResult.campo_resultado_primeiro_animal}</p>
          </div>
          <div id="resultados-info">
              <p>2°</p>
              <p>${dataResult.campo_resultado_segunda_colocacao} - ${dataResult.campo_resultado_segundo_grupo}</p>
              <p>${dataResult.campo_resultado_segundo_animal}</p>
          </div>
          <div id="resultados-info">
              <p>3°</p>
              <p>${dataResult.campo_resultado_terceira_colocacao} - ${dataResult.campo_resultado_terceiro_grupo}</p>
              <p>${dataResult.campo_resultado_terceiro_animal}</p>
          </div>
          <div id="resultados-info">
              <p>4°</p>
              <p>${dataResult.campo_resultado_quarta_colocacao} - ${dataResult.campo_resultado_quarto_grupo}</p>
              <p>${dataResult.campo_resultado_quarto_animal}</p>
          </div>
          <div id="resultados-info">
              <p>5°</p>
              <p>${dataResult.campo_resultado_quinta_colocacao} - ${dataResult.campo_resultado_quinto_grupo}</p>
              <p>${dataResult.campo_resultado_quinto_animal}</p>
          </div>
          <div id="resultados-info">
              <p>6°</p>
              <p>${dataResult.campo_resultado_sexta_colocacao} - ${dataResult.campo_resultado_sexto_grupo}</p>
              <p>${dataResult.campo_resultado_sexto_animal}</p>
          </div>
          <div id="resultados-info">
              <p>7°</p>
              <p>${dataResult.campo_resultado_setima_colocacao} - ${dataResult.campo_resultado_setimo_grupo}</p>
              <p>${dataResult.campo_resultado_setimo_animal}</p>
          </div>
        </div>`;
        $('.container-result').html(infoResult);
      } else {
        $('.container-result').html(`Nenhum resultado, aguarde!`)
      }
    }).catch(error => {
      if (Number(error.response.data.status) === 401) {
          window.location.href = '/';
      }
    });

  }

  $(".main-games").on("click", ".btn-view-poule", function () {
    let idGame = $(this).data('infopoule');
    view_tr(idGame);
    $(this).html(`<i class="fas fa-circle-notch fa-spin"></i>`);
  });

  $('.btn-close-modal').click(function () {
    $('.modal-mybet').removeClass('open');
    $('.modal-mybet').addClass('d-none');
  });



  axios.get(`./api/game/groupslottery`).then(response => {
    let data = response.data
    let selectLotterie = ``;
    for (let i = 0; i < data.length; i++) {
      selectLotterie += `
        <option value="${data[i].campo_grupo_loteria_ident}">${data[i].campo_nome_grupo_loteria.split('-')[1]}</option>
      `;
    }
    $('#filterLoterie').append(selectLotterie);

  }).catch(error => {
    if (Number(error.response.data.status) === 401) {
          window.location.href = '/';
      }
  });

  let dateBet = $('#inputData').val();
  let statusBet = $('#filterStatus').val();
  let LoterieBet = $('#filterLoterie').val();

  historyBets(dateBet, statusBet, LoterieBet);

  function historyBets(dateBet, statusBet, LoterieBet) {
    axios.get(`./api/game/gameslottery/${dateBet}/${statusBet}/${LoterieBet}`).then(response => {
      var data = response.data;
      var boxGame = ``;

      for (let i = 0; i < data.length; i++) {

        // STATUS
        // 1 - AGUARDE;
        // 2 - PREMIADO;
        // 3 - NÃO PREMIADO;
        // 4 - ESTORNADO;
        // 5 - BLOQUEADO.

        let classBox = ``;

        if (data[i].campo_loteria_status_id == 1 || data[i].campo_loteria_status == 'Aguardando') {
          classBox = "wait"
        } else if (data[i].campo_loteria_status_id == 2 || data[i].campo_loteria_status == 'Premiado') {
          classBox = "awarded"
        } else if (data[i].campo_loteria_status_id == 3 || data[i].campo_loteria_status == 'Não premiado') {
          classBox = "not-awarded"
        } else if (data[i].campo_loteria_status_id == 4 || data[i].campo_loteria_status == 'Estornado') {
          classBox = "reversed"
        } else if (data[i].campo_loteria_status_id == 5 || data[i].campo_loteria_status == 'Bloqueado') {
          classBox = "blocked"
        }

        boxGame += `
         <div class="box-games" data-datebet="${data[i].campo_loteria_data}" data-mybet="${data[i].campo_loteria_ident}">
           <div class="header-game" style="flex-direction: column">
             <div style="display: flex;width: 100%;justify-content: space-between;">
               <div>
                 <p class="id-game">TOTAL: <span>R$&nbsp; ${data[i].campo_valor_total_apostado}</span></p>
               </div>
               <div style="text-align: center;">
                 <p class="lottery-game">${data[i].campo_loteria_descricao}</p>
               </div>
               <div style="text-align: end;"><button class="button-award ${classBox}" type="button">${data[i].campo_loteria_status}</button></div>
             </div>
             <div class="header-main-game" style="width: 100%;justify-content: space-between;">
               <div class="modality-game">
                 <p class="title">Modalidade</p>
               </div>
               <div class="numbers-game">
                 <div>
                   <p class="title">Jogo</p>
                 </div>
               </div>

               <div class="view-game">
                 <p class="title" style="margin: 0 15px;">Ver</p>
               </div>
             </div>
           </div>
           <div class="main-game" style="display: none;">

           </div>
           <div class="chevron-game">
             <i class="fas fa-chevron-down"></i>
           </div>
         </div>`;

      }
      if (data.length != 0) {
        $('.content-games').html(boxGame);
      } else {
        $('.content-games').html(`<h1 style="margin: 70px 10px;text-align: center; width: 100%;color: #fff;font-weight: 400;">Você não realizou nenhuma aposta no dia de hoje!</h1>`);
      }
    }).catch(error => {
      if (Number(error.response.data.status) === 401) {
          window.location.href = '/';
      }
    });
  }

  function addBets(thisDiv, dataDateMyBet, dataMyBet) {
    axios.get(`./api/game/betslottery/${dataDateMyBet}/${dataMyBet}`).then(response => {
      var data = response.data;
      let contentsBox = ``;
      let classBox = ``;

      for (let i = 0; i < data.length; i++) {
        if (data[i].campo_jogo_status == 1) {
          classBox = "wait"
        } else if (data[i].campo_jogo_status == 2) {
          classBox = "awarded"
        } else if (data[i].campo_jogo_status == 3) {
          classBox = "not-awarded"
        } else if (data[i].campo_jogo_status == 4) {
          classBox = "reversed"
        } else if (data[i].campo_jogo_status == 5) {
          classBox = "blocked"
        }

        contentsBox += `
        <div class="content-main-game ${classBox}">
          <div class="modality-game">
            <p class="sub-title"> <span class="id-game">${data[i].campo_jogo_modalidade}</span></p>
          </div>
          <div class="numbers-game">
            <div style="text-align: center;">
              <p class="sub-title"><strong>${data[i].campo_jogo_palpite}</strong> - ${data[i].campo_jogo_colocacao}</p>
            </div>
          </div>
          <div class="view-game">
            <div class="view">
              <button type="button" class="eye btn-view-poule" data-infopoule="${data[i].campo_jogo_ident}"><i class="far fa-eye"></i></button>
            </div>
          </div>
        </div>`
      };
      $(thisDiv).siblings('.main-game').html(contentsBox);
    }).catch(error => {
      if (Number(error.response.data.status) === 401) {
          window.location.href = '/';
      }
    })
  }


  $('#inputData').change(function () {
    dateBet = $(this).val();
    historyBets(dateBet, statusBet, LoterieBet);
  });

  $('#filterStatus').change(function () {
    statusBet = $(this).val();
    historyBets(dateBet, statusBet, LoterieBet);
  });

  $('#filterLoterie').change(function () {
    LoterieBet = $(this).val();
    historyBets(dateBet, statusBet, LoterieBet);
  });



});
