// MSG ERROR
$('.message-error').hide();

function showErrorBank(message) {
  $('.message-error').show();
  $('.message-error').removeClass('success');
  $('.message-error').html(message);
  setTimeout(() => {
    $('.message-error').fadeOut(250);
  }, 10000);
};

// SELECT BANK
$(document).on('click', '.btn-payment', function () {
  $('.btn-payment').removeClass('active');
  $(this).addClass('active');
});

// SELECT DEPOSIT OR WITHDRAW
$('.select-options .btn-deposit').click(function () {
  $('.select-options .btn-withdraw').removeClass('active');
  $(this).addClass('active');
  $('.modal-body.modal-body-bank.withdraw').removeClass('d-flex');
  $('.modal-body.modal-body-bank.withdraw').addClass('d-none');
  $('.modal-body.modal-body-bank.deposit').addClass('d-flex');
  $('.modal-body.modal-body-bank.deposit').removeClass('d-none');
  $('.container-select-deposit').removeClass('d-none');
});

$('.select-options .btn-withdraw').click(function () {
  $('.select-options .btn-deposit').removeClass('active');
  $(this).addClass('active');
  $('.modal-body.modal-body-bank.deposit').removeClass('d-flex');
  $('.modal-body.modal-body-bank.deposit').addClass('d-none');
  $('.modal-body.modal-body-bank.withdraw').addClass('d-flex');
  $('.modal-body.modal-body-bank.withdraw').removeClass('d-none');
  $('.container-select-deposit').addClass('d-none');
});

// INPUT VALUE DEPOSIT
function checkEmptyValueButton() {
  if ($("#inputValue").val() == "") {
    $(".valueDeposit").html(`R$ 00,00`);
  }
};
$("#inputValue").keyup(function () {
  var valueInputDeposit = $(this).val();
  $(".valueDeposit").html(`R$ ` + valueInputDeposit + `,00`);
  checkEmptyValueButton();
});

// VERIFY COUPON
$('.validateCouponDeposit').click(function () {
  $('.validateCouponDeposit').prop('disabled', true);
  $('.validateCouponDeposit').html(`<i class="fas fa-spinner fa-pulse"></i>`);
  let inputCoupon = $('#inputCoupon').val();
  if (inputCoupon) {
    axios.get('/api/coupon/verify_deposit/' + inputCoupon).then(response => {
      let data = response.data;
      showErrorBank(data.message);
      $('.message-error').addClass('success');
      $('#inputCoupon').removeClass('is-invalid');
      $('#inputCoupon').addClass('validateCheck');
      $('.validateCouponDeposit').prop('disabled', false);
      $('.validateCouponDeposit').html(`<i class="fas fa-check"></i>`);
      setTimeout(() => {
        $('.validateCouponDeposit').html(`validar cupom`);
      }, 5000);
    }).catch(error => {
      showErrorBank(error.response.data.message);
      $('#inputCoupon').focus();
      $('#inputCoupon').addClass('is-invalid');
      $('.validateCouponDeposit').prop('disabled', false);
      $('.validateCouponDeposit').html(`validar cupom`);
    });
  } else {
    showErrorBank('Preencha o campo!');
    $('#inputCoupon').focus();
    $('#inputCoupon').addClass('is-invalid');
    $('.validateCouponDeposit').prop('disabled', false);
    $('.validateCouponDeposit').html(`validar cupom`);
  }
});


function searchBanks() {
  axios.get('/api/transaction/banks/').then(response => {
    let data = response.data.reverse();
    let btnDeposit = ``;

    for (let i = 0; i < data.length; i++) {
      const isActive = i === 0 ? ' active' : '';
      btnDeposit += `
        <button tabindex="0" type="button" data-selectbank=${data[i].campo_banco_ident} class="btn-payment ${isActive}">
          <img class="img-fluid" src="./assets/images/${data[i].campo_banco_imagem}" title="Selecionar a opção ${data[i].campo_banco_nome}" alt="Selecionar a opção ${data[i].campo_banco_nome}">
        </button>`;
    }

    $('.select-method-payments').html(btnDeposit);

  }).catch(error => {

  });
};

searchBanks();

function verifyFirstDeposit() {
  axios.get('/api/transaction/deposit/first').then(response => {
    if (data.campo_primeiro_deposito == true) {
        $("#inputValue").attr({"min" : 20});
        return;
    } else {
        $("#inputValue").attr({"min" : 5});
        $('.title-notice').hide();
        return;
    }
  }).catch(error => {

  });
};

verifyFirstDeposit();

$('.container-select-deposit .btn-deposit-request').click(function () {
  if ($('#inputValue').val() == "") {
    showErrorBank('Insira um valor de depósito!');
    $('#inputValue').focus();
    $('#inputValue').addClass('is-invalid');
    return;
  }
  // MERCADO PAGO
  if ($('.btn-payment.active').data('selectbank') == 3) {
    if ($('#inputValue').val() > 200) {
      $('#inputValue').focus();
      $('#inputValue').addClass('is-invalid');
      showErrorBank('Mercado pago somente pedidos abaixo de R$ 200,00!');
      $('.container-select-deposit .btn-deposit-request').html('Depositar');
      $('.container-select-deposit .btn-deposit-request').prop('disabled', false);
      return;
    }
  }
  Swal.fire({
    title: 'Estamos quase lá...',
    html: `
    <h1 class="title-swal-bank">DEPÓSITOS NÃO SÃO RETIRÁVEIS OU RESGATÁVEIS!</h1>
    <h2 class="subtitle-swal-bank">CASO VOCÊ UTILIZE O CUPOM, OCORRERÃO DUAS SITUAÇÕES:</h2>
    <ul class="list-swal-bank">
      <li class="item-swal-bank">PERDERÁ O BENEFÍCIO DE 20% NO PRIMEIRO DEPÓSITO;</li>
      <li class="item-swal-bank">SE POSSUIR UM INDICADOR, ELE NÃO RECEBERÁ COMISSÃO.</li>
    </ul>
    `,
    showCloseButton: true,
    showCancelButton: false,
    confirmButtonColor: '#2AC1B9',
    cancelButtonColor: '#FF4141',
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar',
    background: '#201d47',
    color: 'rgb(255 255 255 / 80%)',
  }).then((result) => {
    if (result.isConfirmed) {

      $('.container-select-deposit .btn-deposit-request').html('<i class="fas fa-spinner fa-pulse"></i>');
      $('.container-select-deposit .btn-deposit-request').prop('disabled', true);
      let infoBank = "";

      if ($('#inputCoupon.validateCheck').val()) {
        infoBank = {
          'campo_banco_ident': $('.btn-payment.active').data('selectbank'),
          'campo_valor': parseFloat($('#inputValue').val()),
          'campo_cupom_nome': $('#inputCoupon').val(),
        }
      } else {
        infoBank = {
          'campo_banco_ident': $('.btn-payment.active').data('selectbank'),
          'campo_valor': parseFloat($('#inputValue').val()),
        }
      }

      axios.post('/api/transaction/deposit/', infoBank).then(response => {
        $('.container-select-deposit .btn-deposit-request').html('Depositar');
        $('.container-select-deposit .btn-deposit-request').prop('disabled', false);
        let data = response.data;
        showErrorBank(data.message);
        $('.message-error').addClass('success');
        $('.input-value').removeClass('is-invalid');
        // BANCO MERCADO PAGO
        if ($('.btn-payment.active').data('selectbank') == 3) {
          $('.container-payment-purchase').addClass('d-flex')
          $('.container-payment-purchase').html(`<iframe src="${data.iframe}" width="100%" height="100%" frameborder="0" allowfullscreen="true" allow="accelerometer; autoplay;encrypted-media;gyroscope;picture-in-picture"></iframe>`);
          $('.container-bank-deposit').addClass('d-none');
          $('.container-payment-deposit').addClass('d-none');
          $('.modal-bank .modal-content').css('height', '100%');
          $('.modal-bank .modal-content .modal-body-bank').css('height', '100%');
          $('.buttons-footer').addClass('d-flex');
          $('.btn-deposit-request').hide();
          $('.btn-deposit-cancel').show();
        }
        // BANCO PIX - FABANK
        if ($('.btn-payment.active').data('selectbank') == 2) {
          const imgQrCode = $('<img>').attr('src', data.info.campo_qr_code).attr('alt', 'QR_Code PIX');
          imgQrCode.on('load', function () {
            $('.container-payment-purchase').addClass('d-flex');
            $('.container-payment-purchase').addClass('pix');
            $('.container-payment-purchase').html(`
                <div class="header-stages">
                  <h1>Pagamento</h1>
                  <span>Etapa 03</span>
                </div>
                <div class="container-pix">
                  <div class="content-pix">
                    <img src="${data.info.campo_qr_code}" alt="">
                  </div>
                  <button class="btn-copy-code" data-copia-cola="${data.info.campo_copia_cola}">Copiar código PIX</button>
                </div>
              `);
            $('.container-bank-deposit').addClass('d-none');
            $('.container-payment-deposit').addClass('d-none');
            $('.container-payment-purchase').css('max-width', '500px');
            $('.container-payment-purchase').css('flex-direction', 'column');

            $('.buttons-footer').addClass('d-flex');
            $('.btn-deposit-request').hide();
            $('.btn-deposit-cancel').show();

            $(document).on('click', '.btn-copy-code', function () {
              let copyPaste = $('.btn-copy-code').data('copia-cola');
              navigator.clipboard.writeText(copyPaste);
              ToastModal.fire({
                icon: 'success',
                title: 'PIX copiado com sucesso!',
                timer: 3000,
              });
            });
          });
        }
      }).catch(error => {
        $('.container-select-deposit .btn-deposit-request').html('Depositar');
        $('.container-select-deposit .btn-deposit-request').prop('disabled', false);
        if (error.response.data) {
          showErrorBank(error.response.data.message);
         if (error.response.data.inputs) {
          showErrorBank(error.response.data.inputs.campo_valor);
          showErrorBank(error.response.data.inputs.campo_banco_ident);
          $('#inputValue').focus();
          $('#inputValue').addClass('is-invalid');
         }
        }
      });
    }
  });
});

// DEPÓSITO PENDENTE
function searchDeposit() {
  axios.get('/api/transaction/deposit/pending').then(response => {
    let data = response.data;
    if (data.campo_info.campo_iframe == null) {
      const imgQrCode = $('<img>').attr('src', data.campo_info.campo_qrcode).attr('alt', 'QR_Code PIX');
      imgQrCode.on('load', function () {
        $('.container-payment-purchase').addClass('d-flex');
        $('.container-payment-purchase').addClass('pix');
        $('.container-payment-purchase').html(`
            <div class="header-stages">
              <h1>Pagamento</h1>
              <span>Etapa 03</span>
            </div>
            <div class="container-pix">
              <div class="content-pix">
                <img src="${data.campo_info.campo_qrcode}" alt="">
              </div>
              <button class="btn-copy-code" data-copia-cola="${data.campo_info.campo_copia_cola}">Copiar código PIX</button>
            </div>
          `);
        $('.container-bank-deposit').addClass('d-none');
        $('.container-payment-deposit').addClass('d-none');
        $('.container-payment-purchase').css('max-width', '500px');
        $('.container-payment-purchase').css('flex-direction', 'column');

        $('.buttons-footer').addClass('d-flex');
        $('.btn-deposit-request').hide();
        $('.btn-deposit-cancel').show();

        $(document).on('click', '.btn-copy-code', function () {
          let copyPaste = $('.btn-copy-code').data('copia-cola');
          navigator.clipboard.writeText(copyPaste);
          ToastModal.fire({
            icon: 'success',
            title: 'PIX copiado com sucesso!',
            timer: 3000,
          });
        });
      });
    } else {
      $('.container-payment-purchase').addClass('d-flex')
      $('.container-payment-purchase').html(`<iframe src="${data.campo_info.campo_iframe}" width="100%" height="100%" frameborder="0" allowfullscreen="true" allow="accelerometer; autoplay;encrypted-media;gyroscope;picture-in-picture"></iframe>`);
      $('.container-bank-deposit').addClass('d-none');
      $('.container-payment-deposit').addClass('d-none');
      $('.modal-bank .modal-content').css('height', '100%');
      $('.modal-bank .modal-content .modal-body-bank').css('height', '100%');
      $('.buttons-footer').addClass('d-flex');
      $('.btn-deposit-request').hide();
      $('.btn-deposit-cancel').show();
    }
  }).catch(error => {

  });
}
searchDeposit();
let copyPaste = ``;
function searchDeposit() {
  axios.get('/api/transaction/deposit/pending').then(response => {
    let data = response.data;
    if (data.campo_info.campo_iframe == null) {
      const imgQrCode = $('<img>').attr('src', data.campo_info.campo_qrcode).attr('alt', 'QR_Code PIX');
      imgQrCode.on('load', function () {
        $('.container-payment-purchase').addClass('d-flex');
        $('.container-payment-purchase').addClass('pix');
        $('.container-payment-purchase').html(`
              <div class="header-stages">
                <h1>Pagamento</h1>
                <span>Etapa 03</span>
              </div>
              <div class="container-pix">
                <div class="content-pix">
                  <img src="${data.campo_info.campo_qrcode}" alt="">
                </div>
                <button class="btn-copy-code" data-copia-cola="${data.campo_info.campo_copia_cola}">Copiar código PIX</button>
              </div>
            `);
        $('.container-bank-deposit').addClass('d-none');
        $('.container-payment-deposit').addClass('d-none');
        $('.container-payment-purchase').css('max-width', '500px');
        $('.container-payment-purchase').css('flex-direction', 'column');

        $('.buttons-footer').addClass('d-flex');
        $('.btn-deposit-request').hide();
        $('.btn-deposit-cancel').show();
        copiaECola = data.campo_info.campo_copia_cola;
      });
    } else {
      $('.container-payment-purchase').addClass('d-flex')
      $('.container-payment-purchase').html(`<iframe src="${data.campo_info.campo_iframe}" width="100%" height="100%" frameborder="0" allowfullscreen="true" allow="accelerometer; autoplay;encrypted-media;gyroscope;picture-in-picture"></iframe>`);
      $('.container-bank-deposit').addClass('d-none');
      $('.container-payment-deposit').addClass('d-none');
      $('.modal-bank .modal-content').css('height', '100%');
      $('.modal-bank .modal-content .modal-body-bank').css('height', '100%');
      $('.buttons-footer').addClass('d-flex');
      $('.btn-deposit-request').hide();
      $('.btn-deposit-cancel').show();
    }
  }).catch(error => {

  });
}
searchDeposit();

$(document).on('click', '.btn-copy-code', function () {
  const linkShareValue = $('.btn-copy-code').data('copia-cola');
  const $tempElement = $('<textarea>');
  $tempElement.val(linkShareValue);
  $('body').append($tempElement);
  $tempElement.select();
  document.execCommand('copy');
  $tempElement.remove();

  ToastModal.fire({
    icon: 'success',
    title: 'PIX copiado com sucesso!',
    timer: 3000,
  });

  // alert(navigator.clipboard);
  // navigator.clipboard.writeText('copyPaste').then(() => {
  //   alert("successfully copied");
  // })
  // .catch(() => {
  //   alert("something went wrong");
  // });
  // ToastModal.fire({
  //   icon: 'success',
  //   title: 'PIX copiado com sucesso!',
  //   timer: 3000,
  // });
});

// CANCELAR DEPÓSITO
$(document).on('click', '.btn-deposit-cancel', function () {
  Swal.fire({
    icon: "question",
    title: "Tem certeza? 😢",
    text: "Deseja cancelar seu depósito?",
    showCloseButton: true,
    showCancelButton: false,
    confirmButtonColor: '#2AC1B9',
    cancelButtonColor: '#FF4141',
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      axios.delete('/api/transaction/deposit/cancel').then(response => {
        let data = response.data;
        ToastModal.fire({
          timer: 3000,
          icon: "success",
          title: "Depósito cancelado com sucesso!"
        });
        $('.container-payment-purchase').empty();
        $('.container-payment-purchase').removeClass('d-flex');
        $('.container-payment-purchase').addClass('d-none');
        $('.container-bank-deposit').removeClass('d-none');
        $('.container-payment-deposit').removeClass('d-none');
        $('.btn-deposit-cancel').hide();
        showErrorBank(data.message);
        $('.message-error').addClass('success');
        $('.buttons-footer').removeClass('d-flex');
        $('.btn-deposit-request').show();
        $('.modal-bank .modal-content').removeAttr('style');
        $('.modal-bank .modal-content .modal-body-bank').removeAttr('style');
      }).catch(error => {

      });
    }
  });

});

// WITHDRAW - SAQUE
$("#phoneKey").mask('(99) 9 9999-9999');
$("#cpf").mask('000.000.000-00');

$('#enviar_withdraw').click(function () {

  $('#enviar_withdraw').prop('disabled', true);
  $('#enviar_withdraw').html('<i class="fas fa-spinner fa-pulse"></i>');

  let valueWithdraw = $('#inputWithdraw').val().replace('.', '').replace(',', '.');
  let infoWithdraw = ``;
  if (parseFloat(valueWithdraw) < 5) {
    showErrorBank('Insira um valor acima de R$ 5,00!');
    $('#enviar_withdraw').prop('disabled', false);
    $('#enviar_withdraw').html('Retirar pagamento');
    return
  }
  if ($('.input-method-withdraw:visible').val()){
    infoWithdraw = {
      'campo_valor': parseFloat(valueWithdraw),
      'campo_pix': $('.input-method-withdraw:visible').val(),
    }
  } else {
    $('#enviar_withdraw').prop('disabled', false);
    $('#enviar_withdraw').html('Retirar pagamento');
    showErrorBank('Adicione uma chave PIX!')
    return;
  }

  axios.post('/api/transaction/withdraw/', infoWithdraw).then(response => {
    let data = response.data;
    searchWithdraw();
  }).catch(error => {
    if (error.response) {
      if (error.response.data.message) {
          showErrorBank(error.response.data.message);
          $('#enviar_withdraw').prop('disabled', false);
          $('#enviar_withdraw').html('Retirar pagamento');
      }
    }
  });
});

function searchWithdraw() {
  axios.get('/api/transaction/withdraw/pending').then(response => {
    let data = response.data;
    valuePendingWithdraw = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
      }).format(data.campo_transacao_valor);
    if (data) {
      $('#enviar_withdraw').prop('disabled', true);
      $('#enviar_withdraw').html('Retirar pagamento');
      $('.content-history').html(`
        <h5>Seus pedidos</h5>
        <div class="withdrawal-request waiting">
          <div style="display:flex; justify-content: center;align-items:center">
              <span class="status-withdraw">Aguardando</span>
            </div>
            <div class="container-withdrawal-request">
                <div class="row-withdrawal-request">
                    <div class="column-withdrawal-request">
                        #${data.campo_transacao_ident}
                    </div>
                    <div class="column-withdrawal-request">
                        Valor: <br>${valuePendingWithdraw}
                    </div>
                    <div class="column-withdrawal-request">
                        Hora: <br>${data.campo_transacao_data.split(' ')[1].split('.')[0]}
                </div>
            </div>
            </div>
        </div> `);
    } else {
      $('#enviar_withdraw').prop('disabled', false);
      $('#enviar_withdraw').html('Retirar pagamento');
    }
  }).catch(error => {
    if (error.response) {
      if (error.response.data.message) {
          showErrorBank(error.response.data.message);
          $('#enviar_withdraw').prop('disabled', false);
          $('#enviar_withdraw').html('Retirar pagamento');
      }
    }
  });
}
searchWithdraw();

const inputs = $('.input-method-withdraw');
inputs.hide();
const formatValue = (inputValue) => {
  let value = inputValue.replace(/\D/g, "");
  value = value.padStart(3, "0");
  value = (value / 100).toFixed(2);
  value = value.replace(".", ",");
  value = value.replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
  return value;
};
$("#inputWithdraw").on("input", function () {
  const prevValue = $(this).val();
  const formattedValue = formatValue(prevValue);
  let fixedCursorPosition = $(this).val().length;
  if (prevValue !== formattedValue) {
    const diff = formattedValue.length - prevValue.length;
    fixedCursorPosition += diff;
  }
  $(this).val(formattedValue);
  this.setSelectionRange(fixedCursorPosition, fixedCursorPosition);
});
$("#inputWithdraw").on("click", function () {
  const cursorPosition = $(this).val().length;
  $(this)[0].setSelectionRange(cursorPosition, cursorPosition);
});
$("#inputWithdraw").on("blur", function () {
  if ($(this).val() === "") {
    $(this).val("0,00");
  }
});
$('.btn-method-withdraw').on('click', function () {
  const selectedBtn = $(this);
  const dataType = selectedBtn.data('type');
  const inputToShow = $(`input[data-type="${dataType}"]`);
  if (selectedBtn.hasClass("active")) {
    selectedBtn.removeClass("active");
    $('.btn-method-withdraw').show();
    inputs.hide();
    inputToShow.prop("disabled", true);
  } else {
    $('.btn-method-withdraw').removeClass("active");
    selectedBtn.addClass("active");
    $('.btn-method-withdraw').not(selectedBtn).hide();
    inputs.not(inputToShow).hide();
    inputToShow.show();
    inputToShow.prop("disabled", false);
    $(inputToShow).focus();
  }
});
