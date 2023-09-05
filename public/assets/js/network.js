var newDate = new Date();
var dateMin = new Date();
dateMin.setDate(dateMin.getDate() - 30);

var dateMax = new Date();
dateMax.setDate(dateMax.getDate() + 0);

$('#inputDataStart').val(formatDate(newDate));
$('#inputDataStart').attr('min', formatDate(dateMin));
$('#inputDataStart').attr('max', formatDate(dateMax));

$('#inputDataEnd').val(formatDate(newDate));
$('#inputDataEnd').attr('min', formatDate(dateMin));
$('#inputDataEnd').attr('max', formatDate(dateMax));

function formatDate(date) {
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, '0');
  var day = date.getDate().toString().padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// var loading = `
//   <div class="loading-div">
//     <i class="fas fa-spinner fa-pulse"></i>
//   </div>`;

// $('#listNetwork').html(loading);

let campo_data_inicio = $('#inputDataStart').val();
let campo_data_fim = $('#inputDataEnd').val();

$('#inputDataStart').change(function () {
  campo_data_inicio
  campo_data_fim
  networkInfo(campo_data_inicio, campo_data_fim);
});

$('#inputDataEnd').change(function () {
  campo_data_inicio
  campo_data_fim
  networkInfo(campo_data_inicio, campo_data_fim);
});

function networkInfo(campo_data_inicio, campo_data_fim) {

  let infoIndication = {
    campo_data_inicio: $('#inputDataStart').val(),
    campo_data_fim: $('#inputDataEnd').val(),
  }

  $('#listNetwork').DataTable().destroy()

  axios.post('/api/transaction/indication/', infoIndication).then(response => {
    let data = response.data
    // inicio
    // fim
    var rowTable = "";
    data.forEach(element => {
        valueUser = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
        }).format(element.campo_valor_deposito);
        valueComission = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
          }).format(element.campo_valor_bonus);
        rowTable += `
        <tr>
        <td><span style="color:#fff;">${element.created_at.split(' ')[0].split('-').reverse().join('/')} ${element.created_at.split(' ')[1].split('.')[0]}</span></td>
        <td><span style="color:#fff;">${element.username}</span></td>
            <td><span style="color: var(--primary);">+ ${valueUser}</span></td>
            <td><span style="color: var(--primary);">+ ${valueComission}</span></td>
        </tr>
        `;
    });
    $("#listNetwork tbody").html(rowTable);
    $('#listNetwork').DataTable({
      pageLength: 10,
      paging: true,
      ordering: false,
      stateSave: true,
      lengthChange: false,
      paging: true,
      responsive: true,
      aaSorting: [],
      language: {
        processing: "Processando...",
        search: "Pesquisar:",
        lengthMenu: "Mostrar _MENU_ registros por página",
        info: "Mostrando _START_ até _END_ de _TOTAL_ registros",
        infoEmpty: "Mostrando 0 até 0 de 0 registros",
        infoFiltered: "(filtrados de _MAX_ registros no total)",
        infoPostFix: "",
        loadingRecords: "Carregando...",
        zeroRecords: "Nenhum registro encontrado",
        emptyTable: "Nenhum usuário até o momento!",
        paginate: {
          first: "Primeiro",
          previous: "Anterior",
          next: "Próximo",
          last: "Último"
        },
        aria: {
          sortAscending: ": Ativar para classificar a coluna em ordem crescente",
          sortDescending: ": Ativar para classificar a coluna em ordem decrescente"
        },
        select: {
          rows: {
            _: "%d linhas selecionadas",
            0: "Nenhuma linha selecionada",
            1: "1 linha selecionada"
          }
        }
      }
    });
  }).catch(error => {
  });
}

networkInfo(campo_data_inicio, campo_data_fim);
