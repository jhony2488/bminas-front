// (function ($) {
//   'use strict';
//   $(function () {

    function inserirGraficoDoughnut(data = {}) {
      if (Object.keys(data).length === 0) {
        // Define os valores padrão para as propriedades de campo_totais
        data.campo_totais = {
          total: 0,
          total_deposits: [{ amount: '0' }],
          total_withdraws: [{ amount: '0' }],
          total_games: [{ amount: '0' }],
          total_prizes: [{ amount: '0' }],
        };
      }

      var doughnutChartCanvas = $("#sessionsDoughnutChart").get(0).getContext("2d");
      var doughnutPieData = {
        datasets: [{
          data: [data['campo_totais']['total_deposits'][0]['amount'],data['campo_totais']['total_withdraws'][0]['amount'],data['campo_totais']['total_games'][0]['amount'],data['campo_totais']['total_prizes'][0]['amount']],
          backgroundColor: [
            '#3388e3',
            '#ff4d6b',
            '#38ce3c',
            '#edca1e'
          ],
          borderColor: [
            '#3388e3',
            '#ff4d6b',
            '#38ce3c',
            '#edca1e'
          ],
        }],

        labels: [
          'Depósitos',
          'Saques',
          'Apostas',
          'Prêmios',
        ]
      };


      var doughnutPieOptions = {
        cutoutPercentage: 75,
        animationEasing: "easeOutBounce",
        animateRotate: true,
        animateScale: false,
        responsive: true,
        maintainAspectRatio: true,
        showScale: true,
        legend: {
          display: false
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        }
      };

      var doughnutChart = new Chart(doughnutChartCanvas, {
        type: 'doughnut',
        data: doughnutPieData,
        options: doughnutPieOptions
      });
    }

    function inserirGraficoLine(data = {}) {
      if (Object.keys(data).length === 0) {
        // Define os valores padrão para as propriedades de campo_grafico
        data.campo_grafico = {
          gr_deposits: [
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' }
          ],
          gr_withdraws: [
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' }
          ],
          gr_games: [
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' }
          ],
          gr_prizes: [
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' },
            { data: '--/--/----', qtd: '0' }
          ],
        };
      }

      console.log(data)

      const getOrCreateTooltip = (chart) => {
        let tooltipEl = chart.canvas.parentNode.querySelector('div');

        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
          tooltipEl.style.borderRadius = '3px';
          tooltipEl.style.color = 'white';
          tooltipEl.style.opacity = 1;
          tooltipEl.style.pointerEvents = 'none';
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.transform = 'translate(-50%, 0)';
          tooltipEl.style.transition = 'all .1s ease';

          const table = document.createElement('table');
          table.style.margin = '0px';

          tooltipEl.appendChild(table);
          chart.canvas.parentNode.appendChild(tooltipEl);
        }

        return tooltipEl;
      };

      const externalTooltipHandler = (context) => {
        // Tooltip Element
        const {chart, tooltip} = context;
        const tooltipEl = getOrCreateTooltip(chart);

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
          tooltipEl.style.opacity = 0;
          return;
        }

        // Set Text
        if (tooltip.body) {
          const titleLines = tooltip.title || [];
          const bodyLines = tooltip.body.map(b => b.lines);

          const tableHead = document.createElement('thead');

          titleLines.forEach(title => {
            const tr = document.createElement('tr');
            tr.style.borderWidth = 0;

            const th = document.createElement('th');
            th.style.borderWidth = 0;
            const text = document.createTextNode(title);

            th.appendChild(text);
            tr.appendChild(th);
            tableHead.appendChild(tr);
          });

          const tableBody = document.createElement('tbody');
          bodyLines.forEach((body, i) => {
            const colors = tooltip.labelColors[i];

            const span = document.createElement('span');
            span.style.background = colors.backgroundColor;
            span.style.borderColor = colors.borderColor;
            span.style.borderWidth = '2px';
            span.style.marginRight = '10px';
            span.style.height = '10px';
            span.style.width = '10px';
            span.style.display = 'inline-block';

            const tr = document.createElement('tr');
            tr.style.backgroundColor = 'inherit';
            tr.style.borderWidth = 0;

            const td = document.createElement('td');
            td.style.borderWidth = 0;

            const text = document.createTextNode(body);

            td.appendChild(span);
            td.appendChild(text);
            tr.appendChild(td);
            tableBody.appendChild(tr);
          });

          const tableRoot = tooltipEl.querySelector('table');

          // Remove old children
          while (tableRoot.firstChild) {
            tableRoot.firstChild.remove();
          }

          // Add new children
          tableRoot.appendChild(tableHead);
          tableRoot.appendChild(tableBody);
        }

        const {offsetLeft: positionX, offsetTop: positionY} = chart.canvas;

        // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.left = positionX + tooltip.caretX + 'px';
        tooltipEl.style.top = positionY + tooltip.caretY + 'px';
        tooltipEl.style.font = tooltip.options.bodyFont.string;
        tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
      };

      console.log('informações do grafico linha:');
      console.log(data)

      const deposits = data['campo_grafico']['gr_deposits'];
      const dataDepositDays = deposits.map((deposit) => {
        const [day, month] = deposit.data.split('/');
        return `${day}/${month}`;
      });

      const qtdDepositDays = deposits.map((deposit) => deposit.qtd);

      const withdraws = data['campo_grafico']['gr_withdraws'];
      // const dataWithdrawDays = withdraws.map((withdraw) => {
      //   const [day, month] = withdraw.data.split('/');
      //   return `${day}/${month}`;
      // });

      const qtdWithdrawDays = withdraws.map((withdraw) => withdraw.qtd);

      const games = data['campo_grafico']['gr_games'];
      // const dataGameDays = games.map((game) => {
      //   const [day, month] = game.data.split('/');
      //   return `${day}/${month}`;
      // });

      const qtdGameDays = games.map((game) => game.qtd);

      const prizes = data['campo_grafico']['gr_prizes'];
      const qtdPrizeDays = prizes.map((prize) => prize.qtd);

      var lineChartCanvas = $("#performanceWeekLineChart").get(0).getContext("2d");
      var linePieData = {
        labels: dataDepositDays,
        datasets: [
          {
            label: 'Depósitos',
            data: qtdDepositDays,
            fill: false,
            borderColor: '#3388e3',
            backgroundColor: '#3388e3',
          },
          {
            label: 'Saques',
            data: qtdWithdrawDays,
            fill: false,
            borderColor: '#ff4d6b',
            backgroundColor: '#ff4d6b',
          },
          {
            label: 'Apostas',
            data: qtdGameDays,
            fill: false,
            borderColor: '#38ce3c',
            backgroundColor: '#38ce3c',
          },
          {
            label: 'Prêmios',
            data: qtdPrizeDays,
            fill: false,
            borderColor: '#edca1e',
            backgroundColor: '#edca1e',
          }
        ]
      };


      var linePieOptions = {
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'Chart.js Line Chart - External Tooltips'
          },
          tooltip: {
            enabled: false,
            position: 'nearest',
            external: externalTooltipHandler
          }
        }
      };

      var lineChart = new Chart(lineChartCanvas, {
        type: 'line',
        data: linePieData,
        options: linePieOptions
      });
    }

//   });
// })(jQuery);
