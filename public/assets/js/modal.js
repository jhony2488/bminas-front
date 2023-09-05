const ToastModal = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

// FECHAR MODAL | GERAL - CLOSE MODAL | GENERAL

$('.btn-close-modal').click(function () {
  $('.message-error').hide();
  $('.modal').removeClass('open');
  setTimeout(() => {
    $('.modal').addClass('d-none');
  }, 500);
});

$(document).keydown(function(event) {
  if (event.which == 27) {
    $('.message-error').hide();
    $('.modal').removeClass('open');
    setTimeout(() => {
      $('.modal').addClass('d-none');
    }, 500);
  }
});

// EFFECT CLICK INPUTS - EFEITOS CLIQUE INPUTS
$('.input-login').focus(function() {
  $(this).siblings('.label-text').addClass('active');
});

$('.input-login').blur(function() {
  $(this).siblings('.label-text').removeClass('active');
});

// ABRIR MODAL BANCO

function openModalBank() {
  $('.modal-bank').removeClass('d-none');
  setTimeout(() => {
    $('.modal-bank').addClass('open');
  }, 1);
}

$('.open-bank').click(function () {
  $('.modal-bank').removeClass('d-none');
  setTimeout(() => {
    $('.modal-bank').addClass('open');
  }, 1);
});

// ABRIR MODAL BONUS

function openModalBonus() {
  $('.modal-bonus').removeClass('d-none');
  setTimeout(() => {
    $('.modal-bonus').addClass('open');
  }, 1);
}

$('.open-bonus').click(function () {
  $('.modal-bonus').removeClass('d-none');
  setTimeout(() => {
    $('.modal-bonus').addClass('open');
  }, 1);
});

// ABRIR MODAL USUÁRIOS
function openModalUsers() {
  $('.modal-users').removeClass('d-none');
  setTimeout(() => {
    $('.modal-users').addClass('open');
  }, 1);
}

$(document).on('click', '.open-users', function () {
  $('.modal-users').removeClass('d-none');
  setTimeout(() => {
    $('.modal-users').addClass('open');
  }, 1);
});

// MODAL BONUS

function reedemBonus(code) {
  $('#inputBonus').removeClass('is-invalid');

  axios.post('/api/coupon/redemption', {'campo_cupom_nome': code}).then(response => {
    let data = response.data;
    showErrorModal(data.message + '<br> + R$' + data.info.campo_cupom_valor);
    $('.message-error').addClass('success');
    $('.btn-reedem').html(`Resgatar`);
    $('.btn-reedem').prop('disabled', false);
    getDadaUsers();
    $('#inputBonus').removeClass('is-invalid');
  }).catch(error => {
    if (error.response) {
      $('#inputBonus').addClass('is-invalid');
      $('#inputBonus').focus();
      showErrorModal(error.response.data.message);
      $('.btn-reedem').html(`Resgatar`);
      $('.btn-reedem').prop('disabled', false);
    }
  });
}

$('.btn-reedem').click(function () {
  $('.btn-reedem').prop('disabled', true);
  $('.btn-reedem').html(`<i class="fas fa-spinner fa-pulse"></i>`);
  var code = $('#inputBonus').val();
  if (!code) {
    showErrorModal('Preencha o campo para resgatar o bônus!');
    $('#inputBonus').focus();
    $('#inputBonus').addClass('is-invalid');
    $('.btn-reedem').html(`Resgatar`);
    $('.btn-reedem').prop('disabled', false);
  } else {
    reedemBonus(code);
  }
});

function formatarTelefone(telefone) {
  if (!telefone) {
    return '';
  }
  telefone = telefone.replace(/\D/g, '');
  telefoneFormatado = telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
  return telefoneFormatado;
}

function formatarDataNascimento(data) {
  if (!data) {
    return '';
  }
  var partes = data.split('-');
  var ano = partes[0];
  var mes = partes[1];
  var dia = partes[2];
  var dataFormatada = dia + '/' + mes + '/' + ano;
  return dataFormatada;
}


function formatarCPF(cpf) {
  if (!cpf) {
    return '';
  }
  cpf = cpf.replace(/\D/g, '');
  cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return cpfFormatado;
}


var infoUsers = "";

// MODAL USERS

function masksEdits() {
  $("#cepUser").mask('99999-999');
  $("#cellUser").mask('(99) 9 9999-9999');
  $("#cpfUser").mask('000.000.000-00');
  $("#ufUser").mask('AA', {
    translation: {
      'AA': {
        pattern: /[a-zA-Z ]/,
        recursive: true
      }
    }
  });
}

function getInfoUsers() {
  axios.get('/api/users/').then(response => {
    let data = response.data;

    $('#firstName').val(data.campo_primeiro_nome);
    $('#secondName').val(data.campo_ultimo_nome);
    $('#dateOfBirth').val(formatarDataNascimento(data.campo_data_nascimento));
    $('#cellUser').val(formatarTelefone(data.campo_telefone));
    $('#cpfUser').val(formatarCPF(data.campo_cpf));
    $('#neighborhoodUser').val(data.campo_bairro);
    $('#streetUser').val(data.campo_endereco);
    $('#cepUser').val(data.campo_cep);
    $('#cityUser').val(data.campo_cidade);
    $('#ufUser').val(data.campo_estado);
    $('#userEmail').val(data.campo_email);

    $('#cpf').val(formatarCPF(data.campo_cpf));

    masksEdits();

    if (data.campo_cpf) {
      // BANK
      $("#cpf").attr('disabled', true);
      $("#cpf").attr('readonly', true);
      // USER
      $("#cpfUser").attr('disabled', true);
      $("#cpfUser").attr('readonly', true);
    } else {
      ToastModal.fire({
        icon: 'warning',
        html: 'CPF não cadastrado! <br> <button onclick="openModalUsers()" class="btn btn-open open-users">Cadastrar</button>',
        showCloseButton: true,
        timer: 10000,
      });
    }

    if (data.campo_email == "sem") {
      $("#userEmail").val('');
    }

    if (data.campo_email !== "sem") {
      $("#userEmail").attr('disabled', true);
      $("#userEmail").attr('readonly', true);
    }

    if (data.campo_telefone) {
      $("#cellUser").attr('disabled', true);
      $("#cellUser").attr('readonly', true);
    } else {
      ToastModal.fire({
        icon: 'warning',
        html: 'Telefone não cadastrado! <br> <button onclick="openModalUsers()" class="btn btn-open open-users">Cadastrar</button>',
        showCloseButton: true,
        timer: 10000,
      });
    }

  }).catch(error => {

  });
}

getInfoUsers();

$('.message-error').hide();

function showErrorModal(message) {
  $('.message-error').show();
  $('.message-error').removeClass('success');
  $('.message-error').html(message);
};

function saveUsers() {

  password = $("#userPassword").val();
  passwordNew = $("#userRepeatPassword").val();

    if (password != '') {

      if (password == passwordNew) {
        infoUsers = {
              'campo_bairro': $('#neighborhoodUser').val(),
              'campo_cep': $('#cepUser').val(),
              'campo_cidade': $('#cityUser').val(),
              'campo_cpf': $('#cpfUser').val(),
              'campo_email': $('#userEmail').val(),
              'campo_endereco': $('#streetUser').val(),
              'campo_estado': $('#ufUser').val(),
              'campo_primeiro_nome': $('#firstName').val(),
              'campo_telefone': $('#cellUser').val(),
              'campo_ultimo_nome': $('#secondName').val(),
              'campo_senha': password,
          }
      } else {
        showErrorModal("As senhas não são coincidentes!");
        $('.btn-save').html(`Salvar`);
        $('.btn-save').prop('disabled', false);
        return;
      }
  } else {
    infoUsers = {
      'campo_bairro': $('#neighborhoodUser').val(),
      'campo_cep': $('#cepUser').val(),
      'campo_cidade': $('#cityUser').val(),
      'campo_cpf': $('#cpfUser').val(),
      'campo_email': $('#userEmail').val(),
      'campo_endereco': $('#streetUser').val(),
      'campo_estado': $('#ufUser').val(),
      'campo_primeiro_nome': $('#firstName').val(),
      'campo_telefone': $('#cellUser').val(),
      'campo_ultimo_nome': $('#secondName').val(),
    }
  }


  if (infoUsers != '') {
    axios.put('/api/users/edit', infoUsers).then(response => {

      ToastModal.fire({
        icon: 'success',
        showCloseButton: true,
        title: 'Dados alterados com sucesso!',
        timer: 10000
    });

    $('#cpfUser').removeClass('is-invalid');
    $('#userEmail').removeClass('is-invalid');

    getInfoUsers();

    $('.btn-save').html(`Salvar`);
    $('.btn-save').prop('disabled', false);
    showErrorModal("Dados alterados com sucesso!");
    $('.message-error').addClass('success');

    }).catch(error => {
      if (error.response) {
        $('#cpfUser').removeClass('is-invalid');
        $('#userEmail').removeClass('is-invalid');
        if (error.response.data.message && error.response.data.inputs) {
          if (error.response.data.inputs.campo_cpf && error.response.data.inputs.campo_email) {
            showErrorBank(error.response.data.inputs.campo_cpf[0] + "<br>" + error.response.data.inputs.campo_email[0]);
            $('.btn-save').html(`Salvar`);
            $('.btn-save').prop('disabled', false);
            $('#cpfUser').addClass('is-invalid');
            $('#userEmail').addClass('is-invalid');
          }  else if (error.response.data.inputs.campo_cpf) {
            showErrorBank(error.response.data.inputs.campo_cpf[0]);
            $('.btn-save').html(`Salvar`);
            $('.btn-save').prop('disabled', false);
            $('#cpfUser').addClass('is-invalid');
          } else if (error.response.data.inputs.campo_email) {
            $('#userEmail').addClass('is-invalid');
            showErrorBank(error.response.data.inputs.campo_email[0]);
            $('.btn-save').html(`Salvar`);
            $('.btn-save').prop('disabled', false);
          }
        }
      }
    });
}

}

$('.btn-save').click(function () {
  $('.btn-save').prop('disabled', true);
  $('.btn-save').html(`<i class="fas fa-spinner fa-pulse"></i>`);
  saveUsers();
});


