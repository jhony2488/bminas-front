$(document).ready(function () {

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  $('#footerIndex').load('./layout/footer.html')

  $('#userLogin').on('keydown', function (e) {
    if (e.which === 13) {
      if ($(this).val()) {
        if (!$('#passwordLogin').val()) {
          $('#passwordLogin').focus()
        } else {
          $('#btnLogin').trigger('click');
        }
      }

    }
  });

  $('#passwordLogin').on('keydown', function (e) {
    if (e.which === 13) {
      if ($(this).val()) {
        if (!$('#userLogin').val()) {
          $('#userLogin').focus()
        } else {
          $('#btnLogin').trigger('click');
        }
      }
    }
  });

  function getDadaUsers() {
    $('.content-buttons-home').html(`<i style="color: #fff; font-size: 1.5rem" class="fas fa-spinner fa-pulse"></i>`);
    axios
      .get('/api/users/')
      .then(response => {
        $('.content-buttons-home').html(`<a href="/jogar" class="btn btn-bet"><i class="fas fa-dice"></i> Apostar</a> <a href="#" id="logoutUser" title="Sair"><i class="fas fa-sign-out-alt"></i> Sair</a>`);
      })
      .catch(error => {
        $('.content-buttons-home').html(`<button class="btn btn-login">Entrar</button><a href="/cadastrar" class="btn btn-register">Criar conta</a></div>`);
      });
  }

  getDadaUsers();

  $('button.btn-want-bet').click(function () {
    axios
    .get('/api/users/')
    .then(response => {
      window.location = '/jogar'
    })
    .catch(error => {
      Toast.fire({
        icon: 'error',
        title: 'Você precisa estar logado!'
      })
    });
  });

  $(document).on("click", "#logoutUser", function () {
    axios
      .get('/api/users/logout')
      .then(response => {
        window.location.href = '/';
      })
      .catch(error => {
        if (Number(error.response.data.status) === 401) {
          window.location.href = '/';
        }
      })
  });

  $('.loading-screen').fadeOut(850, function () {
    $('.loader, .content-logo').fadeOut(500);
  });

  $('#userLogin').focus(function () {
    $('#labelTextUser').addClass('active');
  });

  $('#userLogin').blur(function () {
    $('#labelTextUser').removeClass('active');
  });

  $('#passwordLogin').focus(function () {
    $('#labelTextPassword').addClass('active');
    $('.icon-lock').addClass('fa-unlock-alt').removeClass('fa-lock');
    $('.password-icon').removeClass('d-none');
  });

  $('#passwordLogin').blur(function () {
    $('#labelTextPassword').removeClass('active');
    $('.icon-lock').removeClass('fa-unlock-alt').addClass('fa-lock');
  });

  $('.password-icon').click(function () {
    $('.icon-eye').toggleClass('fa-eye fa-eye-slash');
    var passwordFieldType =
      $('#passwordLogin').attr('type') === 'password' ? 'text' : 'password';
    $('#passwordLogin').attr('type', passwordFieldType);
  });

  $('#rememberLogin').on('change', function () {
    $('.label-remember').addClass('animate-text');
    setTimeout(() => {
      $('.label-remember').removeClass('animate-text');
    }, 300);
  });

  $(document).on('click', '.btn-login', function () {
    $('.modal-login').removeClass('d-none');
    setTimeout(() => {
      $('.modal-login').addClass('open');
    }, 1);
  });

  $('.btn-close-modal').click(function () {
    $('.modal-login').removeClass('open');
    setTimeout(() => {
      $('.modal-login').addClass('d-none');
    }, 500);
  });

  $('#btnLogin').click(function (e) {
    e.preventDefault();

    $('#btnLogin').html(`<i class="fas fa-spinner fa-spin"></i>`);
    $('#btnLogin').prop('disabled', true);

    var inputUser = $('#userLogin').val();
    var inputPassword = $('#passwordLogin').val();

    if (inputUser === '' || inputPassword === '') {
      $('.alert-login').addClass('active-error');
      $('.line-error').html('Por favor, preencha todos os campos');
      $('#btnLogin').html(`Entrar`);
      $('#btnLogin').prop('disabled', false);
      return;
    }

    axios
      .post('/api/users/login', {
        campo_nome_usuario: $('#userLogin').val(),
        campo_senha: $('#passwordLogin').val(),
        campo_relembrar: $('#rememberLogin').is(':checked') ? true : false,
      })
      .then(response => {
        window.location.href = '/jogar';
      })
      .catch(error => {
        $('.alert-login').addClass('active-error');
        $('.line-error').html(`${error.response.data.message}`);
        $('#btnLogin').html(`Entrar`);
        $('#btnLogin').prop('disabled', false);
      });
  });

  $(window).scroll(function () {
    if ($(window).scrollTop()) {
      $('.home-header').addClass('active');
    } else {
      $('.home-header').removeClass('active');
    }
  });

  if ($(window).scrollTop() > 0) {
    $('.home-header').addClass('active');
  } else {
    $('.home-header').removeClass('active');
  }

  const dataHojeSaoPaulo = luxon.DateTime.now().setZone('America/Sao_Paulo');
  const formato1 = dataHojeSaoPaulo.toFormat('yyyy-MM-dd');
  const formato2 = dataHojeSaoPaulo.toFormat('dd/MM/yyyy');
  const dataOntemSaoPaulo = dataHojeSaoPaulo.minus({
    days: 1
  });
  const formatoOntem1 = dataOntemSaoPaulo.toFormat('yyyy-MM-dd');
  const formatoOntem2 = dataOntemSaoPaulo.toFormat('dd/MM/yyyy');

  axios.get(`./api/game/groupslottery`).then(response => {
      let data = response.data;
      let selectLotterie = ``;
      for (let i = 0; i < data.length; i++) {
        let isActive = i === 0 ? ' active' : '';
        if (![7, 8, 10, 11].includes(Number(data[i].campo_grupo_loteria_ident))) {
          selectLotterie += `
          <button data-group-ident="${
            data[i].campo_grupo_loteria_ident
          }" class="item-nav-result${isActive}">
            ${data[i].campo_nome_grupo_loteria.split('-')[1]}
          </button>`;
        }
      }

      $('.nav-results-desktop').append(selectLotterie);
      $('.nav-results-mobile').append(selectLotterie);

      $('#dateResult').text(formato2);
      $('#dateResult').data('date', formato1);
      $('#dateResult').data('time', 1);
      searchResults(formato1, 12);
    })
    .catch(error => {
      alert('Ocorreu algum erro ao buscar groupo de loterias!');
    });

  axios
    .get(`./api/game/quotation`)
    .then(response => {
      const data = response.data;
      const valoresDistintos = data.map(function (objeto) {
        return objeto.campo_modalidade_nome;
      }).filter(function (valor, indice, self) {
        return self.indexOf(valor) === indice;
      });
      let htmlQuatation = ``;
      for (let i = 0; i < valoresDistintos.length; i++) {
        let modalityIdentification = valoresDistintos[i];
        modalityIdentification = String(modalityIdentification).toLowerCase().replaceAll(' ', '-')
        htmlQuatation += `<tr id="quatation-${modalityIdentification}">
        <td>${valoresDistintos[i]}</td>
        <td class="1premio"></td>
        <td class="1ao5premio"></td>
        <td class="1ao6premio"></td>
        <td class="1ao7premio"></td>
      </tr>`
      }
      $("#body-quatation").html(htmlQuatation);
      for (let i = 0; i < data.length; i++) {
        let modalityIdentification = data[i].campo_modalidade_nome;
        modalityIdentification = String(modalityIdentification).toLowerCase().replaceAll(' ', '-')
        if (data[i].campo_colocacao_descricao === '1º Prêmio') {
          $(`#quatation-${modalityIdentification} > .1premio`).html(`<span>R$</span> ${data[i].campo_valor_cotacao.replaceAll('.', ',')}`);
        } else if (data[i].campo_colocacao_descricao === '1º ao 2º Prêmio') {
          $(`#quatation-${modalityIdentification} > .1premio`).html(`<span>R$</span> ${data[i].campo_valor_cotacao.replaceAll('.', ',')}`);
        } else if (data[i].campo_colocacao_descricao === '1º ao 3º Prêmio') {
          $(`#quatation-${modalityIdentification} > .1premio`).html(`<span>R$</span> ${data[i].campo_valor_cotacao.replaceAll('.', ',')}`);
        } else if (data[i].campo_colocacao_descricao === '1º ao 4º Prêmio') {
          $(`#quatation-${modalityIdentification} > .1premio`).html(`<span>R$</span> ${data[i].campo_valor_cotacao.replaceAll('.', ',')}`);
        } else if (data[i].campo_colocacao_descricao === '1º ao 5º Prêmio') {
          $(`#quatation-${modalityIdentification} > .1ao5premio`).html(`<span>R$</span> ${data[i].campo_valor_cotacao.replaceAll('.', ',')}`);
        } else if (data[i].campo_colocacao_descricao === '1º ao 6º Prêmio') {
          $(`#quatation-${modalityIdentification} > .1ao6premio`).html(`<span>R$</span> ${data[i].campo_valor_cotacao.replaceAll('.', ',')}`);
        } else if (data[i].campo_colocacao_descricao === '1º ao 7º Prêmio') {
          $(`#quatation-${modalityIdentification} > .1ao7premio`).html(`<span>R$</span> ${data[i].campo_valor_cotacao.replaceAll('.', ',')}`);
        }
      }
    })
    .catch(error => {
      alert('Ocorreu algum erro ao buscar cotações!');
    });

  $('.content-results').on('click', '.item-nav-result', function () {
    const grupoIdentSearch = $(this).data('group-ident');
    const dateSearch = $('#dateResult').data('date');
    searchResults(dateSearch, grupoIdentSearch);
  });

  $('.date-result').on('click', '.btn-date-result', function () {
    const time = Number($('#dateResult').data('time'));
    if (time === 1) {
      // valores de hoje
      $('#dateResult').data('time', 0);
      $('#dateResult').text(formatoOntem2);
      $('#dateResult').data('date', formatoOntem1);
      $(this).hide();
      $('.btn-result-next').show();
    } else {
      // valores de ontem
      $('#dateResult').text(formato2);
      $('#dateResult').data('date', formato1);
      $('#dateResult').data('time', 1);
      $(this).hide();
      $('.btn-result-back').show();
    }
    const grupoIdentSearch = $('.nav-results-desktop')
      .find('.active')
      .data('group-ident');
    const dateSearch = $('#dateResult').data('date');
    searchResults(dateSearch, grupoIdentSearch);
  });

  function searchResults(date, groupLotteryIdent) {
    axios
      .get(`./api/game/results/${date}/${groupLotteryIdent}`)
      .then(response => {
        let data = response.data;
        let htmlResults = ``;
        let htmlResultsMobile = ``;
        if (data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            htmlResults += `<div class="row-table-results">
                  <span class="item-table-results">${data[i].campo_loteria_descricao}</span>
                  <span class="item-table-results">${data[i].campo_resultado_primeira_colocacao} - ${data[i].campo_resultado_primeiro_grupo}</span>
                  <span class="item-table-results">${data[i].campo_resultado_segunda_colocacao} - ${data[i].campo_resultado_segundo_grupo}</span>
                  <span class="item-table-results">${data[i].campo_resultado_terceira_colocacao} - ${data[i].campo_resultado_terceiro_grupo}</span>
                  <span class="item-table-results">${data[i].campo_resultado_quarta_colocacao} - ${data[i].campo_resultado_quarto_grupo}</span>
                  <span class="item-table-results">${data[i].campo_resultado_quinta_colocacao} - ${data[i].campo_resultado_quinto_grupo}</span>
                  <span class="item-table-results">${data[i].campo_resultado_sexta_colocacao} - ${data[i].campo_resultado_sexto_grupo}</span>
                  <span class="item-table-results">${data[i].campo_resultado_setima_colocacao} - ${data[i].campo_resultado_setimo_grupo}</span>
                </div>`;
            htmlResultsMobile += `<div class="item-results-mobile">
                <div class="results-img">
                  <h1 class="lot-ident">${data[i].campo_loteria_descricao}</h1>
                  <img src="./assets/images/animals/img-bicho-${data[i].campo_resultado_primeiro_grupo}.jpg" alt="">
                </div>
                <div class="results-mobile-guesses">
                  <div class="row-results">
                    <span class="active">1°</span>
                    <span>${data[i].campo_resultado_primeira_colocacao} - ${data[i].campo_resultado_primeiro_grupo}</span>
                  </div>
                  <div class="row-results">
                    <span>2°</span>
                    <span>${data[i].campo_resultado_segunda_colocacao} - ${data[i].campo_resultado_segundo_grupo}</span>
                  </div>
                  <div class="row-results">
                    <span>3°</span>
                    <span>${data[i].campo_resultado_terceira_colocacao} - ${data[i].campo_resultado_terceiro_grupo}</span>
                  </div>
                  <div class="row-results">
                    <span>4°</span>
                    <span>${data[i].campo_resultado_quarta_colocacao} - ${data[i].campo_resultado_quarto_grupo}</span>
                  </div>
                  <div class="row-results">
                    <span>5°</span>
                    <span>${data[i].campo_resultado_quinta_colocacao} - ${data[i].campo_resultado_quinto_grupo}</span>
                  </div>
                  <div class="row-results">
                    <span>6°</span>
                    <span>${data[i].campo_resultado_sexta_colocacao} - ${data[i].campo_resultado_sexto_grupo}</span>
                  </div>
                  <div class="row-results">
                    <span>7°</span>
                    <span>${data[i].campo_resultado_setima_colocacao} - ${data[i].campo_resultado_setimo_grupo}</span>
                  </div>
                </div>
              </div>`;
          }
          $('.table-body-results').html(htmlResults);
          $('.area-results-mobile').html(htmlResultsMobile);
        } else {
          $('.table-body-results').html('Nenhum resultado foi encontrado!');
          $('.area-results-mobile').html('Nenhum resultado foi encontrado!');
        }
      })
      .catch(error => {
        alert('Ocorreu algum erro ao buscar resultados!');
      });
  }

  $(document).on('click', '.item-nav-result', function () {
    $('.item-nav-result').removeClass('active');
    $(this).addClass('active');
  });

  var swiper = new Swiper(".mySwiper", {
    slidesPerView: "auto",
    spaceBetween: false,
    centeredSlides: true,
    responsive: true,
    // loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
});


function searchDreamsByWord(word) {
  axios.get(`./api/dreams/search/${word}`)
    .then(response => {
      const data = response.data;
    })
    .catch(error => {
    });
}

function getDreamDetails(title) {
  var loading = `
  <div class="loading-div">
    <i class="fas fa-spinner fa-pulse"></i>
  </div>`;
  $('.result-search-result').show();
  $('.result-search-result').html(loading);

  axios.get(`./api/dreams/word/${title}`)
  .then(response => {
    const data = response.data;
    let imgAnimal;
    switch (data.animal) {
      case "Avestruz":
        imgAnimal = 'img-bicho-1.jpg';
        break;
      case "Águia":
        imgAnimal = 'img-bicho-2.jpg';
        break;
      case "Burro":
        imgAnimal = 'img-bicho-3.jpg';
        break;
      case "Borboleta":
        imgAnimal = 'img-bicho-4.jpg';
        break;
      case "Cachorro":
        imgAnimal = 'img-bicho-5.jpg';
        break;
      case "Cabra":
        imgAnimal = 'img-bicho-6.jpg';
        break;
      case "Carneiro":
        imgAnimal = 'img-bicho-7.jpg';
        break;
      case "Camelo":
        imgAnimal = 'img-bicho-8.jpg';
        break;
      case "Cobra":
        imgAnimal = 'img-bicho-9.jpg';
        break;
      case "Coelho":
        imgAnimal = 'img-bicho-10.jpg';
        break;
      case "Cavalo":
        imgAnimal = 'img-bicho-11.jpg';
        break;
      case "Elefante":
        imgAnimal = 'img-bicho-12.jpg';
        break;
      case "Galo":
        imgAnimal = 'img-bicho-13.jpg';
        break;
      case "Gato":
        imgAnimal = 'img-bicho-14.jpg';
        break;
      case "Jacaré":
        imgAnimal = 'img-bicho-15.jpg';
        break;
      case "Leão":
        imgAnimal = 'img-bicho-16.jpg';
        break;
      case "Macaco":
        imgAnimal = 'img-bicho-17.jpg';
        break;
      case "Porco":
        imgAnimal = 'img-bicho-18.jpg';
        break;
      case "Pavão":
        imgAnimal = 'img-bicho-19.jpg';
        break;
      case "Peru":
        imgAnimal = 'img-bicho-20.jpg';
        break;
      case "Touro":
        imgAnimal = 'img-bicho-21.jpg';
        break;
      case "Tigre":
        imgAnimal = 'img-bicho-22.jpg';
        break;
      case "Urso":
        imgAnimal = 'img-bicho-23.jpg';
        break;
      case "Veado":
        imgAnimal = 'img-bicho-24.jpg';
        break;
      case "Vaca":
        imgAnimal = 'img-bicho-25.jpg';
        break;
    }
    if (data == '') {
      $('.message-error').show();
      $('.message-error').removeClass('success');
      $('.message-error').html(`Essa palavra não existe ou está incorreta!`);
      setTimeout(() => {
        $('.message-error').fadeOut(250);
      }, 5000);
      $('.result-search-result').hide();
      return;
    }
    $('.search-header-dreams h1').html(`O que você sonhou? Sonhei com ${title}.`);
    $('.message-error').fadeOut(250);
    let meaningItem = `
      <div class="item-meaning">
        <h1>Significado</h1>
        <p>${data.summary}</p>
      </div>
      `;
    let guessItem = `
      <div class="item-guess">
        <h1>Sugestão de palpite</h1>
        <div class="search-guess">
          <div class="result-guess">
            <div class="guess-dreams">
              <div class="item-guess-dreams">
                <div class="modalitie-dream">Grupo</div>
                <hr class="line-dreams">
                <div class="number-dream">${data.group}</div>
              </div>
              <div class="item-guess-dreams">
                <div class="modalitie-dream">Dezena</div>
                <hr class="line-dreams">
                <div class="number-dream">${data.ten}</div>
              </div>
              <div class="item-guess-dreams">
                <div class="modalitie-dream">Centena</div>
                <hr class="line-dreams">
                <div class="number-dream">${data.hundred}</div>
              </div>
              <div class="item-guess-dreams">
                <div class="modalitie-dream">Milhar</div>
                <hr class="line-dreams">
                <div class="number-dream">${data.thousand}</div>
              </div>
            </div>
          </div>
          <div class="result-guess-img">
            <img src="./assets/images/animals/${imgAnimal}" alt="">
            <span>${data.animal}</span>
          </div>
        </div>
      </div>
      `;

    $('.result-search-result').html(meaningItem + guessItem);
  })
    .catch(error => {
      $('.result-search-result').hide();
      $('.message-error').show();
      $('.message-error').removeClass('success');
      $('.message-error').html(error);
      setTimeout(() => {
        $('.message-error').fadeOut(250);
      }, 10000);
    });
}

$('#inputSearchDreams').on('keyup', function () {
  const searchTerm = $(this).val();

  if (searchTerm.length >= 3) {
    searchDreamsByWord(searchTerm);
  }
});
$(document).on('click', '.search-result', function () {
  const title = $("#inputSearchDreams").val();
  getDreamDetails(title);
});

function handleEnterKeyPress(event) {
  if (event.keyCode === 13) {
    const title = $("#inputSearchDreams").val();
    getDreamDetails(title);
  }
}

$("#inputSearchDreams").on("keyup", handleEnterKeyPress);
