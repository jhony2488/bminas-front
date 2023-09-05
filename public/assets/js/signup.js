$(document).ready(function () {

  var indicationUser = "";

  function indication_param() {
    const url_atual = window.location.href;
    const paramUrl = url_atual.split("?")[1];
    const params = new URLSearchParams(paramUrl);
    const indication = params.get("indication");
    if (indication) {
      const html = `<p>Usuário: <strong style="text-shadow: 0 0px 30px #5ad1cd;">${indication}</strong> indicou você. </p>`;
      $('.header-signup h2').append(html);
      indicationUser = indication;
    }
  }

  indication_param();

  $('.input-login').focus(function() {
    $(this).siblings('.label-text').addClass('active');
  });

  $('.input-login').blur(function() {
    $(this).siblings('.label-text').removeClass('active');
  });

  $('#userNick').mask("AAAAAAAAAAAAAAAAAAAA");
  $('#userCell').mask("(99) 9 9999-9999");
  $('#dateOfBirth').mask("99/99/9999");

  function validate_age(data_nasc) {
    let nasc = data_nasc.split("/").map(Number);
    let formattedDate;

    if (data_nasc.length < 10) {
      $('#dateOfBirth').addClass('is-invalid');
      showError("Data incompleta.");
      return false;
    } else if (nasc[2] < 1910 || nasc[0] < 1 || nasc[0] > 31 || nasc[1] < 1 || nasc[1] > 12) {
      $('#dateOfBirth').addClass('is-invalid');
      showError("Data de nascimento inválida.");
      return false;
    } else {
      formattedDate = `${nasc[2]}-${nasc[1]}-${nasc[0]}`;
      let currentDate = new Date();
      let birthDate = new Date(formattedDate);
      let age = currentDate.getFullYear() - birthDate.getFullYear();
      let monthDiff = currentDate.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        $('#dateOfBirth').addClass('is-invalid');
        showError("Proibido menor de 18 anos.");
        return false;
      }

      showValid('#dateOfBirth');
    }

    return formattedDate;
  };

  function showError(message) {
    $('.message-error').show();
    $('.message-error').removeClass('success');
    $('.message-error').html(message);
    setTimeout(() => {
      $('.message-error').fadeOut(250);
    }, 10000);
  };

  function showValid(elementId) {
    $(elementId).removeClass('invalid').addClass('valid');
  };

  $('.btn-signup').click(function () {
    let fistName = $('#firstName').val();
    let secondName = $('#secondName').val();
    let dateOfBirth = $('#dateOfBirth').val();
    let userCell = $('#userCell').val();
    let userNick = $('#userNick').val();
    let userPassword = $('#userPassword').val();
    let repeatPassword = $('#userRepeatPassord').val();
    let userEmail = $('#userEmail').val() || 'sem';
    let userGender = $('#selectGender').val();

    let fields = [
      { name: 'firstName', value: fistName },
      { name: 'secondName', value: secondName },
      { name: 'dateOfBirth', value: dateOfBirth },
      { name: 'userCell', value: userCell },
      { name: 'userNick', value: userNick },
      { name: 'selectGender', value: repeatPassword },
      { name: 'userPassword', value: userPassword },
      { name: 'userRepeatPassord', value: repeatPassword },
    ];

    $('.input-login').removeClass('is-invalid');

    let hasError = false;
    fields.forEach(function (field) {
      if (!field.value) {
        $('#' + field.name).addClass('is-invalid');
        hasError = true;
      }
    });

    let formattedDate = validate_age(dateOfBirth);

    if (!formattedDate) {
      return;
    }

    if (userPassword !== repeatPassword) {
      $('#userPassword').addClass('is-invalid');
      $('#userRepeatPassord').addClass('is-invalid');
      showError("As senhas não são coincidentes!");
    }

    if (hasError) {
      showError('Preencha todos os campos obrigatórios.');
      return;
    }

    let infoRegister = '';

    if (indicationUser) {
      infoRegister = {
        campo_primeiro_nome: fistName,
        campo_ultimo_nome: secondName,
        campo_data_nascimento: formattedDate,
        campo_telefone: userCell,
        campo_nome_usuario: userNick,
        campo_senha: userPassword,
        campo_genero: userGender,
        campo_email: userEmail,
        campo_indicacao: indicationUser
      }
    } else {
      infoRegister = {
        campo_primeiro_nome: fistName,
        campo_ultimo_nome: secondName,
        campo_data_nascimento: formattedDate,
        campo_telefone: userCell,
        campo_nome_usuario: userNick,
        campo_senha: userPassword,
        campo_genero: userGender,
        campo_email: userEmail
      }
    }

    axios.post(`./api/users/register`, infoRegister).then(response => {

      $('.modal-signup').removeClass('d-none');
      setTimeout(() => {
        $('.modal-signup').addClass('open');
      }, 1);

      $('.btn-close-modal').click(function () {
        $('.modal-signup').removeClass('open');
        setTimeout(() => {
          $('.modal-signup').addClass('d-none');
        }, 500);
      });

      $('.btn-go').click(function () {
        axios.post('/api/users/login', {
          campo_nome_usuario: $("#userNick").val(),
          campo_senha: $("#userPassword").val(),
        }).then(response => {
            window.location.href="/jogar"
          }).catch(error => {
            $('.message-error').html(`${error.response.data.message}`);
          });
      });

    }).catch(error => {
      let errorInput = error.response.data;
      if (errorInput.inputs.campo_nome_usuario) {
        $('#userNick').addClass('is-invalid');
        showError(errorInput.inputs.campo_nome_usuario[0]);
        return;
      }
      if (errorInput.inputs.campo_telefone) {
        $('#userCell').addClass('is-invalid');
        showError(errorInput.inputs.campo_telefone[0]);
        return;
      }
      if (errorInput.inputs.campo_email) {
        $('#userEmail').addClass('is-invalid');
        showError(errorInput.inputs.campo_email[0]);
        return;
      }

      if (errorInput.inputs.campo_senha) {
        $('#userPassword').addClass('is-invalid');
        showError(errorInput.inputs.campo_senha[0]);
        return;
      }
    });
  });





});

