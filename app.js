/* =================================================================
 *  app.js — CRUD logic + ticket rendering + style switching + stats
 * ================================================================= */
(function () {
  const D = window.THSR_DATA;
  const STORAGE_KEY = 'thsr.tickets.v1';
  const STYLE_KEY   = 'thsr.style.v1';

  // -------- state --------
  let tickets = loadTickets();
  let currentStyle = localStorage.getItem(STYLE_KEY) || 'new';
  let editingId = null;

  // -------- elements --------
  const $ = (sel) => document.querySelector(sel);
  const ticketsList   = $('#ticketsList');
  const emptyState    = $('#emptyState');
  const totalTrips    = $('#totalTrips');
  const totalDistance = $('#totalDistance');
  const totalCost     = $('#totalCost');
  const matchHeadline = $('#matchHeadline');
  const matchDetail   = $('#matchDetail');
  const matchMeta     = $('#matchMeta');
  const spendGrid     = $('#spendGrid');
  const spendTotal    = $('#spendTotal');

  const modal       = $('#ticketModal');
  const form        = $('#ticketForm');
  const modalTitle  = $('#modalTitle');
  const fOrigin     = $('#f-origin');
  const fDest       = $('#f-destination');
  const fDate       = $('#f-date');
  const fTrain      = $('#f-train');
  const fCar        = $('#f-car');
  const fSeat       = $('#f-seat');
  const fType       = $('#f-type');
  const fPrice      = $('#f-price');

  // -------- storage --------
  function loadTickets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function saveTickets() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }

  // -------- station selects --------
  function fillStationOptions() {
    const opts = D.THSR_STATIONS.map(
      (s) => `<option value="${s.id}">${s.name} ${s.en}</option>`
    ).join('');
    fOrigin.innerHTML = opts;
    fDest.innerHTML = opts;
    fOrigin.value = 'taipei';
    fDest.value = 'zuoying';
  }

  function getStation(id) { return D.THSR_STATIONS.find((s) => s.id === id); }

  // 兩站之間的距離 (取營運里程差的絕對值)
  function tripDistanceKm(originId, destId) {
    const a = getStation(originId);
    const b = getStation(destId);
    if (!a || !b) return 0;
    return Math.abs(a.km - b.km);
  }

  // -------- modal --------
  function openModal(ticket = null) {
    editingId = ticket ? ticket.id : null;
    modalTitle.textContent = ticket ? '編輯行程' : '新增行程';
    if (ticket) {
      fDate.value     = ticket.date;
      fOrigin.value   = ticket.origin;
      fDest.value     = ticket.destination;
      fTrain.value    = ticket.train || '';
      fCar.value      = ticket.car   || '';
      fSeat.value     = ticket.seat  || '';
      fType.value     = ticket.type  || '標準票';
      fPrice.value    = ticket.price ?? '';
    } else {
      form.reset();
      fillStationOptions();
      fDate.value = new Date().toISOString().slice(0, 10);
      fType.value = '標準票';
    }
    modal.hidden = false;
  }
  function closeModal() {
    modal.hidden = true;
    editingId = null;
  }

  // -------- form submit --------
  function onSubmit(e) {
    e.preventDefault();
    if (fOrigin.value === fDest.value) {
      alert('起站與到站不能相同');
      return;
    }
    const data = {
      id:          editingId || cryptoId(),
      date:        fDate.value,
      origin:      fOrigin.value,
      destination: fDest.value,
      train:       fTrain.value.trim(),
      car:         fCar.value.trim(),
      seat:        fSeat.value.trim(),
      type:        fType.value,
      price:       Number(fPrice.value) || 0,
      createdAt:   editingId
        ? (tickets.find((t) => t.id === editingId)?.createdAt || Date.now())
        : Date.now(),
    };

    if (editingId) {
      const idx = tickets.findIndex((t) => t.id === editingId);
      if (idx >= 0) tickets[idx] = data;
    } else {
      tickets.unshift(data);
    }
    saveTickets();
    closeModal();
    render();
  }

  function cryptoId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 't' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // -------- delete --------
  function deleteTicket(id) {
    if (!confirm('確定要刪除這張車票嗎？')) return;
    tickets = tickets.filter((t) => t.id !== id);
    saveTickets();
    render();
  }

  // -------- ticket rendering --------
  function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => (
      { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
    ));
  }

  function renderTicketNew(t) {
    const origin = getStation(t.origin);
    const dest   = getStation(t.destination);
    const km     = tripDistanceKm(t.origin, t.destination);
    return `
      <article class="ticket new" data-id="${t.id}">
        <button class="ticket-delete" data-action="delete" aria-label="刪除">${window.svgIcon('trash',14)}</button>
        <div class="ticket-band">
          <span class="brand-line"><span class="mini-logo">THSR</span> 台灣高鐵</span>
          <span class="ticket-type-tag">${escapeHtml(t.type || '標準票')}</span>
        </div>
        <div class="ticket-body">
          <div class="od">
            <div class="station">
              <span class="station-name">${escapeHtml(origin?.name || '?')}</span>
              <span class="station-en">${escapeHtml(origin?.en || '')}</span>
            </div>
            <div class="arrow">→</div>
            <div class="station right">
              <span class="station-name">${escapeHtml(dest?.name || '?')}</span>
              <span class="station-en">${escapeHtml(dest?.en || '')}</span>
            </div>
          </div>
          <div class="info-grid">
            <div class="cell"><span class="lbl">日期</span><span class="val">${escapeHtml(t.date)}</span></div>
            <div class="cell"><span class="lbl">車次</span><span class="val">${escapeHtml(t.train || '—')}</span></div>
            <div class="cell"><span class="lbl">車廂/座位</span><span class="val">${escapeHtml((t.car||'—')+'  '+(t.seat||'—'))}</span></div>
            <div class="cell"><span class="lbl">里程</span><span class="val">${km} km</span></div>
          </div>
        </div>
        <div class="ticket-footer">
          <div class="qr" aria-hidden="true"></div>
          <div class="price"><small>NT$</small>${t.price.toLocaleString()}</div>
        </div>
      </article>
    `;
  }

  function renderTicketOld(t) {
    const origin = getStation(t.origin);
    const dest   = getStation(t.destination);
    const ticketNo = t.id.slice(-8).toUpperCase();
    return `
      <article class="ticket old" data-id="${t.id}">
        <button class="ticket-delete" data-action="delete" aria-label="刪除">${window.svgIcon('trash',14)}</button>
        <div class="old-head">
          <div class="left">
            <span class="old-logo">THSR</span>
            <span class="title">高鐵車票 TICKET</span>
          </div>
          <span class="ticket-no">No.${escapeHtml(ticketNo)}</span>
        </div>
        <div class="od-old">
          <div class="station">
            <span class="label">FROM 起站</span>
            <span class="name">${escapeHtml(origin?.name || '?')}</span>
          </div>
          <div class="arrow">▶</div>
          <div class="station right">
            <span class="label">TO 到站</span>
            <span class="name">${escapeHtml(dest?.name || '?')}</span>
          </div>
        </div>
        <div class="meta-old">
          <div class="row"><span class="lbl">日期</span><span class="val">${escapeHtml(t.date)}</span></div>
          <div class="row"><span class="lbl">車次</span><span class="val">${escapeHtml(t.train || '—')}</span></div>
          <div class="row"><span class="lbl">車廂</span><span class="val">${escapeHtml(t.car || '—')}</span></div>
          <div class="row"><span class="lbl">座位</span><span class="val">${escapeHtml(t.seat || '—')}</span></div>
          <div class="row"><span class="lbl">類別</span><span class="val">${escapeHtml(t.type || '標準票')}</span></div>
          <div class="row"><span class="lbl">里程</span><span class="val">${km_(t)} km</span></div>
        </div>
        <div class="price-old">
          <span class="ttype">FARE</span>
          <span class="amt"><small>NT$</small>${t.price.toLocaleString()}</span>
        </div>
        <div class="magnetic"></div>
      </article>
    `;
  }
  function km_(t) { return tripDistanceKm(t.origin, t.destination); }

  function renderTickets() {
    if (!tickets.length) {
      ticketsList.innerHTML = '';
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;
    const fn = currentStyle === 'old' ? renderTicketOld : renderTicketNew;
    ticketsList.innerHTML = tickets.map(fn).join('');
  }

  // -------- stats + globe --------
  function renderStats() {
    const trips = tickets.length;
    const distance = tickets.reduce((sum, t) => sum + tripDistanceKm(t.origin, t.destination), 0);
    const cost = tickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    totalTrips.textContent    = trips.toLocaleString();
    totalDistance.textContent = distance.toLocaleString();
    totalCost.textContent     = cost.toLocaleString();
    return { trips, distance, cost };
  }

  function renderMatch(distance) {
    if (distance <= 0) {
      matchHeadline.textContent = '尚無紀錄，新增行程看看你能飛多遠！';
      matchDetail.textContent   = '';
      matchMeta.innerHTML       = '';
      if (window.GLOBE) window.GLOBE.setDestination(null);
      return;
    }
    const match = D.findClosestCity(distance);
    if (!match) return;
    const diff = Math.round(match.distance - distance);
    const sign = diff >= 0 ? '還差' : '超過';
    matchHeadline.innerHTML = `飛到 <span class="match-city">${escapeHtml(match.name)}</span>`;
    matchDetail.textContent =
      `從台北到 ${match.name}（${match.country}）的大圓距離約 ${Math.round(match.distance).toLocaleString()} km，` +
      `${sign} ${Math.abs(diff).toLocaleString()} km。`;
    matchMeta.innerHTML = `
      <span class="meta-pill">${window.svgIcon('flag',14)} 累積 ${Math.round(distance).toLocaleString()} km</span>
      <span class="meta-pill">${window.svgIcon('globe',14)} ${escapeHtml(match.country)}</span>
      <span class="meta-pill">${window.svgIcon('pin',14)} ${match.lat.toFixed(2)}°, ${match.lon.toFixed(2)}°</span>
    `;
    if (window.GLOBE) window.GLOBE.setDestination(match);
  }

  // -------- style toggle --------
  function setStyle(style) {
    currentStyle = style;
    localStorage.setItem(STYLE_KEY, style);
    document.querySelectorAll('.style-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.style === style);
    });
    renderTickets();
  }

  // -------- spend conversion --------
  const lastCounts = new Map();   // idx -> previous count, for tween-from value

  function renderSpend(cost) {
    spendTotal.textContent = cost.toLocaleString();
    if (!spendGrid.children.length) {
      // first build
      spendGrid.innerHTML = D.SPEND_ITEMS.map((item, i) => `
        <div class="spend-card" data-idx="${i}">
          <span class="icon-wrap">${window.svgIcon(item.icon, 32)}</span>
          <div class="count-row">
            <span class="count" data-target="0">0</span>
            <span class="unit">個</span>
          </div>
          <span class="name">${escapeHtml(item.name)}</span>
          <span class="each">NT$ ${item.price.toLocaleString()} / 個</span>
        </div>
      `).join('');
    }

    D.SPEND_ITEMS.forEach((item, i) => {
      const card  = spendGrid.querySelector(`.spend-card[data-idx="${i}"]`);
      if (!card) return;
      const countEl = card.querySelector('.count');
      const newCount = Math.floor(cost / item.price);
      const prev = lastCounts.get(i) ?? 0;
      lastCounts.set(i, newCount);

      // afford glow
      card.classList.toggle('afford', newCount >= 1 && cost >= item.price);

      // bounce when value changes
      if (newCount !== prev) {
        card.classList.remove('pulse');
        // restart animation
        void card.offsetWidth;
        card.classList.add('pulse');
        animateCount(countEl, prev, newCount, 700);
      } else {
        countEl.textContent = newCount.toLocaleString();
      }
    });
  }

  function animateCount(el, from, to, duration) {
    const start = performance.now();
    const diff = to - from;
    function step(now) {
      const k = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - k, 3);
      const v = Math.round(from + diff * ease);
      el.textContent = v.toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // -------- master render --------
  function render() {
    renderTickets();
    const { distance, cost } = renderStats();
    renderMatch(distance);
    renderSpend(cost);
  }

  // -------- event wiring --------
  function bind() {
    $('#addBtn').addEventListener('click', () => openModal());
    $('#addBtnEmpty').addEventListener('click', () => openModal());
    form.addEventListener('submit', onSubmit);

    document.querySelectorAll('[data-close]').forEach((el) =>
      el.addEventListener('click', closeModal)
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    document.querySelectorAll('.style-btn').forEach((btn) => {
      btn.addEventListener('click', () => setStyle(btn.dataset.style));
    });

    ticketsList.addEventListener('click', (e) => {
      const card = e.target.closest('.ticket');
      if (!card) return;
      const id = card.dataset.id;
      const actionEl = e.target.closest('[data-action]');
      if (actionEl && actionEl.dataset.action === 'delete') {
        e.stopPropagation();
        deleteTicket(id);
        return;
      }
      const t = tickets.find((x) => x.id === id);
      if (t) openModal(t);
    });
  }

  // -------- icon hydration (replace [data-icon=name] placeholders) --------
  function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach((el) => {
      const name = el.dataset.icon;
      const size = parseInt(el.dataset.size || '20', 10);
      el.innerHTML = window.svgIcon(name, size);
      el.removeAttribute('data-icon');
    });
  }

  // -------- init --------
  function init() {
    hydrateIcons();
    fillStationOptions();
    bind();
    setStyle(currentStyle);
    render();

    // Seed sample data on first visit (only if storage is empty)
    if (tickets.length === 0 && !localStorage.getItem('thsr.seeded')) {
      const today = new Date();
      const ymd = (d) => d.toISOString().slice(0, 10);
      const back = (n) => { const x = new Date(today); x.setDate(today.getDate() - n); return ymd(x); };
      tickets = [
        { id: cryptoId(), date: back(2),  origin: 'taipei',   destination: 'zuoying',  train: '0823', car: '6',  seat: '12A', type: '標準票', price: 1490, createdAt: Date.now() },
        { id: cryptoId(), date: back(15), origin: 'banqiao',  destination: 'taichung', train: '0617', car: '4',  seat: '08C', type: '商務票', price: 1145, createdAt: Date.now() },
        { id: cryptoId(), date: back(30), origin: 'zuoying',  destination: 'taipei',   train: '1234', car: '10', seat: '03D', type: '標準票', price: 1490, createdAt: Date.now() },
      ];
      saveTickets();
      localStorage.setItem('thsr.seeded', '1');
      render();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
