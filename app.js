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
  const fOrigin      = $('#f-origin');
  const fDest        = $('#f-destination');
  const fDate        = $('#f-date');
  const fTrain       = $('#f-train');
  const fCar         = $('#f-car');
  const fSeatNum     = $('#f-seat-num');
  const fSeatLetter  = $('#f-seat-letter');
  const fType        = $('#f-type');
  const fPrice       = $('#f-price');

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

  // -------- form selects --------
  // origin/destination 互斥：在另一個下拉中把對方那一站設為 disabled
  function buildStationOptionsHtml(disabledId) {
    return D.THSR_STATIONS.map((s) => {
      const dis = s.id === disabledId ? ' disabled' : '';
      return `<option value="${s.id}"${dis}>${s.name} ${s.en}</option>`;
    }).join('');
  }
  function syncStationDropdowns() {
    const o = fOrigin.value;
    const d = fDest.value;
    fOrigin.innerHTML = buildStationOptionsHtml(d);
    fDest.innerHTML   = buildStationOptionsHtml(o);
    fOrigin.value = o;
    fDest.value   = d;
  }
  function fillStationOptions(originId = 'taipei', destId = 'zuoying') {
    fOrigin.innerHTML = buildStationOptionsHtml(destId);
    fDest.innerHTML   = buildStationOptionsHtml(originId);
    fOrigin.value = originId;
    fDest.value   = destId;
  }

  function fillCarOptions() {
    fCar.innerHTML = D.CAR_OPTIONS.map(
      (c) => `<option value="${c.value}">${c.label}</option>`
    ).join('');
  }
  function fillSeatOptions() {
    fSeatNum.innerHTML =
      `<option value="" disabled selected>排</option>` +
      D.SEAT_ROWS.map((n) => `<option value="${n}">${n}</option>`).join('');
    fSeatLetter.innerHTML =
      `<option value="" disabled selected>位</option>` +
      D.SEAT_LETTERS.map((l) => `<option value="${l}">${l}</option>`).join('');
  }

  function getStation(id) { return D.THSR_STATIONS.find((s) => s.id === id); }

  // 兩站之間的距離 (取營運里程差的絕對值)
  function tripDistanceKm(originId, destId) {
    const a = getStation(originId);
    const b = getStation(destId);
    if (!a || !b) return 0;
    return Math.abs(a.km - b.km);
  }

  // 解析既有 seat 字串，e.g. "12A" / "08C" / "3D" → {num, letter}
  function parseSeat(s) {
    const m = String(s || '').match(/^(\d+)([A-Ea-e])$/);
    if (!m) return { num: '', letter: '' };
    return { num: String(parseInt(m[1], 10)), letter: m[2].toUpperCase() };
  }
  function joinSeat(num, letter) {
    if (!num || !letter) return '';
    return `${parseInt(num, 10)}${letter}`;
  }
  // 顯示 seat：把舊資料的 "08C" 也去掉前導 0
  function displaySeat(s) {
    if (!s) return '—';
    const { num, letter } = parseSeat(s);
    return num && letter ? `${num}${letter}` : s;
  }

  // 即時更新唯讀票價欄位
  function updatePriceField() {
    const fare = D.calcFare(fOrigin.value, fDest.value, fType.value);
    fPrice.value = fare ? `NT$ ${fare.toLocaleString()}` : '—';
    fPrice.dataset.amount = String(fare);
  }

  // -------- modal --------
  function openModal(ticket = null) {
    editingId = ticket ? ticket.id : null;
    modalTitle.textContent = ticket ? '編輯行程' : '新增行程';

    // Always rebuild every dropdown so editing legacy data never leaves
    // a select empty.
    fillCarOptions();
    fillSeatOptions();

    if (ticket) {
      fillStationOptions(ticket.origin, ticket.destination);
      fDate.value      = ticket.date;
      fTrain.value     = ticket.train || '';
      fCar.value       = ticket.car   || '1';
      const { num, letter } = parseSeat(ticket.seat);
      fSeatNum.value    = num    || '';
      fSeatLetter.value = letter || '';
      fType.value      = ticket.type || '標準票';
    } else {
      form.reset();
      fillStationOptions();
      fillCarOptions();
      fillSeatOptions();
      fDate.value = new Date().toISOString().slice(0, 10);
      fType.value = '標準票';
      fCar.value  = '6';
    }
    updatePriceField();
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
    if (!fSeatNum.value || !fSeatLetter.value) {
      alert('請選擇座位 (排 + 位)');
      return;
    }
    const fare = parseInt(fPrice.dataset.amount || '0', 10);
    const data = {
      id:          editingId || cryptoId(),
      date:        fDate.value,
      origin:      fOrigin.value,
      destination: fDest.value,
      train:       fTrain.value.trim(),
      car:         fCar.value,
      seat:        joinSeat(fSeatNum.value, fSeatLetter.value),
      type:        fType.value,
      price:       fare,
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
    const dateFmt = (t.date || '').replace(/-/g, ' / ');
    return `
      <article class="ticket new" data-id="${t.id}">
        <button class="ticket-delete" data-action="delete" aria-label="刪除">${window.svgIcon('trash',14)}</button>

        <aside class="t-stripe" aria-hidden="true">
          <span class="t-stripe-mark">高鐵</span>
          <span class="t-stripe-en">THSR</span>
        </aside>

        <div class="t-content">
          <header class="t-head">
            <div class="t-brand">
              <span class="t-brand-cn">台灣高鐵</span>
              <span class="t-brand-en">TAIWAN HIGH SPEED RAIL</span>
            </div>
            <span class="t-class">${escapeHtml(t.type || '標準票')}</span>
          </header>

          <div class="t-od">
            <div class="t-station">
              <span class="t-mini">起 站 FROM</span>
              <span class="t-name">${escapeHtml(origin?.name || '?')}</span>
              <span class="t-en">${escapeHtml(origin?.en || '')}</span>
            </div>
            <div class="t-arrow" aria-hidden="true"></div>
            <div class="t-station right">
              <span class="t-mini">迄 站 TO</span>
              <span class="t-name">${escapeHtml(dest?.name || '?')}</span>
              <span class="t-en">${escapeHtml(dest?.en || '')}</span>
            </div>
          </div>

          <div class="t-info">
            <div class="t-cell">
              <span class="t-lbl">日期 DATE</span>
              <span class="t-val">${escapeHtml(dateFmt)}</span>
            </div>
            <div class="t-cell">
              <span class="t-lbl">車次 TRAIN</span>
              <span class="t-val">${escapeHtml(t.train || '—')}</span>
            </div>
            <div class="t-cell">
              <span class="t-lbl">車廂 CAR</span>
              <span class="t-val">${escapeHtml(t.car || '—')}</span>
            </div>
            <div class="t-cell">
              <span class="t-lbl">座位 SEAT</span>
              <span class="t-val">${escapeHtml(displaySeat(t.seat))}</span>
            </div>
          </div>

          <footer class="t-foot">
            <div class="t-qr" aria-hidden="true">${window.svgIcon('qrCorner', 56)}</div>
            <div class="t-foot-mid">
              <span class="t-distance">${km} km · 大圓里程</span>
              <span class="t-foot-note">進站憑證 · BOARDING TICKET</span>
            </div>
            <div class="t-fare">
              <span class="t-fare-lbl">票價 FARE</span>
              <span class="t-fare-amt"><span class="t-fare-cur">NT$</span>${t.price.toLocaleString()}</span>
            </div>
          </footer>
        </div>
      </article>
    `;
  }

  function renderTicketOld(t) {
    const origin = getStation(t.origin);
    const dest   = getStation(t.destination);
    const km     = tripDistanceKm(t.origin, t.destination);
    const serial = (t.id.replace(/[^a-zA-Z0-9]/g, '').slice(-12).toUpperCase().match(/.{1,4}/g) || []).join(' ');
    const dateFmt = (t.date || '').replace(/-/g, '.');
    return `
      <article class="ticket old" data-id="${t.id}">
        <button class="ticket-delete" data-action="delete" aria-label="刪除">${window.svgIcon('trash',14)}</button>

        <div class="o-paper">
          <div class="o-head">
            <span class="o-brand-mark">高鐵</span>
            <span class="o-brand-en">TAIWAN HIGH SPEED RAIL</span>
            <span class="o-class">${escapeHtml(t.type || '標準票')}</span>
          </div>

          <div class="o-od">
            <span class="o-name">${escapeHtml(origin?.name || '?')}</span>
            <span class="o-arrow">→</span>
            <span class="o-name">${escapeHtml(dest?.name || '?')}</span>
          </div>
          <div class="o-od-en">
            <span>${escapeHtml(origin?.en || '')}</span>
            <span></span>
            <span>${escapeHtml(dest?.en || '')}</span>
          </div>

          <div class="o-meta">
            <div class="o-row"><span class="o-k">日期</span><span class="o-v">${dateFmt}</span></div>
            <div class="o-row"><span class="o-k">車次</span><span class="o-v">${escapeHtml(t.train || '—')} 次</span></div>
            <div class="o-row"><span class="o-k">車廂/座位</span><span class="o-v">${escapeHtml(t.car || '—')} 車 ${displaySeat(t.seat)}</span></div>
            <div class="o-row"><span class="o-k">里程</span><span class="o-v">${km} km</span></div>
          </div>

          <div class="o-fare-row">
            <span class="o-fare-label">票價</span>
            <span class="o-fare-amt">NT$ ${t.price.toLocaleString()}</span>
          </div>

          <div class="o-serial">${serial || 'TICKET'}</div>
          <div class="o-disclaimer">本票限當日當班次當區間有效 · 限購票本人使用</div>
        </div>

        <div class="o-magnetic" aria-hidden="true"></div>
      </article>
    `;
  }

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

    // origin / destination 互斥 + 票價即時更新
    fOrigin.addEventListener('change', () => { syncStationDropdowns(); updatePriceField(); });
    fDest.addEventListener('change',   () => { syncStationDropdowns(); updatePriceField(); });
    fType.addEventListener('change',   updatePriceField);

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
    fillCarOptions();
    fillSeatOptions();
    bind();
    setStyle(currentStyle);
    render();

    // Seed sample data on first visit (only if storage is empty)
    if (tickets.length === 0 && !localStorage.getItem('thsr.seeded')) {
      const today = new Date();
      const ymd = (d) => d.toISOString().slice(0, 10);
      const back = (n) => { const x = new Date(today); x.setDate(today.getDate() - n); return ymd(x); };
      const mk = (date, origin, dest, train, car, seat, type) => ({
        id: cryptoId(), date, origin, destination: dest, train, car, seat, type,
        price: D.calcFare(origin, dest, type), createdAt: Date.now(),
      });
      tickets = [
        mk(back(2),  'taipei',  'zuoying',  '0823', '6',  '12A', '商務票'),
        mk(back(15), 'banqiao', 'taichung', '0617', '4',  '8C',  '標準票'),
        mk(back(30), 'zuoying', 'taipei',   '1234', '10', '3D',  '自由座'),
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
