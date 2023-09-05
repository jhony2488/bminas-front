document
  .getElementById('logar')
  .addEventListener('click', async function (event) {
    event.preventDefault();

    const username = document.getElementById('myusername').value;
    const password = document.getElementById('mypassword').value;
    //const rememberMe = document.getElementById('ckb1').value;

    const data = {
      campo_nome_usuario: username,
      campo_senha: password,
      //  campo_relembrar: rememberMe
    };

    try {
      let array_erros = [];
      let input = document.querySelectorAll('[required]');
      let error = document.getElementById('msg-error');
      let len = input.length;
      error.style.display =
        error.style.display === 'inline' ? 'none' : error.style.display;

      for (var i = 0; i < len; i++) {
        if (!input[i].value) {
          array_erros.push(input[i]);
          input[i].parentElement.classList.add('auth-invalid-input');

          Swal.fire({
            toast: true,
            icon: 'error',
            position: 'top-end',
            showConfirmButton: false,
            timer: 1600,
            title: 'Preencha os campos e tente novamente!',
          });
        } else {
          console.log(input[i] + 'valid');
          input[i].parentElement.classList.remove('auth-invalid-input');
        }
      }

      if (array_erros.length === 0) {
        const response = await fetch('/api_admin/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (responseData.status == 200) {
          sessionStorage.setItem('data', JSON.stringify({ nome: responseData.name, level: responseData.post, nToken: 'HkjEpit34ErLHGfre23IOr/'+responseData.level }));
          Swal.fire({
            toast: true,
            icon: 'success',
            showConfirmButton: false,
            position: 'top-end',
            timer: 1600,
            title: responseData.message,
          });

          setTimeout(function () {
            window.location.href = '/admin/info';
          }, 1600);
        } else {
          error.style.display =
            error.style.display === 'none' ? 'inline' : error.style.display;
          // Swal.fire({
          //   toast: true,
          //   icon: "error",
          //   position: 'top-end',
          //   showConfirmButton: false,
          //   timer: 1500,
          //   title: responseData.message
          // })
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
