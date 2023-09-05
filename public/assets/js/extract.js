var newDate = new Date();
var dateMin = new Date();
dateMin.setDate(dateMin.getDate() - 5);

var dateMax = new Date();
dateMax.setDate(dateMax.getDate() + 3);

$('#inputData').val(formatDate(newDate));
$('#inputData').attr('min', formatDate(dateMin));
$('#inputData').attr('max', formatDate(dateMax));

function formatDate(date) {
  var year = date.getFullYear();
  var month = (date.getMonth() + 1).toString().padStart(2, '0');
  var day = date.getDate().toString().padStart(2, '0');
  return year + '-' + month + '-' + day;
}

var loading = `
  <div class="loading-div">
    <i class="fas fa-spinner fa-pulse"></i>
  </div>`;

$('.content-extract').html(loading);

let dateBet = $('#inputData').val();

function groupsExtract(dateBet) {
  $('.content-extract').html(loading);
  axios.get(`./api/transaction/groups/${dateBet}`).then(response => {
      let data = response.data

      let depositField = "";
      let prizeField = "";
      let bonusField = "";
      let withdrawField = "";
      let betField = "";
      let reversalField = "";

      depositField += `
    <details data-type="${data[3].campo_transacao_cod_tipo}" class="details-realeases">
        <summary class="summary-releases add">
            <div>
                <span class="status-releases add">
                    <i class="fas fa-dollar-sign"></i>
                </span>
                <div class="realeses-arrow">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <h3>
                    <strong>Depósitos</strong>
                    <small>${data[3].campo_transacao_quantidade} Depósitos</small>
                </h3>
                <span class="value-release-total add">+ R$ ${data[3].campo_transacao_total}</span>
            </div>
        </summary>
        <div class="id-${data[3].campo_transacao_cod_tipo} container-info-releases add"></div>
    </details>`;

      prizeField += `
    <details data-type="${data[0].campo_transacao_cod_tipo}" class="details-realeases">
        <summary class="summary-releases add">
            <div>
                <span class="status-releases add">
                    <i class="fas fa-award"></i>
                </span>
                <div class="realeses-arrow">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <h3>
                    <strong>Prêmios</strong>
                    <small>${data[0].campo_transacao_quantidade} Prêmios</small>
                </h3>
                <span class="value-release-total add">+ R$ ${data[0].campo_transacao_total}</span>
            </div>
        </summary>
        <div class="id-${data[0].campo_transacao_cod_tipo} container-info-releases add"></div>
    </details>`;

      bonusField += `
    <details data-type="${data[2].campo_transacao_cod_tipo}" class="details-realeases">
        <summary class="summary-releases add">
            <div>
                <span class="status-releases add">
                    <i class="fas fa-ticket-alt"></i>
                </span>
                <div class="realeses-arrow">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <h3>
                    <strong>Bônus</strong>
                    <small>${data[2].campo_transacao_quantidade} Bônus</small>
                </h3>
                <span class="value-release-total add">+ R$ ${data[2].campo_transacao_total}</span>
            </div>
        </summary>
        <div class="id-${data[2].campo_transacao_cod_tipo} container-info-releases add"></div>
    </details>`;

      reversalField += `
  <details data-type="${data[4].campo_transacao_cod_tipo}" class="details-realeases">
      <summary class="summary-releases add">
          <div>
              <span class="status-releases add">
                  <i class="fas fa-redo"></i>
              </span>
              <div class="realeses-arrow">
                  <i class="fas fa-chevron-down"></i>
              </div>
              <h3>
                  <strong>Estornos</strong>
                  <small>${data[4].campo_transacao_quantidade} Estornos</small>
              </h3>
              <span class="value-release-total add">+ R$ ${data[4].campo_transacao_total}</span>
          </div>
      </summary>
      <div class="id-${data[4].campo_transacao_cod_tipo} container-info-releases"></div>
  </details>`;

      withdrawField += `
    <details data-type="${data[5].campo_transacao_cod_tipo}" class="details-realeases">
        <summary class="summary-releases remove">
            <div>
                <span class="status-releases remove">
                    <i class="fas fa-sign-out-alt"></i>
                </span>
                <div class="realeses-arrow">
                    <i class="fas fa-chevron-down"></i>
                </div>
                <h3>
                    <strong>Saques</strong>
                    <small>${data[5].campo_transacao_quantidade} saques</small>
                </h3>
                <span class="value-release-total remove">- R$ ${data[5].campo_transacao_total}</span>
            </div>
        </summary>
        <div class="id-${data[5].campo_transacao_cod_tipo} container-info-releases"></div>
    </details>`;

      betField += `
  <details data-type="${data[1].campo_transacao_cod_tipo}" class="details-realeases">
      <summary class="summary-releases remove">
          <div>
              <span class="status-releases remove">
                  <i class="fas fa-dice"></i>
              </span>
              <div class="realeses-arrow">
                  <i class="fas fa-chevron-down"></i>
              </div>
              <h3>
                  <strong>Apostas</strong>
                  <small>${data[1].campo_transacao_quantidade} Apostas</small>
              </h3>
              <span class="value-release-total remove">- R$ ${data[1].campo_transacao_total}</span>
          </div>
      </summary>
      <div class="id-${data[1].campo_transacao_cod_tipo} container-info-releases"></div>
  </details>`;

      $("#pills-all").html(depositField + prizeField + bonusField + reversalField + withdrawField + betField);
    })
    .catch(error => {});
}
groupsExtract(dateBet);

$('#inputData').change(function () {
  dateBet = $(this).val();
  groupsExtract(dateBet);
});

$(document).on('click', '.details-realeases', function () {
  $(this).children().last().html(`<i class="fas fa-spinner fa-spin"></i>`);
  var dataType = $(this).data("type");
  axios.get(`./api/transaction/list/${dateBet}/` + dataType).then(response => {
    let data = response.data
    var rowTransactions = "";
    if (data.length > 0) {
      data.forEach((element) => {
        switch (element.campo_transacao_cod_tipo) {
          // DEPOSITO
          case 1:
            rowTransactions += `
                    <div class="content-info-releases">
                        <div class="info-transaction">
                            <span>ID</span>
                            <span>#${element.campo_transacao_ident}</span>
                        </div>
                        <div class="info-date">
                            <span>DATA</span>
                            <span>${element.campo_transacao_data.split(" ")[0].split('-').reverse().join('/')}</span>
                        </div>
                        <div class="info-hour">
                            <span>HORA</span>
                            <span>${element.campo_transacao_data.split(' ')[1].split(".")[0]}</span>
                        </div>
                        <div class="info-status">
                            <span>STATUS</span>
                            <span title="Sucesso!">🟢</span>
                        </div>
                        <div class="info-value">
                            <span>VALOR</span>
                            <span>+ R$ ${element.campo_transacao_valor}</span>
                        </div>
                    </div>
                    `
            break;

            // SAQUE
          case 2:
            if (element.status == 1) {
              var statusWithdraw = "🟡";
            } else {
              var statusWithdraw = "🟢"
            }
            rowTransactions += `
                    <div class="content-info-releases">
                        <div class="info-transaction">
                            <span>ID</span>
                            <span>#${element.campo_transacao_ident}</span>
                        </div>
                        <div class="info-date">
                            <span>DATA</span>
                            <span>${element.campo_transacao_data.split(" ")[0].split('-').reverse().join('/')}</span>
                        </div>
                        <div class="info-hour">
                            <span>HORA</span>
                            <span>${element.campo_transacao_data.split(' ')[1].split(".")[0]}</span>
                        </div>
                        <div class="info-status">
                            <span>STATUS</span>
                            <span>${statusWithdraw}</span>
                        </div>
                        <div class="info-value">
                            <span>VALOR</span>
                            <span>- R$ ${element.campo_transacao_valor}</span>
                        </div>
                    </div>
                    `

            break;

            // APOSTAS
          case 100:
            rowTransactions += `
                        <div class="content-info-releases">
                            <div class="info-transaction">
                                <span>ID</span>
                                <span>#${element.campo_jogo_ident}</span>
                            </div>
                            <div class="info-date">
                                <span>DATA</span>
                                <span>${element.campo_transacao_data.split(" ")[0].split('-').reverse().join('/')}</span>
                            </div>
                            <div class="info-hour">
                                <span>HORA</span>
                                <span>${element.campo_transacao_data.split(' ')[1].split(".")[0]}</span>
                            </div>
                            <div class="info-status">
                                <span>NÚMEROS</span>
                                <span>${element.campo_jogo_palpites}</span>
                            </div>
                            <div class="info-value">
                                <span>VALOR</span>
                                <span>- R$ ${element.campo_transacao_valor}</span>
                            </div>
                        </div>
                        `
            break;

            // ESTORNOS
          case 101:
            rowTransactions += `
                        <div class="content-info-releases">
                            <div class="info-transaction">
                                <span>ID</span>
                                <span>#${element.campo_transacao_ident}</span>
                            </div>
                            <div class="info-date">
                                <span>DATA</span>
                                <span>${element.campo_transacao_data.split(" ")[0].split('-').reverse().join('/')}</span>
                            </div>
                            <div class="info-hour">
                                <span>HORA</span>
                                <span>${element.campo_transacao_data.split(' ')[1].split(".")[0]}</span>
                            </div>
                            <div class="info-status">
                                <span>STATUS</span>
                                <span>🟢</span>
                            </div>
                            <div class="info-value">
                                <span>VALOR</span>
                                <span>+ R$ ${element.campo_transacao_valor}</span>
                            </div>
                        </div>
                        `
            break;

            // PRÊMIOS
          case 102:

            rowTransactions += `
                    <div class="content-info-releases">
                        <div class="info-transaction">
                            <span>ID</span>
                            <span>${element.campo_transacao_ident}</span>
                        </div>
                        <div class="info-date">
                            <span>DATA</span>
                            <span>${element.campo_transacao_data.split(" ")[0].split('-').reverse().join('/')}</span>
                        </div>
                        <div class="info-hour">
                            <span>HORA</span>
                            <span>${element.campo_transacao_data.split(' ')[1].split(".")[0]}</span>
                        </div>
                        <div class="info-status">
                            <span>STATUS</span>
                            <span title="Ganhou!">🏆</span>
                        </div>
                        <div class="info-value">
                            <span>VALOR</span>
                            <span>+ R$ ${element.campo_transacao_valor}</span>
                        </div>
                    </div>
                    `

            break;

            // BONUS
          case 4:
            rowTransactions += `
                        <div class="content-info-releases">
                            <div class="info-transaction">
                                <span>ID</span>
                                <span>#${element.campo_transacao_ident}</span>
                            </div>
                            <div class="info-date">
                                <span>DATA</span>
                                <span>${element.campo_transacao_data.split(" ")[0].split('-').reverse().join('/')}</span>
                            </div>
                            <div class="info-hour">
                                <span>HORA</span>
                                <span>${element.campo_transacao_data.split(' ')[1].split(".")[0]}</span>
                            </div>
                            <div class="info-status">
                                <span>STATUS</span>
                                <span title="Sucesso!">🟢</span>
                            </div>
                            <div class="info-value">
                                <span>VALOR</span>
                                <span>+ R$ ${element.campo_transacao_valor}</span>
                            </div>
                        </div>
                        `;
            break;

          default:
            break;
        }
      });
    } else {
      rowTransactions = `
            <div class="content-info-releases" style="justify-content: center;">
                <h1 style="font-size: 1rem;">Nenhum resultado disponível.</h1>
            </div
            `
    }
    $(".id-" + dataType).html(rowTransactions);
    console.log(rowTransactions);

  }).catch(error => {});
});
