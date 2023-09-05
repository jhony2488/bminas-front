function listCoupons() {
  axios.get('/api/coupon/list_bonus').then(response => {
    let data = response.data
    var rowTable = "";
    data.forEach(element => {
        newAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
        }).format(element.campo_cupom_valor);
        rowTable += `
        <tr>
            <td><span style="color:#fff;">${element.campo_nome_usuario}</span></td>
            <td><span style="color:#fff;">${element.campo_cupom_data_hora_resgate.split(' ')[0].split('-').reverse().join('/')} ${element.campo_cupom_data_hora_resgate.split(' ')[1]}</span></td>
            <td><span style="color:#fff;">+ ${newAmount}</span></td>
            <td><span style="color: var(--primary);">${element.campo_cupom_nome}</span></td>
        </tr>
        `;
    });

    $("#listCoupons tbody").html(rowTable);
    $('#listCoupons').DataTable({
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
        emptyTable: "Nenhum cupom resgatado até o momento!",
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

listCoupons();
