$(document).ready(function () {
  $('.loading-screen').fadeOut(850, function () {
    $('.loader, .content-logo').fadeOut(500);
  });

  $('.input-login').focus(function() {
    $(this).siblings('.label-text').addClass('active');
  });

  $('.input-login').blur(function() {
    $(this).siblings('.label-text').removeClass('active');
  });

  var userInput;

  $(document).on('click','.btn-send-user', function () {
    $('.btn-send-user').prop('disabled', true);
    $('.btn-send-user').html(`<i class="fas fa-spinner fa-pulse"></i>`);
      userInput = $('#userName').val();
      let send = {
        campo_nome_usuario: userInput,
      };
      if (userInput) {
        axios.post(`./api/users/recover/send`, send).then(response => {
          $('.btn-send-user').prop('disabled', false);
          $('.btn-send-user').html(`Enviar`);
          let data = response.data;
          let resetPasswordHTML = `
          <div class="content-second-password">
            <h1>Recebeu seu SMS?</h1>
            <h2>Estamos quase lá!</h2>
            <div class="input-group">
              <label for="userCode" class="label-text" id="labelTextCode">Código</label>
              <label for="userCode" class="label-icon">
                <i class="fas fa-sms"></i>
              </label>
              <input type="text" autocomplete="off" id="userCode" class="input-login" placeholder="Insira o código SMS">
            </div>
            <div class="input-group">
              <label for="userNewPassword" class="label-text" id="labelTextNewPassword">Nova senha</label>
              <label for="userNewPassword" class="label-icon">
                <i class="fas fa-key"></i>
              </label>
              <input type="text" autocomplete="off" id="userNewPassword" class="input-login" placeholder="Insira uma nova senha">
            </div>
          </div>
          `;

          $('.content-reset-password').html(resetPasswordHTML);
          $('.btn-send-user').addClass('btn-edit-password');
          $('.btn-send-user').removeClass('btn-send-user');
        }).catch(error => {

        });
      } else {
        $('#userName').addClass('is-invalid');
        showError('Preencha o campo acima para prosseguir!');
        $('.btn-send-user').prop('disabled', false);
        $('.btn-send-user').html(`Enviar`);
      }
  });

  $(document).on('click','.btn-edit-password', function () {
    $('.btn-edit-password').prop('disabled', true);
    $('.btn-edit-password').html(`<i class="fas fa-spinner fa-pulse"></i>`);
    let smsInput = $('#userCode').val();
    let newPasswordInput = $('#userNewPassword').val();

    if (smsInput == "" || newPasswordInput == "") {
      $('.btn-edit-password').prop('disabled', false);
      $('.btn-edit-password').html(`Enviar`);
      showError('Preencha o campo acima para prosseguir!');
      return;
    }
    let send = {
      campo_nome_usuario: userInput,
      campo_codigo: smsInput,
      campo_senha: newPasswordInput,
    };
    axios.post(`./api/users/recover/newpassword`, send).then(response => {
      showError(response.data.message);
      $('.message-error').addClass('success');
      setTimeout(() => {
        axios.post('/api/users/login', {
          campo_nome_usuario: userInput,
          campo_senha: newPasswordInput,
        }).then(response => {
            window.location.href="/jogar"
        }).catch(error => {
          if (error.response) {
            if(error.response.data) {
              showError(error.response.data.message);
            }
          }
          $('.btn-edit-password').prop('disabled', false);
          $('.btn-edit-password').html(`Enviar`);
        });
      }, 3000);
    }).catch(error => {
      if (error.response) {
        if(error.response.data) {
          showError(error.response.data.message);
        }
      }
      $('.btn-edit-password').prop('disabled', false);
      $('.btn-edit-password').html(`Enviar`);
    });
  });

  function showError(message) {
    $('.message-error').show();
    $('.message-error').removeClass('success');
    $('.message-error').html(message);
    setTimeout(() => {
      $('.message-error').fadeOut(250);
    }, 10000);
  };
});
