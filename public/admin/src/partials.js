import navbarTemplate from '../../../view/admin/inc/navbar.html';
import sidebarTemplate from '../../../view/admin/inc/sidebar.html';
import footerTemplate from '../../../view/admin/inc/footer.html';

// Renderizar os templates
document.getElementById('navbar-content').innerHTML = navbarTemplate;
document.getElementById('sidebar-content').innerHTML = sidebarTemplate;
document.getElementById('footer-content').innerHTML = footerTemplate;

// const resultsMenu = document.getElementById('resultsMenu');
const resultsNavMenu = document.getElementById('resultsNavMenu');
const reportsMenu = document.getElementById('reportsMenu');
const transactionsMenu = document.getElementById('transactionsMenu');
const transactionsNavMenu = document.getElementById('transactionsNavMenu');
const lotterysMenu = document.getElementById('lotterysMenu');
const titleMenu = document.getElementById('divMenu');
const managerMenu = document.getElementById('managerMenu');

if (checkSessionLevel() === true) {
	// resultsMenu.style.display = 'block';
	resultsNavMenu.style.display = 'block';
	reportsMenu.style.display = 'block';
	transactionsMenu.style.display = 'block';
	lotterysMenu.style.display = 'block';
	transactionsNavMenu.style.display = 'block';
	titleMenu.style.display = 'block';
	managerMenu.style.display = 'block';
}

function checkSessionLevel() {
	const dataString = sessionStorage.getItem('data');

	if (dataString) {
		try {
	    const data = JSON.parse(dataString);
	      
	    if (data.nToken) {
	      const levelParts = data.nToken.split('/');
	        
	      if (levelParts[1] === '3') {
	        return true;
	      }
	    }
	  } catch (error) {
	    // Lide com erros de análise JSON
	    console.error('Erro ao analisar os dados do sessionStorage:', error);
	  }
	} else{
		fetch('/api_admin/users/logout', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
		})
		.then(response => response.json())
		.then(response => {

			if (response.status == 200) {
      // Swal.fire({
      //   toast: true,
      //   type: 'info',
      //   showConfirmButton: false,
      //   position: 'top-end',
      //   timer: 1800,
      //   title: 'Você foi desconectado.',
      // });

      setTimeout(function () {
        window.location.href = '/admin/login';
      }, 1400);
    }
     })
      .catch(error => {
    	  console.log(error);
     })
      .finally(() => {
    });
	}
}

const logoLink = document.getElementById('logo-link');
const logoMiniLink = document.getElementById('logo-link-mini');
const homeLink = document.getElementById('home-link');
const levelUser = checkSessionLevel();
const targetHref = levelUser ? '/admin/home' : '/admin/info';

logoLink.href = targetHref;
logoMiniLink.href = targetHref;
homeLink.href = targetHref;

const dataSession = sessionStorage.getItem('data');
const data = JSON.parse(dataSession);
let nomeParts = data.nome.split(' ');

let nomeExibicao = '';
if (nomeParts.length >= 2) {
	nomeExibicao = nomeParts[0] + ' ' + nomeParts[nomeParts.length - 1];
} else {
	nomeExibicao = data.nome;
}

function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = text;
  }
}

setElementText('adm_name', nomeExibicao);
setElementText('adm_name_desc', nomeExibicao);
setElementText('adm_name_side', nomeExibicao);

const levelExibicao = data.level ? data.level : 'Não informado';
setElementText('adm_level_nav', levelExibicao);
setElementText('adm_level_side', levelExibicao);

// Notificações
fetch('/api_admin/users/notifications', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json'
	},
})
	.then(response => response.json())
	.then(response => {

		const notDeposit = document.getElementById('not_deposit');
		const notWithdraw = document.getElementById('not_withdraw');
		const notUsers = document.getElementById('not_users');
		const notUsersNews = document.getElementById('not_nusers');
		const notUsersBirth = document.getElementById('not_birthusers');

		if (response[0].new_deposits_count > 0) {
	    notDeposit.textContent = response[0].new_deposits_count;
	    notDeposit.classList.add('count'); 
	   	notDeposit.style.display = 'block';
		} else {
	    notDeposit.textContent = '';
	    notDeposit.classList.remove('count');
		}

		if (response[0].new_users_count > 0) {
	    notUsers.textContent = response[0].new_users_count;
	    notUsers.classList.add('count'); 
	   	notUsers.style.display = 'block';
		} else {
	    notUsers.textContent = '';
	    notUsers.classList.remove('count');
		}

		if (response[0].new_birthusers_count > 0) {
	    notUsersBirth.textContent = response[0].new_birthusers_count;
	    notUsersBirth.classList.add('count'); 
	   	notUsersBirth.style.display = 'block';
		} else {
	    notUsersBirth.textContent = '';
	    notUsersBirth.classList.remove('count');
		}

		if (response[0].new_withdraws_count > 0) {
	    notWithdraw.textContent = response[0].new_withdraws_count;
	    notWithdraw.classList.add('count'); 
	   	notWithdraw.style.display = 'block';
		} else {
	    notWithdraw.textContent = '';
	    notWithdraw.classList.remove('count');
		}
   })
   	.catch(error => {
    	console.log(error);
    })
    .finally(() => {
  });