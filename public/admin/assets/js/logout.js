$(document).on('click', '#logout', async function(e) {
  e.preventDefault();

  try {
    const response = await fetch('/api_admin/users/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseData = await response.json();
    if (responseData.status == 200) {
      Swal.fire({
        toast: true,
        type: 'success',
        showConfirmButton: false,
        position: 'top-end',
        timer: 1800,
        title: responseData.message,
      });

      setTimeout(function () {
        window.location.href = '/admin/login';
      }, 1400);
    }
  } catch (error) {
    console.error(error);
  }
});
