function getDadaUsers() {
  axios
    .get('/api/users/')
    .then(response => {
      // HEADER
      const campo_primeiro_nome = response.data.campo_primeiro_nome;
      const campo_nome_usuario = response.data.campo_nome_usuario;
      const campo_genero = response.data.campo_genero;
      const welcomeMessage =
        campo_genero === 'M'
          ? `Olá, ${campo_nome_usuario.toUpperCase()}. Bem vindo!`
          : campo_genero === 'F'
          ? `Olá, ${campo_nome_usuario.toUpperCase()}. Bem vinda!`
          : `Olá, ${campo_nome_usuario.toUpperCase()}. Bem vindo(a)!`;
      $('.name-user').html(campo_primeiro_nome);
      $('.message-user').html(welcomeMessage);

      // LATERAL-MENU
      const campo_saldo_total = response.data.campo_saldo_total;
      $('#userBalance').html(
        parseFloat(campo_saldo_total).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
      );

      $('.depositUser').html(
        parseFloat(campo_saldo_total).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
      );
      const campo_saldo_saque =  response.data.campo_saldo_saque;
      $('.valorSaque').html(
        parseFloat(campo_saldo_saque).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
      );

      // INDICATION
      $('.open-share').attr(`data-link-share`, `https://bichomania.bet/cadastrar?indication=${response.data.campo_nome_usuario}`);
    })
    .catch(error => {
      if (Number(error.response.data.status) === 401) {
        window.location.href = '/';
      }
    });
}

$(document).ready(function() {
  $('.loading-screen').fadeOut(850, function () {
    $('.loader, .content-logo').fadeOut(500);
    $('body').css('overflow', 'visible');
  });

  getDadaUsers();

  let pageUrl = window.location.href.split('/');
  pageUrl = pageUrl[pageUrl.length - 1].split('.')[0].replace(/#/g, "");
  pageUrl = pageUrl.split('?')[0]
  $('.options-menu a[data-url="' + pageUrl + '"]').parent().addClass('active')

  $(".options-menu li").on("click", function () {
    if ($(this).hasClass('prevent-active')) {
      return;
    }
    $('.options-menu li.active').removeClass('active')
    $(this).addClass('active')
  });

  // OPEN MODAL BANK

  $('.open-bank').click(function () {
    $('.modal-bank').removeClass('d-none');
    setTimeout(() => {
      $('.modal-bank').addClass('open');
    }, 1);
  });

  $('.btn-close-modal').click(function () {
    $('.modal-bank').removeClass('open');
    setTimeout(() => {
      $('.modal-bank').addClass('d-none');
    }, 500);
  });

  // OPEN SHARE
  $('.open-share').click(function () {
    const linkShareValue = $('.open-share').data('link-share');
    const $tempElement = $('<textarea>');
    $tempElement.val(linkShareValue);
    $('body').append($tempElement);
    $tempElement.select();
    document.execCommand('copy');
    $tempElement.remove();
    Swal.fire({
      imageUrl: './assets/images/icon-logo.svg',
      imageWidth: 50,
      imageHeight: 50,
      imageAlt: 'Logo',
      title: '<strong style="color: var(--primary);">COMISSÃO 20%</strong>',
      html: 'Ganhe <strong>20%</strong> de todos depósitos realizados por apostadores indicados, a partir do <strong>segundo depósito</strong>. <br><br>' + '<strong style="color: var(--primary);">LINK COPIADO!</strong>' + '<br><br>Agora é só enviar para seu apostador.',
      confirmButtonText: '<i class="fa fa-thumbs-up"></i>',
      confirmButtonColor: '#2AC1B9',
      background: '#201d47',
      color: 'rgb(255 255 255 / 80%)',
      });
  });


  // Shake animation using jQuery
  function shakeElement(element) {
    $(element)
      .addClass('shake-animation')
      .delay(1000)
      .queue(function (next) {
        $(this).removeClass('shake-animation');
        next();
      });
  }
  // Verifique se existe um valor de "userBalanceBlurred" no localStorage
  var isBlurred = localStorage.getItem('userBalanceBlurred') === 'true';

  // Se estiver desfocado, defina o desfoque no elemento "userBalance"
  if (isBlurred) {
    $('#userBalance').addClass('blur-balance');
    $('.fa-eye').addClass('fa-eye-slash');
    $('.fa-eye-slash').removeClass('fa-eye');
    $('.toggle-money-visibility').attr('title', 'Mostrar valor');
  }

  // Atribua uma função de clique ao botão ".toggle-money-visibility"
  $('.toggle-money-visibility').click(function () {
    if (!isBlurred) {
      // Defina o desfoque no elemento "userBalance"
      $('#userBalance').addClass('blur-balance');
      $('.fa-eye').addClass('fa-eye-slash');
      $('.fa-eye-slash').removeClass('fa-eye');
      $(this).attr('title', 'Mostrar valor');

      // Atualize o valor de "isBlurred" e armazene-o no localStorage
      isBlurred = true;
      localStorage.setItem('userBalanceBlurred', 'true');
    } else {
      // Remova o desfoque do elemento "userBalance"
      $('#userBalance').removeClass('blur-balance');
      $('.fa-eye-slash').addClass('fa-eye');
      $('.fa-eye').removeClass('fa-eye-slash');
      $(this).attr('title', 'Esconder valor');
      // Atualize o valor de "isBlurred" e remova-o do localStorage
      isBlurred = false;
      localStorage.removeItem('userBalanceBlurred');
    }
  });

  $("#logoutUser").click(function(){
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
  })
});


// MENU BURGUER
$('.menu-burger').click(function (event) {
  event.stopPropagation();

  var sideMenu = $('#sideMenu');
  var LinesMenuBurger = $('#verifyLinesBurguers');

  if (sideMenu.hasClass('active')) {
    sideMenu.removeClass('active');
    setTimeout(function () {
      $('body').css('overflow', 'auto');
      sideMenu.hide();
      LinesMenuBurger.removeClass('active');
      $('.bg-mobile.menu-open-only').remove();
    }, 100);
  } else {
    sideMenu.show();
    $('body').css('overflow', 'hidden');
    setTimeout(function () {
      sideMenu.addClass('active');
      $('.tradicional').append('<div class="bg-mobile menu-open-only"></div>');
      LinesMenuBurger.addClass('active');
    }, 100);
  }
});

$(document).click(function (event) {
  var target = $(event.target);
  var sideMenu = $('#sideMenu');
  var LinesMenuBurger = $('#verifyLinesBurguers');

  if (
    !target.closest(sideMenu).length &&
    !target.hasClass('menu-burger') &&
    sideMenu.hasClass('active') &&
    target.hasClass('menu-open-only')
  ) {
    sideMenu.removeClass('active');
    $('body').css('overflow', 'auto');
    setTimeout(function () {
      sideMenu.hide();
      LinesMenuBurger.removeClass('active');
      $('.bg-mobile.menu-open-only').remove();
    }, 500);
  }
});

// MENU APOSTAS
var isDraggingMenuBets = false;
var startXMenuBets, scrollLeftMenuBets;

$('.content-bets').on('mousedown touchstart', function (e) {
    isDraggingMenuBets = true;
    startXMenuBets = e.pageX || e.originalEvent.touches[0].pageX;
    scrollLeftMenuBets = $('.content-bets').scrollLeft();
  }).on('mouseup touchend', function () {
    isDraggingMenuBets = false;
  }).on('mousemove touchmove', function (e) {
    if (!isDraggingMenuBets) return;

    var xMenuBets = e.pageX || e.originalEvent.touches[0].pageX;
    var deltaXMenuBets = startXMenuBets - xMenuBets;

    $('.content-bets').scrollLeft(scrollLeftMenuBets + deltaXMenuBets);
  });

$(window).on('mouseup touchend', function () {
  isDraggingMenuBets = false;
});

var scrollDuration = 200;

$('.btn-scroll-bets').click(function () {
  var scrollStep = $('.content-bets').width();
  $('.content-bets').animate(
    {
      scrollLeft: '+=' + scrollStep,
    },
    scrollDuration,
  );
});
