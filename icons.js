/* =================================================================
 *  ICONS — minimal hand-crafted line icons (24x24 viewBox)
 *  All paths use currentColor, stroke-width 2 (set via CSS)
 *  No external deps, no emoji.
 * ================================================================= */
const ICONS = {
  // ----- meta / section icons -----
  wallet:   '<rect x="2.5" y="6" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><circle cx="17" cy="15" r="1.2" fill="currentColor"/><path d="M5 6V5a2 2 0 0 1 2-2h11"/>',
  globe:    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 4.5 6 4.5 9S15 18 12 21"/><path d="M12 3c-3 3-4.5 6-4.5 9S9 18 12 21"/>',
  flag:     '<path d="M5 21V4"/><path d="M5 4h12l-3 4 3 4H5"/>',
  pin:      '<path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  pencil:   '<path d="M14 4l6 6-9 9H5v-6z"/><path d="M13 5l6 6"/>',
  trash:    '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M10 11v7"/><path d="M14 11v7"/>',
  plus:     '<path d="M12 5v14"/><path d="M5 12h14"/>',
  close:    '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',

  // ----- spend item icons -----
  egg:        '<path d="M12 2c-4 0-7 6-7 12a7 7 0 0 0 14 0c0-6-3-12-7-12z"/>',
  riceTri:    '<path d="M12 4 21 20H3z"/><path d="M6.5 16h11l-1 3h-9z" fill="currentColor"/>',
  bubbleCup:  '<path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M9 4h6"/><path d="M10 4l-1 3"/><path d="M14 4l1 3"/><circle cx="10" cy="14" r="0.8" fill="currentColor"/><circle cx="14" cy="12" r="0.8" fill="currentColor"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/>',
  drumstick:  '<path d="M16 4a4 4 0 0 1 4 4c0 3-3 4-5 4l-3 3a3 3 0 1 1-4-4l3-3c0-2 1-5 4-5h1z"/><path d="M7 17l-3 3"/>',
  utensils:   '<path d="M4 3v8a2 2 0 0 0 2 2h2v8"/><path d="M6 3v10"/><path d="M10 3v10"/><path d="M16 21V13a4 4 0 0 1 4-4V3"/>',
  coffee:     '<path d="M3 9h14v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M17 9h1.5a3.5 3.5 0 0 1 0 7H17"/><path d="M7 5v2"/><path d="M11 5v2"/><path d="M15 5v2"/>',
  sandwich:   '<path d="M3 14h18v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 11l9-7 9 7z"/><path d="M3 14h18"/><path d="M5 11l3-2"/><path d="M16 11l-3-2"/>',
  dumpling:   '<path d="M3 17a9 9 0 0 1 18 0z"/><path d="M7 9v8"/><path d="M12 7v10"/><path d="M17 9v8"/>',
  film:       '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h4"/><path d="M3 15h4"/><path d="M17 9h4"/><path d="M17 15h4"/><path d="M3 12h18"/><path d="M8 4v16"/><path d="M16 4v16"/>',
  noodle:     '<path d="M3 12a9 9 0 0 0 18 0z"/><path d="M3 12h18"/><path d="M8 4c0 1.5-1 1.5-1 3s1 1.5 1 3"/><path d="M12 3c0 1.5-1 1.5-1 3s1 1.5 1 3"/><path d="M16 4c0 1.5-1 1.5-1 3s1 1.5 1 3"/>',
  beef:       '<path d="M12 4c-4 0-7 2-7 5 0 1-1 1-2 2-1 1 0 3 1 4 5 3 13 3 17-1a5 5 0 0 0-2-9c-2-1-4-2-7-1z"/><circle cx="14" cy="10" r="2"/>',
  gamepad:    '<path d="M3 14a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4l-2-2H9l-2 2a4 4 0 0 1-4-4z"/><path d="M7 13h3"/><path d="M8.5 11.5v3"/><circle cx="15.5" cy="13" r="0.7" fill="currentColor"/><circle cx="17.5" cy="14.5" r="0.7" fill="currentColor"/>',
  mic:        '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/>',
  plane:      '<path d="M2 13l5-1.5 3-5h2l-1 6 6 1.5-1 1-6-1-2.5 6h-2l1.5-5L2 14z"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10 5h4"/><circle cx="12" cy="18.5" r="0.7" fill="currentColor"/>',

  // ----- ticket inline (THSR brand mark) -----
  qrCorner:   '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><rect x="11" y="11" width="2" height="2" fill="currentColor"/><rect x="13" y="14" width="2" height="2" fill="currentColor"/><rect x="16" y="12" width="2" height="2" fill="currentColor"/><rect x="18" y="15" width="2" height="2" fill="currentColor"/><rect x="11" y="17" width="2" height="2" fill="currentColor"/><rect x="14" y="19" width="2" height="2" fill="currentColor"/><rect x="17" y="19" width="2" height="2" fill="currentColor"/>',
};

// Helper: inline-svg builder
function svgIcon(name, size = 18, extraClass = '') {
  const path = ICONS[name];
  if (!path) return '';
  return `<svg class="ico ${extraClass}" width="${size}" height="${size}" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

window.ICONS = ICONS;
window.svgIcon = svgIcon;
