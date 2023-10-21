(() => {
  const a = {
    91: a => {
      a.exports = function (a, s) {
        return (
          s || (s = {}),
          a
            ? ((a = String(a.__esModule ? a.default : a)),
              s.hash && (a += s.hash),
              s.maybeNeedQuotes && /[\t\n\f\r "'=<>`]/.test(a)
                ? '"'.concat(a, '"')
                : a)
            : a
        );
      };
    },
    881: (a, s, e) => {
      a.exports = `${e.p}1b0797ee293c27ee54a1.jpg`;
    },
    696: (a, s, e) => {
      a.exports = `${e.p}cee00ea257229062d196.png`;
    },
  };
  const s = {};
  function e(n) {
    const i = s[n];
    if (void 0 !== i) return i.exports;
    const l = (s[n] = { exports: {} });
    return a[n](l, l.exports, e), l.exports;
  }
  (e.m = a),
    (e.n = a => {
      const s = a && a.__esModule ? () => a.default : () => a;
      return e.d(s, { a: s }), s;
    }),
    (e.d = (a, s) => {
      for (const n in s)
        e.o(s, n) &&
          !e.o(a, n) &&
          Object.defineProperty(a, n, { enumerable: !0, get: s[n] });
    }),
    (e.g = (function () {
      if (typeof globalThis === 'object') return globalThis;
      try {
        return this || new Function('return this')();
      } catch (a) {
        if (typeof window === 'object') return window;
      }
    })()),
    (e.o = (a, s) => Object.prototype.hasOwnProperty.call(a, s)),
    (() => {
      let a;
      e.g.importScripts && (a = `${e.g.location}`);
      const s = e.g.document;
      if (!a && s && (s.currentScript && (a = s.currentScript.src), !a)) {
        const n = s.getElementsByTagName('script');
        if (n.length) for (let i = n.length - 1; i > -1 && !a; ) a = n[i--].src;
      }
      if (!a)
        throw new Error(
          'Automatic publicPath is not supported in this browser',
        );
      (a = a
        .replace(/#.*$/, '')
        .replace(/\?.*$/, '')
        .replace(/\/[^\/]+$/, '/')),
        (e.p = a);
    })(),
    (e.b = document.baseURI || self.location.href),
    (() => {
      const a = e(91);
      const s = e.n(a);
      const n = new URL(e(696), e.b);
      const i = new URL(e(881), e.b);
      const l = s()(n);
      const t = s()(i);
      const o = ` <nav class="navbar default-layout-navbar col-lg-12 col-12 p-0 d-flex flex-row"> <div class="navbar-brand-wrapper d-flex align-items-center"> <a class="navbar-brand brand-logo d-flex" href="/admin/home"> <img src="${l}" alt="logo" class="logo-dark"/><span class="mt-0" style="color:#fff;font-size:20px;font-weight:400">Mega Bicho</span> </a> <a class="navbar-brand brand-logo-mini" href="/admin/home"><img src="${l}" alt="logo"/></a> </div> <div class="navbar-menu-wrapper d-flex align-items-center flex-grow-1"> <ul class="navbar-nav navbar-nav-right ml-auto"> <li class="nav-item float-start mr-3"><a> <i class="flag-icon flag-icon-us"></i> </a></li> <li class="nav-item float-start"><i class="icon-clock text-right clock-navbar-ico"></i> <tr> <td><input type="text" class="clock-navbar text-right" readonly="true" id="hora_inicio" name="hora_inicio" value="--:--:--" size="6"></td> </tr> </li> <li class="nav-item dropdown d-none d-xl-inline-flex user-dropdown"> <a class="nav-link dropdown-toggle" id="UserDropdown" href="#" data-toggle="dropdown" aria-expanded="false"> <img class="img-xs rounded-circle ml-2" src="${t}" alt="Profile image"> <span class="font-weight-normal" style="text-transform:capitalize"><div id="adm_name"></div></span></a> <div class="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="UserDropdown"> <div class="dropdown-header text-center"> <img class="img-md rounded-circle" src="${t}" alt="Profile image"> <p class="mb-1 mt-3"></p><div style="text-transform:capitalize" id="adm_name_desc"></div><p></p> <p class="font-weight-light text-muted mb-0">Administrador</p> </div> <a onclick="logout()" class="dropdown-item"><i class="dropdown-item-icon icon-power text-primary"></i>Sair</a> </div> </li> </ul> <button class="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas"> <span class="icon-menu"></span> </button> </div> </nav> `;
      (document.getElementById('navbar-content').innerHTML = o),
        (document.getElementById('sidebar-content').innerHTML =
          ' <nav class="sidebar sidebar-offcanvas" id="sidebar"> <ul class="nav"> <li class="nav-item nav-category"> <span class="nav-link">Página inicial</span> </li> <li class="nav-item"> <a class="nav-link" href="/admin/home"> <span class="menu-title">Home</span> <i class="icon-screen-desktop menu-icon"></i> </a> </li> <li class="nav-item nav-category"> <span class="nav-link">Monitoramento</span> </li> <li class="nav-item"> <a class="nav-link" data-toggle="collapse" href="#ui-gerencia" aria-expanded="false" aria-controls="ui-gerencia"> <span class="menu-title">Gerencia</span> <i class="icon-action-redo menu-icon"></i> </a> <div class="collapse" id="ui-gerencia"> <ul class="nav flex-column sub-menu"> <li class="nav-item"> <a class="nav-link" href="/bs/management/modbets.php">Aposta Modalidade</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/management/quotedbets.php">Aposta Cotadas</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/management/exchangecommissions.php">Comissões Cambistas</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/management/sendmessages.php">Mensagens Enviadas</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/management/banks.html">Bancos</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/management/financemonitory.php">Monitoramento Financeiro</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/management/coupons.php">Cupons</a></li> </ul> </div> </li> <li class="nav-item"> <a class="nav-link" data-toggle="collapse" href="#ui-transacao" aria-expanded="false" aria-controls="ui-transacao"> <span class="menu-title">Transações</span> <i class="icon-action-redo menu-icon"></i> </a> <div class="collapse" id="ui-transacao"> <ul class="nav flex-column sub-menu"> <li class="nav-item"> <a class="nav-link" href="/bs/transaction/alltransaction.php">Todas Transações</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/transaction/alltransactioncanceled.php">Cancelado</a></li> </ul> </div> </li> <li class="nav-item"> <a class="nav-link" data-toggle="collapse" href="#ui-rel" aria-expanded="false" aria-controls="ui-rel"> <span class="menu-title">Relatórios</span> <i class="icon-doc menu-icon"></i> </a> <div class="collapse" id="ui-rel"> <ul class="nav flex-column sub-menu"> <li class="nav-item"> <a class="nav-link" href="/bs/report/players.php">Jogadores</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/report/daygames.php">Jogos por Usuário</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/report/daygamessync.php">Jogos por Loterias</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/report/awarded.php">Jogos Premiados </a></li> <li class="nav-item"> <a class="nav-link" href="/bs/report/loteryinfo.php">Info. Loterias </a></li> <li class="nav-item"> <a class="nav-link" href="/bs/report/usedbonus.php">Cupons/Bonus Ganhos</a></li> </ul> </div> </li> <li class="nav-item"> <a class="nav-link" data-toggle="collapse" href="#ui-movim" aria-expanded="false" aria-controls="ui-movim"> <span class="menu-title">Movimentação</span> <i class="icon-chart menu-icon"></i> </a> <div class="collapse" id="ui-movim"> <ul class="nav flex-column sub-menu"> <li class="nav-item"> <a class="nav-link" href="/bs/movement/showresults.php">Resultados</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/movement/tsresultadoapuracao.php">Resultados Apurados</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/movement/parameters.php">Parâmetros</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/movement/dischargemonitoring.php">Monitoramento de descargas</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/movement/discharge.php">Registro de descargas</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/movement/generatepix.php"> Gerar Resultados PIX</a></li> </ul> </div> </li> <li class="nav-item nav-category"><span class="nav-link">Categorias</span></li> <li class="nav-item"> <a class="nav-link" data-toggle="collapse" href="#ui-user" aria-expanded="false" aria-controls="ui-user"> <span class="menu-title">Usuários</span> <i class="icon-user menu-icon"></i> </a> <div class="collapse" id="ui-user"> <ul class="nav flex-column sub-menu"> <li class="nav-item"> <a class="nav-link" href="/bs/users/news.php">Novos usuários</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/users/birthday.php">Aniversariantes</a></li> <li class="nav-item"> <a class="nav-link" href="/bs/users/historic.php">Historico de usuários</a></li> </ul> </div> </li> <li class="nav-item"> <a class="nav-link" href="/bs/prizes.php"> <span class="menu-title">Premios Excessivos</span> <i class="icon-handbag menu-icon"></i> </a> </li> <li class="nav-item"> <a class="nav-link" href="/bs/deposit.php"> <span class="menu-title">Depositos</span> <i class="icon-credit-card menu-icon"></i> </a> </li> <li class="nav-item"> <a class="nav-link" href="/bs/withdraw.php"> <span class="menu-title">Saque</span> <i class="icon-credit-card menu-icon"></i> </a> </li> <li class="nav-item"> <a class="nav-link" href="/bs/lotery.php"> <span class="menu-title">Loteria</span> <i class="icon-flag menu-icon"></i> </a> </li> <li class="nav-item"> <a class="nav-link" href="/bs/indicators.php"> <span class="menu-title">Indicadores</span> <i class="icon-chart menu-icon"></i> </a> </li> <li class="nav-item"> <a class="nav-link" href="/bs/configs.php"> <span class="menu-title">Configuração</span> <i class="icon-settings menu-icon"></i> </a> </li> </ul> </nav> '),
        (document.getElementById('footer-content').innerHTML =
          ' <footer class="footer"> <div class="d-sm-flex justify-content-center justify-content-sm-between"> <span class="text-muted d-block text-center text-sm-left d-sm-inline-block">Copyright © Mega Bicho</span> </div> </footer> ');
    })();
})();
