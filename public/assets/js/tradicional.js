const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 9999,
  timerProgressBar: true,
  didOpen: toast => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

let controlDivisor = false;
let listLotteriesSaves = [];

let countDate = 0;

const divAll = $('.container-steps');
const divModalities = $('.container-modalities');
const divGroups = $('.container-groups');
const divKeyboard = $('.container-keyboard');
const divLotteries = $('.container-lotteries');
const divPlacements = $('.container-placements');
const divPurchase = $('.container-purchase');

function calcBet(guesses, lotteries, placements) {}

function calcTotalBets() {
  let valor = $('#valueBet').val();
  valor = valor.replaceAll('.', '');
  valor = valor.replaceAll(',', '.');
  valor = parseFloat(valor);
  const divisor = $('#divideStakes').is(':checked');
  if (divisor) {
    const newValueGame = parseFloat(
      (valor / selectedPlacements.length).toFixed(5),
    );
    selectedPlacements.forEach(
      item => (item.campo_valor_total_jogo = newValueGame),
    );
    controlDivisor = true;
  } else {
    const countLotteries =
      selectedLotteries.length === 0 ? 1 : selectedLotteries.length;
    const countGuesses = selectedGuess.length;
    controlDivisor = false;
    const valoreal = valor * countLotteries * countGuesses;
    selectedPlacements.forEach(
      item => (item.campo_valor_total_jogo = valoreal),
    );
  }
  let resultCalc;
  let sum;

  resultCalc = selectedPlacements.map(item => {
    return item.campo_valor_total_jogo;
  });

  sum = resultCalc.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  }, 0);
  sum = Math.round(sum * 100) / 100;
  $('.money-total').text(
    sum.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
}

var classShowTypeGame;

var selectedModalities;
var identifyModalitie;

var numberString = '';

var totalSelectedGuess = 0;
var selectedAnimals = [];
var selectedGuess = [];

var selectedLotteries = [];
var selectedPlacements = [];

var valueMin = '';
var valueMax = '';
var inputType = '';
var numbersToInsertGroup;

var animalList = {
  1: {
    name: 'Avestruz',
    sequencial: ['01', '02', '03', '04'],
  },
  2: {
    name: 'Águia',
    sequencial: ['05', '06', '07', '08'],
  },
  3: {
    name: 'Burro',
    sequencial: ['09', '10', '11', '12'],
  },
  4: {
    name: 'Borboleta',
    sequencial: ['13', '14', '15', '16'],
  },
  5: {
    name: 'Cachorro',
    sequencial: ['17', '18', '19', '20'],
  },
  6: {
    name: 'Cabra',
    sequencial: ['21', '22', '23', '24'],
  },
  7: {
    name: 'Carneiro',
    sequencial: ['25', '26', '27', '28'],
  },
  8: {
    name: 'Camelo',
    sequencial: ['29', '30', '31', '32'],
  },
  9: {
    name: 'Cobra',
    sequencial: ['33', '34', '35', '36'],
  },
  10: {
    name: 'Coelho',
    sequencial: ['37', '38', '39', '40'],
  },
  11: {
    name: 'Cavalo',
    sequencial: ['41', '42', '43', '44'],
  },
  12: {
    name: 'Elefante',
    sequencial: ['45', '46', '47', '48'],
  },
  13: {
    name: 'Galo',
    sequencial: ['49', '50', '51', '52'],
  },
  14: {
    name: 'Gato',
    sequencial: ['53', '54', '55', '56'],
  },
  15: {
    name: 'Jacaré',
    sequencial: ['57', '58', '59', '60'],
  },
  16: {
    name: 'Leão',
    sequencial: ['61', '62', '63', '64'],
  },
  17: {
    name: 'Macaco',
    sequencial: ['65', '66', '67', '68'],
  },
  18: {
    name: 'Porco',
    sequencial: ['69', '70', '71', '72'],
  },
  19: {
    name: 'Pavão',
    sequencial: ['73', '74', '75', '76'],
  },
  20: {
    name: 'Peru',
    sequencial: ['77', '78', '79', '80'],
  },
  21: {
    name: 'Touro',
    sequencial: ['81', '82', '83', '84'],
  },
  22: {
    name: 'Tigre',
    sequencial: ['85', '86', '87', '88'],
  },
  23: {
    name: 'Urso',
    sequencial: ['89', '90', '91', '92'],
  },
  24: {
    name: 'Veado',
    sequencial: ['93', '94', '95', '96'],
  },
  25: {
    name: 'Vaca',
    sequencial: ['97', '98', '99', '00'],
  },
};

// VALORRES INICIAS
function initialValuesSteps() {
  divAll.hide(100);
  $('.btn-modalities').removeClass('active');
  $('.btn-back').hide();
  $('.content-bets').empty();
  $('#listItemsGame').hide();
}

function setStep(
  classStepShow,
  classStepHide,
  classNext,
  classBack,
  previousHeader,
  currentHeader,
  removePreviousHeader,
  removeCurrentHeader,
  type = 1,
) {
  const divNextStep = $('.next-step');
  const btnBackStep = $('.btn-back');
  const btnNextStep = $('.btn-next');

  $(classStepShow).show(200);
  $(classStepHide).hide(100);

  $(previousHeader).addClass('finished');
  $(currentHeader).addClass('active');
  $(removePreviousHeader).removeClass('finished');
  $(removeCurrentHeader).removeClass('active');
  if (type !== 0) {
    divNextStep.hide(250);
  }

  btnNextStep.attr('data-nextstep', classNext);
  btnBackStep.attr('data-backstep', classBack);
}

$('.btn-next').click(function () {
  const nextStep = $(this).attr('data-nextstep');
  nextStepChange(nextStep);
});

$('.btn-back').click(function () {
  const backStep = $(this).attr('data-backstep');
  backStepChange(backStep);
});

function backStepChange(data) {
  switch (data) {
    case '.container-modalities':
      initialValuesSteps();
      cleanGame();
      setStep(
        '.container-modalities',
        classShowTypeGame,
        classShowTypeGame,
        '.container-modalities',
        '',
        '.contents-progress.modalities',
        '.contents-progress.modalities',
        '.contents-progress.guess',
        1,
      );
      break;
    case '.container-groups':
    case '.container-keyboard':
      enableButtonNext();
      setStep(
        classShowTypeGame,
        '.container-lotteries',
        '.container-lotteries',
        '.container-modalities',
        '.contents-progress.guess',
        '.contents-progress.lotteries',
        '.contents-progress.guess',
        '.contents-progress.lotteries',
        0,
      );
      break;
    case '.container-lotteries':
      // stepLottery();
      enableButtonNext();
      setStep(
        '.container-lotteries',
        '.container-placements',
        '.container-placements',
        classShowTypeGame,
        '.contents-progress.lotterie',
        '.contents-progress.placements',
        '.contents-progress.lotteries',
        '.contents-progress.placements',
        0,
      );
      verifyCheckLotteries();
      break;
    case '.container-placements':
      setStep(
        '.container-placements',
        '.container-purchase',
        '.container-purchase',
        '.container-lotteries',
        '.contents-progress.placements',
        '.contents-progress.bet',
        '.contents-progress.placements',
        '.contents-progress.bet',
        0,
      );
      enableButtonNext();
      break;
    default:
      break;
  }
}

function nextStepChange(data) {
  switch (data) {
    case '.container-modalities':
      disableButtonNext();
      setStep(
        '.container-modalities',
        '',
        classShowTypeGame,
        '.container-modalities',
        '',
        '.contents-progress.modalities',
      );
      break;
    case '.container-groups':
    case '.container-keyboard':
      disableButtonNext();
      setStepsModalities();
      break;
    case '.container-lotteries':
      $('.content-lotteries').html(
        `<div class="spinner-loteries"><i class="fas fa-spinner fa-pulse"></i></div>`,
      );
      stepLottery();
      setStep(
        '.container-lotteries',
        classShowTypeGame,
        '.container-placements',
        '.container-groups',
        '.contents-progress.guess',
        '.contents-progress.lotteries',
        undefined,
        undefined,
        0,
      );
      break;
    case '.container-placements':
      enableButtonNext();
      setStep(
        '.container-placements',
        '.container-lotteries',
        '.container-purchase',
        '.container-lotteries',
        '.contents-progress.lotteries',
        '.contents-progress.placements',
        undefined,
        undefined,
        0,
      );
      // verificarCheckboxLot();
      break;
    case '.container-purchase':
      // verificarCheckboxPlace();
      enableButtonNext();
      setStep(
        '.container-purchase',
        '.container-placements',
        '.container-purchase',
        '.container-placements',
        '.contents-progress.placements',
        '.contents-progress.bet',
      );
      areaPurchase();
      break;
    default:
      break;
  }
}

function cleanGame() {
  selectedGuess = [];
  selectedLotteries = [];
  selectedModalities = undefined;
  selectedPlacements = [];
  listLotteriesSaves = [];
  numberString = '';
  getLottery = false;
  $('.select-qnt-game').remove();
  $('.money-total').text(
    (0.0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
}

function setStepsModalities() {
  const btnModalitieActive = $('.btn-modalities.active').data('modalidade');

  if (btnModalitieActive === 1) {
    // Ação para o botão "Grupo"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Grupos</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione um ou mais Grupos`,
    );
  }

  if (btnModalitieActive === 2) {
    // Ação para o botão "Milhar"
    $('.header-keyboard.header-games .title').html(
      `Insira sua <span>Milhar</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira uma ou mais Milhares`,
    );
  }

  if (btnModalitieActive === 3) {
    // Ação para o botão "Milhar Centena"
    $('.header-keyboard.header-games .title').html(
      `Insira sua <span>Milhar Centena</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira uma ou mais Milhares Centenas`,
    );
  }

  if (btnModalitieActive === 4) {
    // Ação para o botão "Milhar Combinada"
    $('.header-keyboard.header-games .title').html(
      `Insira sua <span>Milhar Combinada</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira uma ou mais Milhares Combinadas`,
    );
  }

  if (btnModalitieActive === 6) {
    // Ação para o botão "Centena"
    $('.header-keyboard.header-games .title').html(
      `Insira sua <span>Centena</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira uma ou mais Centenas`,
    );
  }

  if (btnModalitieActive === 7) {
    // Ação para o botão "Centena Combinada"
    $('.header-keyboard.header-games .title').html(
      `Insira sua <span>Centena Combinada</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira uma ou mais Centenas Combinadas`,
    );
  }

  if (btnModalitieActive === 8) {
    // Ação para o botão "Dezena"
    $('.header-keyboard.header-games .title').html(
      `Insira sua <span>Dezena</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira uma ou mais Dezenas`,
    );
  }

  if (btnModalitieActive === 9) {
    // Ação para o botão "Dezena Combinada"
    $('.header-keyboard.header-games .title').html(
      `Insira sua <span>Dezena Combinada</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira uma ou mais Dezenas Combinadas`,
    );
  }

  if (btnModalitieActive === 11) {
    // Ação para o botão "Terno de Dezena"
    $('.header-keyboard.header-games .title').html(
      `Insira seu <span>Terno de Dezena</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira um ou mais Ternos de Dezena`,
    );
  }

  if (btnModalitieActive === 12) {
    // Ação para o botão "Duque de Dezena"
    $('.header-keyboard.header-games .title').html(
      `Insira seu <span>Duque de Dezena</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira um ou mais Duques de Dezena`,
    );
  }

  if (btnModalitieActive === 13) {
    // Ação para o botão "Terno de Grupo"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Ternos de Grupo</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de três Ternos de Grupo`,
    );
  }

  if (btnModalitieActive === 15) {
    // Ação para o botão "Dupla de Grupo"
    $('.header-groups.header-games .title').html(
      `Escolha uma ou mais <span>Duplas de Grupo</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de duas Duplas de Grupo`,
    );
  }

  if (btnModalitieActive === 17) {
    // Ação para o botão "Passe"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Passes</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de dois Passes`,
    );
  }

  if (btnModalitieActive === 18) {
    // Ação para o botão "Passe Virado"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Passes Virados</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de dois Passes`,
    );
  }

  if (btnModalitieActive === 19) {
    // Ação para o botão "Quina de Grupo"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Quinas de Grupo</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de cinco Quinas de Grupo`,
    );
  }

  if (btnModalitieActive === 22) {
    // Ação para o botão "Quadra de Grupo"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Quadras de Grupo</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de quatro Quadras de Grupo`,
    );
  }

  if (btnModalitieActive === 34) {
    // Ação para o botão "Terno de Dezena Combinado"
    $('.header-keyboard.header-games .title').html(
      `Insira seu <span>Terno de Dezena Combinado</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira um ou mais Ternos de Dezena Combinados`,
    );
  }

  if (btnModalitieActive === 35) {
    // Ação para o botão "Duque de Dezena Combinado"
    $('.header-keyboard.header-games .title').html(
      `Insira seu <span>Duque de Dezena Combinado</span>`,
    );
    $('.header-keyboard.header-games .subtitle').html(
      `Insira um ou mais Duques de Dezena Combinados`,
    );
  }

  if (btnModalitieActive === 36) {
    // Ação para o botão "Terno de Grupo Combinado"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Ternos de Grupo Combinados</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de três Ternos de Grupo Combinados`,
    );
  }

  if (btnModalitieActive === 37) {
    // Ação para o botão "Dupla de Grupo Combinado"
    $('.header-groups.header-games .title').html(
      `Escolha uma ou mais <span>Duplas de Grupo Combinadas</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de duas Duplas de Grupo Combinadas`,
    );
  }

  if (btnModalitieActive === 38) {
    // Ação para o botão "Quina de Grupo Combinado"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Quinas de Grupo Combinadas</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de cinco Quinas de Grupo Combinadas`,
    );
  }

  if (btnModalitieActive === 39) {
    // Ação para o botão "Quadra de Grupo Combinado"
    $('.header-groups.header-games .title').html(
      `Escolha um ou mais <span>Quadras de Grupo Combinadas</span>`,
    );
    $('.header-groups.header-games .subtitle').html(
      `Selecione a partir de quatro Quadras de Grupo Combinadas`,
    );
  }

  if (btnModalitieActive) {
    axios
      .get(`/api/game/modality/` + btnModalitieActive)
      .then(response => {
        selectedModalities = btnModalitieActive;
        $('.btn-back').show(200);
        const dataModalidade = response.data.campo_modalidade;
        const dataPlacements = response.data.campo_colocacoes;
        identifyModalitie = dataModalidade.campo_modalidade_descricao;
        numbersToInsertGroup = dataModalidade.campo_modalidade_quebras;
        // TECLADO GRUPOS
        var keyboardGroups = '';

        for (let i = 1; i <= 25; i++) {
          keyboardGroups += `
          <div class="content-select-animal">
            <div class="img-select-animal keyboard-group key-group-${i}" data-selected-time='0' data-bicho-grupo="${i}">
            <img src="./assets/images/animals/img-bicho-${i}.jpg">
            <p class="number">${i}</p>
            <p class="title">${animalList[i].name}</p>
            <div class="content-sequencial">
          ${animalList[i].sequencial
            .map(function (seq) {
              return `<p class="sequencial">${seq}</p>`;
            })
            .join('')}
                  </div>
              </div>
          </div>`;
        }

        $('.container-select-animal').html(keyboardGroups);

        // TECLADO DIGITAL
        const keyboardDigital = `
        <div class="row-keyboard">
            <button title="Adicionar o número 1" class="btn btn-keyboard">1</button>
            <button title="Adicionar o número 2" class="btn btn-keyboard">2</button>
            <button title="Adicionar o número 3" class="btn btn-keyboard">3</button>
        </div>
        <div class="row-keyboard">
            <button title="Adicionar o número 4" class="btn btn-keyboard">4</button>
            <button title="Adicionar o número 5" class="btn btn-keyboard">5</button>
            <button title="Adicionar o número 6" class="btn btn-keyboard">6</button>
        </div>
        <div class="row-keyboard">
            <button title="Adicionar o número 7" class="btn btn-keyboard">7</button>
            <button title="Adicionar o número 8" class="btn btn-keyboard">8</button>
            <button title="Adicionar o número 9" class="btn btn-keyboard">9</button>
        </div>
        <div class="row-keyboard">
            <button title="Adicionar o número 0" class="btn btn-keyboard">0</button>
            <button title="Aleatorizar aposta" class="btn btn-randomize">
                <i class="fas fa-random"></i>
            </button>
            <button title="Apagar último número" class="btn backspace">
              <i class="fas fa-backspace"></i>
            </button>
        </div>
        `;
        // Função de click keyboard group bruno
        $('.keyboard-group').on(
          'click',
          '.btn-bicho-selected',
          function (event) {
            event.stopPropagation();
            const valor = Number($(this).text());
            const newValor = valor + 1;
            $(this).text(newValor);
            // Acessando o elemento pai com a classe .keyboard-group
            const keyboardGroupClass = $(this).closest('.keyboard-group');
            // Acessando o valor do atributo data-example do elemento pai
            const groupToInsert = keyboardGroupClass.data('bicho-grupo');
            verifyBetsInsert(
              numbersToInsertGroup,
              1,
              groupToInsert.toString().padStart(2, '0'),
            );
          },
        );
        $('.keyboard-group').on('click', '.btn-remove-bicho', function (event) {
          event.stopPropagation();
          const valor = Number($(this).siblings('.btn-bicho-selected').text());
          const newValor = valor - 1;
          $(this).siblings('.btn-bicho-selected').text(newValor);
          const keyboardGroupClass = $(this).closest('.keyboard-group');
          // Acessando o valor do atributo data-example do elemento pai
          const groupToInsert = keyboardGroupClass
            .data('bicho-grupo')
            .toString()
            .padStart(2, '0');
          const numeros = numberString.split(','); // Separa a string em uma array de números
          const index = numeros.lastIndexOf(groupToInsert); // Encontra o índice da última ocorrência do número

          if (index !== -1) {
            // Verifica se o número informado está na array
            numeros.splice(index, 1); // Remove o último número encontrado
          }
          numberString = numeros.join(',');
          if (newValor < 1) {
            $(this)
              .parent()
              .find('.btn-bicho-selected')
              .removeClass('btn-bicho-selected');
            $(this)
              .parent()
              .find('.btn-remove-bicho')
              .removeClass('btn-remove-bicho');
            $(this).closest('.active').removeClass('active');
          }
        });
        $('.keyboard-group').click(function () {
          const grupoClicado = $(this).data('bicho-grupo');
          if (dataModalidade.campo_modalidade_quebras === 1) {
            if (
              selectedGuess.includes(grupoClicado.toString().padStart(2, '0'))
            ) {
              Toast.fire({
                icon: 'error',
                title: 'Esse jogo já foi inserido!',
              });
              return;
            }
            selectedGuess.push(grupoClicado.toString().padStart(2, '0'));
            const addGuesses = `
            <div class="item-list" title="Selecionar">
            <span class="clear-bet">
                <i class="fas fa-trash-alt"></i>
              </span>
              <span class="number-bet">
                ${grupoClicado.toString().padStart(2, '0')}
                </span>
                </div>
                `;
            if (selectedGuess.length > 0) {
              enableButtonNext();
            } else {
              disableButtonNext();
            }
            const newItemGuess = $(addGuesses).hide();
            $('.content-bets').append(newItemGuess);
            newItemGuess.fadeIn(500);
            $('#listItemsGame').removeClass('hide').fadeIn(500);
            calcTotalBets();
            Toast.fire({
              icon: 'success',
              title: 'Jogo adicionado com sucesso!',
            });
          } else {
            if (!$(this).hasClass('active')) {
              $(this).addClass('active');
              $(this).append(`<div class="btn-bicho-selected">${1}</div>`);
              $(this).append(
                `<div class="btn-remove-bicho-selected btn-remove-bicho" data-bicho="${grupoClicado
                  .toString()
                  .padStart(
                    2,
                    '0',
                  )}" style='top: 60%;'><i class='fas fa-minus'></i></div>`,
              );
              verifyBetsInsert(
                numbersToInsertGroup,
                1,
                grupoClicado.toString().padStart(2, '0'),
              );
            }
          }
        });

        function verifyBetsInsert(minBets, type, grupoClicado) {
          // TIPO DE INSERÇÃO
          if (type === 1) {
            numberString += grupoClicado.toString().padStart(2, '0') + ',';
            const numbersSplits =
              numberString !== '' ? numberString.slice(0, -1).split(',') : [];
            // if ((maxBets === minBets && numbersSplits.length === maxBets)) {
            // Coloquei minBets na verificação so pra todas modalidades funcionar temporariamente
            if (numbersSplits.length === minBets) {
              if (selectedGuess.includes(numberString.slice(0, -1))) {
                Toast.fire({
                  icon: 'error',
                  title: 'Esse jogo já foi inserido!',
                });
              } else {
                selectedGuess.push(numberString.slice(0, -1));
                const addGuesses = `
                <div class="item-list" title="Selecionar">
                <span class="clear-bet">
                    <i class="fas fa-trash-alt"></i>
                  </span>
                  <span class="number-bet">
                    ${numberString.slice(0, -1)}
                    </span>
                    </div>
                    `;
                const newItemGuess = $(addGuesses).hide();
                $('.content-bets').append(newItemGuess);
                newItemGuess.fadeIn(500);
                $('#listItemsGame').removeClass('hide').fadeIn(500);
                if (selectedGuess.length > 0) {
                  enableButtonNext();
                } else {
                  disableButtonNext();
                }
                Toast.fire({
                  icon: 'success',
                  title: 'Jogo adicionado com sucesso!',
                });
                calcTotalBets();
              }
              numberString = '';
              $('.keyboard-group').removeClass('active');
              $('.btn-bicho-selected').removeClass('btn-bicho-selected');
              $('.btn-remove-bicho').removeClass('btn-remove-bicho');
            }
          }
        }
        $('.content-select-numbers').html(keyboardDigital);
        // GERAR INPUTS
        var inputKeyboard = '';
        for (let i = 0; i < dataModalidade.campo_modalidade_quebras; i++) {
          for (
            let p = 0;
            p < dataModalidade.campo_modalidade_numeros_minimo;
            p++
          ) {
            inputKeyboard += `<input type="tel" maxlength="1" class="digits-keyboard" title="Utilize o teclado virtual" readonly disabled>`;
          }
          if (i !== dataModalidade.campo_modalidade_quebras - 1) {
            inputKeyboard += `<span style="font-size: 4rem; color: #a2a1a1;">,</span>`;
          }
        }
        $('.content-place-numbers').html(inputKeyboard);
        // EVENTOS DE CLIQUE NOS BOTÕES
        function insertKey(key) {
          var firstEmpty = $('.digits-keyboard').filter(function (
            index,
            element,
          ) {
            return $(element).val() === '';
          });
          firstEmpty.first().val(key);
          firstEmpty.first().addClass('active');
        }

        function backSpace() {
          var lastEmpty = $('.digits-keyboard').filter(function (
            index,
            element,
          ) {
            return $(element).val() !== '';
          });
          lastEmpty.last().removeClass('active');
          lastEmpty.last().val('');
        }

        // VERIFICAR SE O JOGO PODE SER INSERIDO
        function addSeparators(numberString) {
          const { campo_modalidade_numeros_minimo } = dataModalidade;
          const number = numberString.split('');
          const formattedNumber = [];

          for (let i = number.length - 1, count = 1; i >= 0; i--, count++) {
            formattedNumber.unshift(number[i]);

            if (count % campo_modalidade_numeros_minimo === 0 && i !== 0) {
              formattedNumber.unshift(',');
            }
          }
          return formattedNumber.join('');
        }

        function verifyGuesses() {
          var inputsVazios = $('.digits-keyboard').filter(function () {
            return $(this).val() === '';
          });

          if (inputsVazios.length === 0) {
            var guesses = '';

            $('.digits-keyboard').each(function () {
              guesses += $(this).val();
            });

            if (dataModalidade.campo_modalidade_quebras !== 1) {
              guesses = addSeparators(guesses);
            }

            const addGuesses = `
            <div class="item-list" title="Selecionar">
              <span class="clear-bet">
                <i class="fas fa-trash-alt"></i>
              </span>
              <span class="number-bet">
                ${guesses}
              </span>
            </div>
          `;
            if (selectedGuess.includes(guesses)) {
              Toast.fire({
                icon: 'error',
                title: 'Esse jogo já foi inserido!',
              });
              return;
            }

            const newItemGuess = $(addGuesses).hide();
            $('.content-bets').append(newItemGuess);
            newItemGuess.fadeIn(500);
            checkGuess();
            selectedGuess.push(guesses);
            calcTotalBets();
            setTimeout(function () {
              $('.digits-keyboard').val('');
              $('.digits-keyboard').removeClass('active');
            }, 250);
          }
        }

        function checkGuess() {
          if ($('.content-bets').text().trim() !== '') {
            $('#listItemsGame').removeClass('hide').fadeIn(500);
            enableButtonNext();
          } else {
            $('#listItemsGame').fadeOut(function () {
              $(this).addClass('hide');
            });
            disableButtonNext();
          }
        }
        checkGuess();

        function generateRandomGuess() {
          var randomGuess = '';
          var numbers = '0123456789';
          for (
            var i = 0;
            i <
            dataModalidade.campo_modalidade_quebras *
              dataModalidade.campo_modalidade_numeros_maximo;
            i++
          ) {
            var randomIndex = Math.floor(Math.random() * numbers.length);
            randomGuess += numbers.charAt(randomIndex);
          }
          return randomGuess;
        }

        function insertGuess(guess) {
          var guessArray = guess.split('');
          var inputs = $('.digits-keyboard');
          for (var i = 0; i < guessArray.length; i++) {
            if (i < inputs.length) {
              $(inputs[i]).val(guessArray[i]);
              $(inputs[i]).addClass('active');
            }
          }
        }

        $('.backspace').click(backSpace);
        $('.btn-keyboard').click(function () {
          var key = $(this).text();
          insertKey(key);
          verifyGuesses();
        });

        $('.btn-randomize').click(function () {
          var randomGuess = generateRandomGuess();
          insertGuess(randomGuess);
          verifyGuesses();
        });

        $(document).on('click', '.item-list', function () {
          Swal.fire({
            title: 'Deseja anular este palpite?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar',
            cancelButtonText: 'Cancelar',
            cancelButtonColor: '#d33',
            reverseButtons: true,
          }).then(result => {
            if (result.isConfirmed) {
              let guessSelect = $(this).find('.number-bet').text().trim();
              let indexGuess = selectedGuess.findIndex(
                guess => guess.trim() === guessSelect,
              );
              if (indexGuess !== -1) {
                selectedGuess.splice(indexGuess, 1);
              }
              $(this).remove();
              Toast.fire({
                icon: 'success',
                title: 'Palpite deletado com sucesso!',
              });
              calcTotalBets();
              checkGuess();
            }
          });
        });

        // DEFINIR TIPO DE TECLADO
        classShowTypeGame =
          dataModalidade.campo_modalidade_tipo_teclado === 1
            ? '.container-groups'
            : '.container-keyboard';

        // DEFINIR COLOCAÇÕES
        $('.header-placements').html(
          dataPlacements.length !== 1
            ? `<h1 class="title">Escolha as <span>colocações</span></h1><h2 class="subtitle">Selecione uma ou mais opções</h2>`
            : `<h1 class="title">Escolha a <span>colocação</span></h1><h2 class="subtitle">Selecione uma opção</h2>`,
        );
        var checkboxPlacements = dataPlacements
          .map(function (placement) {
            return `
          <div class="item-checkbox placements">
            <input type="checkbox" class="checkbox-placements" data-colococacao-ident="${
              placement.campo_colocacao_ident
            }" value="${placement.campo_colocacao_descricao}" id="${placement.campo_colocacao_ident} ${placement.campo_colocacao_descricao}" ${dataPlacements.length === 1 ? 'checked' : ''}>
            <label for="${
              placement.campo_colocacao_ident
            } ${placement.campo_colocacao_descricao}">${placement.campo_colocacao_descricao}</label>
          </div>`;
          })
          .join('');

        $('.content-placements').html(checkboxPlacements);

        $('.checkbox-placements')[0].checked = true;

        selectedPlacements.push({
          campo_colocacao_ident: Number(
            $('.checkbox-placements')[0].id.split(' ')[0],
          ),
          campo_valor_total_jogo: 1.0,
        });
        $('.item-checkbox.placements').on(
          'change',
          '.checkbox-placements',
          function (e) {
            let placements = $(this)
              .closest('.item-checkbox.placements')
              .attr('data-colococacao-ident');
            let identifyPlacements = $(this).attr('id').split(' ')[0];
            if ($(this).prop('checked')) {
              selectedPlacements.push({
                campo_colocacao_ident: Number(identifyPlacements),
                campo_valor_total_jogo: 1.0,
              });
              calcTotalBets();
            } else {
              const index = selectedPlacements.findIndex(
                placement =>
                  placement.campo_colocacao_ident ===
                  Number(identifyPlacements),
              );
              if (index > -1) {
                selectedPlacements.splice(index, 1);
              }
              calcTotalBets();
            }
            if (selectedPlacements.length > 0) {
              enableButtonNext();
            } else {
              disableButtonNext();
            }
          },
        );

        if (
          dataModalidade.campo_modalidade_combinada === 1 &&
          dataModalidade.campo_modalidade_quebras !==
            dataModalidade.campo_modalidade_quebras_max
        ) {
          valueMin = dataModalidade.campo_modalidade_quebras;
          valueMax = dataModalidade.campo_modalidade_quebras_max;
          inputType = 'quebras';
          // MODALIDADES DE TECLADO E GRUPO COMBINADA
        } else if (
          dataModalidade.campo_modalidade_combinada === 1 &&
          dataModalidade.campo_modalidade_quebras ===
            dataModalidade.campo_modalidade_quebras_max
        ) {
          valueMin = dataModalidade.campo_modalidade_numeros_minimo;
          valueMax = dataModalidade.campo_modalidade_numeros_maximo;
          inputType = 'numeros';
          // MODALIDADES DE TECLADO COMBINADA
        }

        if (dataModalidade.campo_modalidade_combinada === 1) {
          let divSelect = `
            <div class="select-qnt-game">
              <div class="container-add-numbers">
                <button id="removedNumber" disabled>
                  <i class="fas fa-minus"></i>
                </button>
                <span id="valueNumbers">${valueMin}</span>
                <button id="addNumber">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          `;
          if (dataModalidade.campo_modalidade_tipo_teclado === 1) {
            $('.header-groups').after(divSelect);
          } else {
            $('.header-keyboard').after(divSelect);
          }
        }

        $('#addNumber').click(function () {
          let valueDiv = parseInt($('#valueNumbers').text());
          let valueAdd = valueDiv + 1;
          if (dataModalidade.campo_modalidade_tipo_teclado === 2) {
            if (inputType === 'numeros') {
              if (valueAdd === valueMax) {
                // DESABILITA
                $('.content-place-numbers').append(
                  '<input type="tel" maxlength="1" class="digits-keyboard" title="Utilize o teclado virtual" readonly="" disabled="">',
                );
                $('#addNumber').prop('disabled', true);
              } else {
                $('.content-place-numbers').append(
                  '<input type="tel" maxlength="1" class="digits-keyboard" title="Utilize o teclado virtual" readonly="" disabled="">',
                );
                $('#addNumber').prop('disabled', false);
              }
              if (valueAdd === valueMin) {
                // DESABILITA
                $('#removedNumber').prop('disabled', true);
              } else {
                // HABILITA
                $('#removedNumber').prop('disabled', false);
              }
              $('#valueNumbers').text(valueAdd);
            } else if (inputType === 'quebras') {
              if (valueAdd === valueMax) {
                // DESABILITA
                $('.content-place-numbers').append(
                  '<span style="font-size: 4rem; color: #a2a1a1;">,</span><input type="tel" maxlength="1" class="digits-keyboard" title="Utilize o teclado virtual" readonly="" disabled=""><input type="tel" maxlength="1" class="digits-keyboard" title="Utilize o teclado virtual" readonly="" disabled="">',
                );
                $('#addNumber').prop('disabled', true);
              } else {
                $('.content-place-numbers').append(
                  '<span style="font-size: 4rem; color: #a2a1a1;">,</span><input type="tel" maxlength="1" class="digits-keyboard" title="Utilize o teclado virtual" readonly="" disabled=""><input type="tel" maxlength="1" class="digits-keyboard" title="Utilize o teclado virtual" readonly="" disabled="">',
                );
                $('#addNumber').prop('disabled', false);
              }
              if (valueAdd === valueMin) {
                // DESABILITA
                $('#removedNumber').prop('disabled', true);
              } else {
                // HABILITA
                $('#removedNumber').prop('disabled', false);
              }
              $('#valueNumbers').text(valueAdd);
            }
          } else if (dataModalidade.campo_modalidade_tipo_teclado === 1) {
            if (valueAdd === valueMax) {
              // DESABILITA
              $('.content-place-numbers').append(
                '<input type="tel" maxlength="1" class="digits-keyboard" title="Utilize o teclado virtual" readonly="" disabled="">',
              );
              $('#addNumber').prop('disabled', true);
            } else {
              $('#addNumber').prop('disabled', false);
            }
            if (valueAdd === valueMin) {
              // DESABILITA
              $('#removedNumber').prop('disabled', true);
            } else {
              // HABILITA
              $('#removedNumber').prop('disabled', false);
            }
            numbersToInsertGroup = valueAdd;
            $('#valueNumbers').text(valueAdd);
          }
        });

        $('#removedNumber').click(function () {
          let valueDiv = parseInt($('#valueNumbers').text());
          let valueRemove = valueDiv - 1;
          if (dataModalidade.campo_modalidade_tipo_teclado === 2) {
            if (inputType === 'numeros') {
              if (valueRemove === valueMin) {
                // DESABILITA
                $('.content-place-numbers').children().last().remove();
                $('#removedNumber').prop('disabled', true);
              } else {
                // HABILITA
                $('.content-place-numbers').children().last().remove();
                $('#removedNumber').prop('disabled', false);
              }

              if (valueRemove === valueMax) {
                // DESABILITA
                $('#addNumber').prop('disabled', true);
              } else {
                // HABILITA
                $('#addNumber').prop('disabled', false);
              }

              $('#valueNumbers').text(valueRemove);
            } else if (inputType === 'quebras') {
              if (valueRemove === valueMin) {
                // DESABILITA
                $('.content-place-numbers').children().last().remove();
                $('.content-place-numbers').children().last().remove();
                $('.content-place-numbers').children().last().remove();
                $('#removedNumber').prop('disabled', true);
              } else {
                // HABILITA
                $('.content-place-numbers').children().last().remove();
                $('.content-place-numbers').children().last().remove();
                $('.content-place-numbers').children().last().remove();
                $('#removedNumber').prop('disabled', false);
              }

              if (valueRemove === valueMax) {
                // DESABILITA
                $('#addNumber').prop('disabled', true);
              } else {
                // HABILITA
                $('#addNumber').prop('disabled', false);
              }
              $('#valueNumbers').text(valueRemove);
            }
          }
          if (dataModalidade.campo_modalidade_tipo_teclado === 1) {
            if (valueRemove === valueMin) {
              // DESABILITA
              $('#removedNumber').prop('disabled', true);
            } else {
              // HABILITA
              $('#removedNumber').prop('disabled', false);
            }

            if (valueRemove === valueMax) {
              // DESABILITA
              $('#addNumber').prop('disabled', true);
            } else {
              // HABILITA
              $('#addNumber').prop('disabled', false);
            }
            numbersToInsertGroup = valueRemove;
            $('#valueNumbers').text(valueRemove);
          }
        });

        setStep(
          classShowTypeGame,
          '.container-modalities',
          '.container-lotteries',
          '.container-modalities',
          '.contents-progress.modalities',
          '.contents-progress.guess',
        );
      })
      .catch(error => {
        if (Number(error.response.data.status) === 401) {
          window.location.href = '/';
        }
      });
  }
}

$('#myDiv').on('click', '#myButton', function () {
  const objectDateNow = DateTime.now().setZone('America/Sao_Paulo');
  const objectDateTomorrow = objectDateNow.plus({
    days: 1,
  });
  const objectDateAfterTomorrow = objectDateNow.plus({
    days: 2,
  });

  const dateNow = objectDateNow.toISODate();
  const dateTomorrow = objectDateTomorrow.toISODate();
  const dateAfterTomorrow = objectDateAfterTomorrow.toISODate();
});

const objectDateNow = luxon.DateTime.now().setZone('America/Sao_Paulo');
const objectDateTomorrow = objectDateNow.plus({
  days: 1,
});
const objectDateAfterTomorrow = objectDateNow.plus({
  days: 2,
});

const dateNow = objectDateNow.toISODate();
const dateTomorrow = objectDateTomorrow.toISODate();
const dateAfterTomorrow = objectDateAfterTomorrow.toISODate();
$('.container-lotteries').on('click', '#sub-date-lot', function () {
  $('.content-lotteries').html(
    `<div class="spinner-loteries"><i class="fas fa-spinner fa-pulse"></i></div>`,
  );
  const time = Number($('#date-lottery-selected').data('time')) - 1;
  const date = $('#date-lottery-selected').data('date');
  const dataObject = luxon.DateTime.fromISO(date);
  const dataAtualSelecionada = dataObject.plus({
    days: -1,
  });
  const dataInputAmericano = dataAtualSelecionada.toFormat('yyyy-MM-dd');
  const dataInputFormated = dataAtualSelecionada.toFormat('dd/MM/yyyy');
  $('#date-lottery-selected').data('date', dataInputAmericano);
  $('#date-lottery-selected').text(dataInputFormated);
  $('#date-lottery-selected').data('time', time);
  if (time === 0) {
    $('#sub-date-lot').hide();
  }
  $('#sum-date-lot').show();
  stepLottery(dataInputAmericano);
});

$('.container-lotteries').on('click', '#sum-date-lot', function () {
  $('.content-lotteries').html(
    `<div class="spinner-loteries"><i class="fas fa-spinner fa-pulse"></i></div>`,
  );
  const time = Number($('#date-lottery-selected').data('time')) + 1;
  const date = $('#date-lottery-selected').data('date');
  const dataObject = luxon.DateTime.fromISO(date);
  const dataAtualSelecionada = dataObject.plus({
    days: 1,
  });
  const dataInputAmericano = dataAtualSelecionada.toFormat('yyyy-MM-dd');
  const dataInputFormated = dataAtualSelecionada.toFormat('dd/MM/yyyy');
  $('#date-lottery-selected').data('date', dataInputAmericano);
  $('#date-lottery-selected').text(dataInputFormated);
  $('#date-lottery-selected').data('time', time);
  $('#sub-date-lot').show();
  if (time === 2) {
    $('#sum-date-lot').hide();
  }
  stepLottery(dataInputAmericano);
});

function stepLottery(date = null) {
  divLotteries.show(100);
  let dataFormated;
  if (date === dateNow) {
    dataFormated = dateNow;
    $('#sub-date-lot').hide();
  } else if (date === dateTomorrow) {
    dataFormated = dateTomorrow;
  } else if (date === dateAfterTomorrow) {
    dataFormated = dateAfterTomorrow;
    $('#sum-date-lot').hide();
  } else {
    const dataFormatedBrasilian = objectDateNow.toFormat('dd/MM/yyyy');
    const dataFormatedUs = objectDateNow.toFormat('yyyy-MM-dd');
    $('#date-lottery-selected').text(dataFormatedBrasilian);
    $('#date-lottery-selected').data('date', dataFormatedUs);
    $('#date-lottery-selected').data('time', 0);
    $('#sub-date-lot').hide();
    dataFormated = dateNow;
  }
  if (selectedLotteries.length > 0) {
    enableButtonNext();
  } else {
    disableButtonNext();
  }
  getLotterys(dataFormated);
}

function getLotterys(dataSearch) {
  const dataLotteriesFind = listLotteriesSaves.find(
    item => item.data === dataSearch,
  );
  if (dataLotteriesFind) {
    injectLotteries(dataLotteriesFind.dataLotteries, dataLotteriesFind.data);
  } else {
    axios
      .get(`/api/game/lotteries/${dataSearch}`)
      .then(response => {
        const data = response.data;
        listLotteriesSaves.push({
          data: dataSearch,
          dataLotteries: data,
        });
        injectLotteries(data, dataSearch);
      })
      .catch(error => {
        if (Number(error.response.data.status) === 401) {
          window.location.href = '/';
        }
      });
  }
}

function injectLotteries(data, dataSearch) {
  var containerLotteries = '';
  data.forEach(groupLotterie => {
    // Gerar o HTML das loterias dentro do grupo
    const loterias = groupLotterie.campo_loterias
      .map(
        loteria => `
      <div class="item-checkbox loterie" data-loterie="${
        groupLotterie.campo_nome_grupo_loteria.split(/-(.*)/s)[1]
      }">
        <input type="checkbox" data-lottery-date="${dataSearch}" data-lottery-ident="${
          loteria.campo_loteria_ident
        }" id= "${dataSearch}_${
          loteria.campo_loteria_ident
        }" class="checkbox-loterie">
        <label for="${dataSearch}_${
          loteria.campo_loteria_ident
        }">${loteria.campo_loteria_descricao.replace('-', ' ')}</label>
      </div>
    `,
      )
      .join('');

    // Verificar se o grupo de loterias possui loterias
    if (groupLotterie.campo_loterias.length > 0) {
      // Construir o HTML do container das loterias
      containerLotteries += `
        <div class="container-lotteries-game">
          <div class="content-name-lotterie" data-loterie="${
            groupLotterie.campo_nome_grupo_loteria.split(/-(.*)/s)[1]
          }">
            <span class="title-lotterie">Loteria ${
              groupLotterie.campo_nome_grupo_loteria.split(/-(.*)/s)[1]
            }</span>
          </div>
          <div class="content-available-times">
            ${loterias}
          </div>
        </div>
      `;
    }
  });
  // Atualizar o conteúdo das loterias na página
  $('.content-lotteries').html(containerLotteries);
  $('.checkbox-loterie').each(function () {
    const inputDate = $(this).attr('data-lottery-date');
    const inputIdent = Number($(this).attr('data-lottery-ident'));
    // Verifica se há uma correspondência nos valores do array
    const hasMatch = selectedLotteries.some(
      objeto =>
        objeto.campo_loteria_ident === inputIdent &&
        objeto.campo_data_loteria === inputDate,
    );

    // Adiciona o atributo "checked" se houver correspondência
    if (hasMatch) {
      $(this).prop('checked', true);
    }
  });
}

$('.container-lotteries').on('change', '.checkbox-loterie', function () {
  if ($(this).is(':checked')) {
    selectedLotteries.push({
      campo_loteria_ident: Number($(this).data('lottery-ident')),
      campo_data_loteria: $(this).data('lottery-date'),
    });
  } else {
    selectedLotteries = selectedLotteries.filter(objeto => {
      return (
        objeto.campo_loteria_ident !== Number($(this).data('lottery-ident')) ||
        objeto.campo_data_loteria !== $(this).data('lottery-date')
      );
    });
  }
  if (selectedLotteries.length > 0) {
    enableButtonNext();
  } else {
    disableButtonNext();
  }
  calcTotalBets();
});

function verifyCheckLotteries() {
  const lotteries = $('checkbox-loterie:checked').length;
  if (lotteries > 0) {
    enableButtonNext();
  }
}

function areaModalities() {
  $('.btn-next').attr('data-nextstep', '.container-groups');
  initialValuesSteps();
  divModalities.show(110);
  axios
    .get('api/game/modalities')
    .then(response => {
      const data = response.data;
      const divModalitiesFor = $('.content-modalities');
      var buttonsModalities = '';
      for (let i = 0; i < data.length; i++) {
        buttonsModalities += `<button class="btn-modalities" data-modalidade="${data[i].campo_modalidade_ident}">${data[i].campo_modalidade_descricao}</button>`;
      }
      $(divModalitiesFor).html(buttonsModalities);
      $('.btn-modalities').click(function () {
        $('.btn-modalities').removeClass('active');
        $(this).addClass('active');
        if ($(this).hasClass('active')) {
          $('#stepsGames').removeClass('effect-first-step');
          enableButtonNext();
        } else {
          disableButtonNext();
          $('#stepsGames').addClass('effect-first-step');
        }
      });
    })
    .catch(error => {
      if (Number(error.response.data.status) === 401) {
        window.location.href = '/';
      }
    });
}

areaModalities();

function disableButtonNext() {
  $('.next-step').hide(200);
  $('.btn-next').prop('disabled', true);
  $('.btn-next').html(`Próximo`);
}

function enableButtonNext() {
  $('.next-step').show(200);
  $('.btn-next').prop('disabled', false);
}

function areaPurchase() {
  divPurchase.show(200);

  const inputValue = $('#valueBet');

  const formatValue = inputValue => {
    let value = inputValue.replace(/\D/g, '');
    value = value.padStart(3, '0');
    value = (value / 100).toFixed(2);
    value = value.replace('.', ',');
    value = value.replace(/(\d)(?=(\d{3})+\,)/g, '$1.');
    return value;
  };

  $('#valueBet').on('input', function () {
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

  $('#valueBet').on('click', function () {
    const cursorPosition = $(this).val().length;
    $(this)[0].setSelectionRange(cursorPosition, cursorPosition);
  });

  $('#valueBet').on('blur', function () {
    if ($(this).val() === '') {
      $(this).val('0,00');
    }
  });
}
-(
  // if (qntSelectedAnimal === 1) {
  //   cardSelected.addClass('active')
  //   cardSelected.append("<div class='btn-bicho-selected'>" + qntSelectedAnimal + "</div>");
  //   cardSelected.append("<div class='btn-remove-bicho-selected btn-remove-bicho' onclick='remove_bicho(" + bicho + ", event); return false;' style='top: 60%;'><i class='fas fa-minus'></i></div>");
  // } else if (qntSelectedAnimal > 1) {
  //   $(`.img-select-animal.animal-${bicho} .btn-bicho-selected`).html(`${qntSelectedAnimal}`)
  // }
  // SELECIONAR JOGO

  // LIMPAR JOGO

  // CALCULAR VALOR DA APOSTA

  // ENVIAR JOGO

  $('#valueBet').keyup(function () {
    calcTotalBets();
  })
);

$('#divideStakes').change(function () {
  calcTotalBets();
});

$('#sendGame').click(function () {
  $('#sendGame').html(`<i class="fas fa-spinner fa-pulse"></i>`);
  $('#sendGame').prop('disabled', true);
  try {
    if (selectedLotteries.length < 1) {
      $('#sendGame').html(`Apostar`);
      $('#sendGame').prop('disabled', false);
      throw 'Informe pelo menos uma loteria!';
    }
    if (!selectedModalities) {
      $('#sendGame').html(`Apostar`);
      $('#sendGame').prop('disabled', false);
      throw 'Informe a modalidade!';
    }
    if (selectedGuess.length < 1) {
      $('#sendGame').html(`Apostar`);
      $('#sendGame').prop('disabled', false);
      throw 'Informe pelo menos um palpite!';
    }
    if (selectedPlacements.length < 1) {
      $('#sendGame').html(`Apostar`);
      $('#sendGame').prop('disabled', false);
      throw 'Informe pelo menos uma colocação!';
    }
    const countQtyLotteries = selectedLotteries.length;
    const countQtyGuess = selectedGuess.length;
    // const countQtyPlacements = selectedPlacements.length;
    selectedPlacements.forEach(item => {
      const calcValueByBet =
        item.campo_valor_total_jogo / countQtyLotteries / countQtyGuess;
      if (calcValueByBet < 0.1) {
        $('#sendGame').html(`Apostar`);
        $('#sendGame').prop('disabled', false);
        throw 'O valor por aposta está abaixo de R$ 0,10, aumente o valor da aposta!';
      }
    });
    var sendBet = [
      {
        campo_modalidade_ident: selectedModalities,
        campo_loterias: selectedLotteries,
        campo_palpites: selectedGuess,
        campo_colocacoes: selectedPlacements,
      },
    ];

    axios
      .post('./api/game/create', sendBet)
      .then(result => {
        $('#sendGame').html(`Apostar`);
        $('#sendGame').prop('disabled', false);
        const dataResponse = result.data;
        const games = dataResponse.info.campo_jogos;
        const datas = games.reduce((acumulador, game) => {
          const data = game.campo_data_loteria;
          if (!acumulador.includes(data)) {
            acumulador.push(data);
          }
          return acumulador;
        }, []);
        const loterias = games.reduce((acumulador, game) => {
          const data = game.campo_loterias_descricao;
          if (!acumulador.includes(data)) {
            acumulador.push(data);
          }
          return acumulador;
        }, []);
        const modalidades = games.reduce((acumulador, game) => {
          const data = game.campo_modalidade_descricao;
          if (!acumulador.includes(data)) {
            acumulador.push(data);
          }
          return acumulador;
        }, []);
        const datasFormatadas = datas.map(dataAmericana => {
          const onjectData = luxon.DateTime.fromISO(dataAmericana);
          return onjectData.toFormat('dd/MM/yyyy');
        });
        const stringDatas = datasFormatadas.join(', ');
        const stringLoterias = loterias.join(',');
        const stringModalidades = modalidades.join(', ');
        let date = dataResponse.info.campo_data_log_game.split(' ')[0];
        date = date.split('/');
        date = date[2] + '-' + date[1] + '-' + date[0];
        var data = luxon.DateTime.fromISO(date);
        const diasDaSemana = [
          'Segunda-feira',
          'Terça-feira',
          'Quarta-feira',
          'Quinta-feira',
          'Sexta-feira',
          'Sábado',
          'Domingo',
        ];
        const nameWeek = diasDaSemana[data.weekday - 1];
        let htmlBets = `<tr>
      <th class="left-align">Modalidade</th>
      <th class="center-align">Colocação</th>
      <th class="center-align">Aposta</th>
      <th class="right-align">Loterias</th>
  </tr>`;
        games.forEach(game => {
          htmlBets += `<tr>
        <td class="left-align">${game.campo_modalidade_descricao}</td>
        <td class="center-align">${game.campo_colocacao}</td>
        <td class="center-align">${game.campo_palpites}</td>
        <td class="right-align">${game.campo_loterias_descricao}</td>
      </tr>`;
        });
        $('#injectGamesSuccess').html(htmlBets);
        $('.user-history').text(dataResponse.info.campo_nome_usuario);
        $('.date-info-purchase').text(stringDatas);
        $('.history-purchase').text(
          nameWeek + ', ' + dataResponse.info.campo_data_log_game,
        );
        $('.modal-success').addClass('open');
        $('.type-game').text(stringModalidades);
      })
      .catch(errorAxios => {
        if (errorAxios.response) {
          const errorResponse = errorAxios.response.data;
          if (errorResponse.status) {
            if (errorResponse.status === 401) {
              window.location.href = '/';
            } else if (errorResponse.status === 422) {
              // Erro de formulario tratar conforme o formulario!
            } else {
              $('#sendGame').html(`Apostar`);
              $('#sendGame').prop('disabled', false);
              $('#error-text').show(500);
              $('#error-text').text(errorResponse.message);
            }
          }
        }
      });
  } catch (error) {
    $('#sendGame').html(`Apostar`);
    $('#sendGame').prop('disabled', false);
    $('#error-text').show(500);
    if (error.status) {
      $('#error-text').text(error.message);
    } else {
      $('#error-text').text(error);
    }
    setTimeout(function () {
      $('#error-text').hide(300);
    }, 5000);
  }
});

// MODAL
function verifyOpenModal() {
  if ($('.modal-success').hasClass('open')) {
    $('body').css('overflow', 'hidden');
  } else {
    $('body').css('overflow', 'auto');
  }
}
verifyOpenModal();

$('.close-modal-success').click(function () {
  $('.message-error').hide();
  $('.modal').removeClass('open');
  setTimeout(() => {
    $('.modal').addClass('d-none');
    location.reload();
  }, 500);
});

$('.btn-showmore').click(function () {
  if (!$(this).hasClass('active')) {
    $(this).addClass('active');
    $(this).html(`Ver menos <i class="fas fa-minus-circle"></i>`);
    $('.content-list-purchase').css('overflow-y', 'auto');
  } else {
    $(this).removeClass('active');
    $(this).html(`Ver mais <i class="fas fa-plus-circle"></i>`);
    $('.content-list-purchase').css('overflow-y', 'hidden');
  }
});
