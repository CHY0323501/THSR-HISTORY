// =====================================================================
//  THSR 高鐵站點 (依南港為 0 km 計算的營運里程)
// =====================================================================
const THSR_STATIONS = [
  { id: 'nangang',  name: '南港', en: 'Nangang',  km: 0,   lat: 25.0533, lon: 121.6066 },
  { id: 'taipei',   name: '台北', en: 'Taipei',   km: 6,   lat: 25.0478, lon: 121.5170 },
  { id: 'banqiao',  name: '板橋', en: 'Banqiao',  km: 13,  lat: 25.0143, lon: 121.4637 },
  { id: 'taoyuan',  name: '桃園', en: 'Taoyuan',  km: 38,  lat: 25.0128, lon: 121.2150 },
  { id: 'hsinchu',  name: '新竹', en: 'Hsinchu',  km: 67,  lat: 24.8085, lon: 121.0405 },
  { id: 'miaoli',   name: '苗栗', en: 'Miaoli',   km: 96,  lat: 24.6076, lon: 120.8252 },
  { id: 'taichung', name: '台中', en: 'Taichung', km: 158, lat: 24.1124, lon: 120.6151 },
  { id: 'changhua', name: '彰化', en: 'Changhua', km: 188, lat: 24.0029, lon: 120.4290 },
  { id: 'yunlin',   name: '雲林', en: 'Yunlin',   km: 218, lat: 23.7363, lon: 120.4163 },
  { id: 'chiayi',   name: '嘉義', en: 'Chiayi',   km: 250, lat: 23.4615, lon: 120.3260 },
  { id: 'tainan',   name: '台南', en: 'Tainan',   km: 314, lat: 22.9249, lon: 120.2864 },
  { id: 'zuoying',  name: '左營', en: 'Zuoying',  km: 345, lat: 22.6873, lon: 120.3074 },
];

// =====================================================================
//  全球城市座標 (用於與台北比較大圓距離)
//  距離由 haversine 動態計算，不寫死 → 永遠精準
// =====================================================================
const TAIPEI = { name: '台北', lat: 25.0330, lon: 121.5654 };

const WORLD_CITIES = [
  // --- 超近距離 (< 500 km) ---
  { name: '澎湖馬公', country: '台灣',   lat: 23.5654, lon: 119.5793 },
  { name: '與那國島', country: '日本',   lat: 24.4571, lon: 123.0083 },
  { name: '石垣島',   country: '日本',   lat: 24.3448, lon: 124.1572 },
  { name: '宮古島',   country: '日本',   lat: 24.7944, lon: 125.2810 },
  { name: '廈門',     country: '中國',   lat: 24.4798, lon: 118.0894 },
  { name: '福州',     country: '中國',   lat: 26.0745, lon: 119.2965 },

  // --- 500–1500 km ---
  { name: '那霸',     country: '日本',   lat: 26.2124, lon: 127.6809 },
  { name: '香港',     country: '香港',   lat: 22.3193, lon: 114.1694 },
  { name: '澳門',     country: '澳門',   lat: 22.1987, lon: 113.5439 },
  { name: '深圳',     country: '中國',   lat: 22.5431, lon: 114.0579 },
  { name: '廣州',     country: '中國',   lat: 23.1291, lon: 113.2644 },
  { name: '上海',     country: '中國',   lat: 31.2304, lon: 121.4737 },
  { name: '馬尼拉',   country: '菲律賓', lat: 14.5995, lon: 120.9842 },
  { name: '福岡',     country: '日本',   lat: 33.5902, lon: 130.4017 },

  // --- 1500–3000 km ---
  { name: '首爾',     country: '韓國',   lat: 37.5665, lon: 126.9780 },
  { name: '北京',     country: '中國',   lat: 39.9042, lon: 116.4074 },
  { name: '大阪',     country: '日本',   lat: 34.6937, lon: 135.5023 },
  { name: '東京',     country: '日本',   lat: 35.6762, lon: 139.6503 },
  { name: '河內',     country: '越南',   lat: 21.0285, lon: 105.8542 },
  { name: '永珍',     country: '寮國',   lat: 17.9757, lon: 102.6331 },
  { name: '金邊',     country: '柬埔寨', lat: 11.5564, lon: 104.9282 },
  { name: '曼谷',     country: '泰國',   lat: 13.7563, lon: 100.5018 },
  { name: '胡志明市', country: '越南',   lat: 10.7626, lon: 106.6602 },
  { name: '帛琉',     country: '帛琉',   lat: 7.5006,  lon: 134.5825 },
  { name: '札幌',     country: '日本',   lat: 43.0618, lon: 141.3545 },
  { name: '海參崴',   country: '俄羅斯', lat: 43.1198, lon: 131.8869 },
  { name: '關島',     country: '美國',   lat: 13.4443, lon: 144.7937 },

  // --- 3000–5000 km ---
  { name: '吉隆坡',   country: '馬來西亞', lat: 3.1390,  lon: 101.6869 },
  { name: '新加坡',   country: '新加坡',   lat: 1.3521,  lon: 103.8198 },
  { name: '仰光',     country: '緬甸',     lat: 16.8409, lon: 96.1735  },
  { name: '雅加達',   country: '印尼',     lat: -6.2088, lon: 106.8456 },
  { name: '達卡',     country: '孟加拉',   lat: 23.8103, lon: 90.4125  },
  { name: '加爾各答', country: '印度',     lat: 22.5726, lon: 88.3639  },
  { name: '烏蘭巴托', country: '蒙古',     lat: 47.8864, lon: 106.9057 },
  { name: '加德滿都', country: '尼泊爾',   lat: 27.7172, lon: 85.3240  },
  { name: '峇里島',   country: '印尼',     lat: -8.6705, lon: 115.2126 },

  // --- 5000–8000 km ---
  { name: '新德里',   country: '印度',     lat: 28.6139, lon: 77.2090  },
  { name: '可倫坡',   country: '斯里蘭卡', lat: 6.9271,  lon: 79.8612  },
  { name: '孟買',     country: '印度',     lat: 19.0760, lon: 72.8777  },
  { name: '達爾文',   country: '澳洲',     lat: -12.4634,lon: 130.8456 },
  { name: '伯斯',     country: '澳洲',     lat: -31.9505,lon: 115.8605 },
  { name: '雪梨',     country: '澳洲',     lat: -33.8688,lon: 151.2093 },
  { name: '墨爾本',   country: '澳洲',     lat: -37.8136,lon: 144.9631 },
  { name: '杜拜',     country: '阿聯酋',   lat: 25.2048, lon: 55.2708  },
  { name: '德黑蘭',   country: '伊朗',     lat: 35.6892, lon: 51.3890  },
  { name: '莫斯科',   country: '俄羅斯',   lat: 55.7558, lon: 37.6173  },
  { name: '伊斯坦堡', country: '土耳其',   lat: 41.0082, lon: 28.9784  },
  { name: '安克拉治', country: '美國',     lat: 61.2181, lon: -149.9003 },
  { name: '檀香山',   country: '美國夏威夷', lat: 21.3069, lon: -157.8583 },

  // --- 8000–11000 km ---
  { name: '奧克蘭',   country: '紐西蘭',   lat: -36.8485,lon: 174.7633 },
  { name: '開羅',     country: '埃及',     lat: 30.0444, lon: 31.2357  },
  { name: '雅典',     country: '希臘',     lat: 37.9838, lon: 23.7275  },
  { name: '羅馬',     country: '義大利',   lat: 41.9028, lon: 12.4964  },
  { name: '柏林',     country: '德國',     lat: 52.5200, lon: 13.4050  },
  { name: '巴黎',     country: '法國',     lat: 48.8566, lon: 2.3522   },
  { name: '阿姆斯特丹', country: '荷蘭',   lat: 52.3676, lon: 4.9041   },
  { name: '倫敦',     country: '英國',     lat: 51.5074, lon: -0.1278  },
  { name: '馬德里',   country: '西班牙',   lat: 40.4168, lon: -3.7038  },
  { name: '哥本哈根', country: '丹麥',     lat: 55.6761, lon: 12.5683  },
  { name: '斯德哥爾摩', country: '瑞典',   lat: 59.3293, lon: 18.0686  },
  { name: '雷克雅維克', country: '冰島',   lat: 64.1466, lon: -21.9426 },
  { name: '溫哥華',   country: '加拿大',   lat: 49.2827, lon: -123.1207 },
  { name: '西雅圖',   country: '美國',     lat: 47.6062, lon: -122.3321 },
  { name: '舊金山',   country: '美國',     lat: 37.7749, lon: -122.4194 },
  { name: '洛杉磯',   country: '美國',     lat: 34.0522, lon: -118.2437 },
  { name: '奈洛比',   country: '肯亞',     lat: -1.2921, lon: 36.8219  },

  // --- 11000–15000 km ---
  { name: '芝加哥',   country: '美國',     lat: 41.8781, lon: -87.6298 },
  { name: '多倫多',   country: '加拿大',   lat: 43.6532, lon: -79.3832 },
  { name: '紐約',     country: '美國',     lat: 40.7128, lon: -74.0060 },
  { name: '邁阿密',   country: '美國',     lat: 25.7617, lon: -80.1918 },
  { name: '哈瓦那',   country: '古巴',     lat: 23.1136, lon: -82.3666 },
  { name: '墨西哥城', country: '墨西哥',   lat: 19.4326, lon: -99.1332 },
  { name: '卡薩布蘭加',country: '摩洛哥',  lat: 33.5731, lon: -7.5898  },
  { name: '拉哥斯',   country: '奈及利亞', lat: 6.5244,  lon: 3.3792   },
  { name: '約翰尼斯堡',country: '南非',    lat: -26.2041,lon: 28.0473  },
  { name: '開普敦',   country: '南非',     lat: -33.9249,lon: 18.4241  },

  // --- 15000+ km (地球幾乎對蹠) ---
  { name: '利馬',     country: '秘魯',     lat: -12.0464,lon: -77.0428 },
  { name: '聖保羅',   country: '巴西',     lat: -23.5505,lon: -46.6333 },
  { name: '里約熱內盧',country: '巴西',    lat: -22.9068,lon: -43.1729 },
  { name: '布宜諾斯艾利斯', country: '阿根廷', lat: -34.6037,lon: -58.3816 },
  { name: '聖地牙哥', country: '智利',     lat: -33.4489,lon: -70.6693 },
];

// =====================================================================
//  geo helpers
// =====================================================================
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 找出與「累積里程」最接近的城市 (距離 = 從台北的大圓距離)
function findClosestCity(km) {
  if (km <= 0) return null;
  let best = null;
  let bestDiff = Infinity;
  for (const c of WORLD_CITIES) {
    const d = haversineKm(TAIPEI, c);
    const diff = Math.abs(d - km);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = { ...c, distance: d, diff };
    }
  }
  return best;
}

// =====================================================================
//  日常生活換算 — 花費可以買幾個 (NT$, 台灣常見定價)
//  排序：由便宜到貴，讓用戶感受 "可以買幾百個" → "幾乎買得起一支"
// =====================================================================
const SPEND_ITEMS = [
  { icon: 'egg',        name: '茶葉蛋',           price: 13   },
  { icon: 'riceTri',    name: '7-11 御飯糰',     price: 30   },
  { icon: 'bubbleCup',  name: '50 嵐珍珠奶茶',    price: 65   },
  { icon: 'drumstick',  name: '師大雞排',         price: 80   },
  { icon: 'utensils',   name: '台鐵便當',         price: 100  },
  { icon: 'coffee',     name: '星巴克拿鐵',       price: 145  },
  { icon: 'sandwich',   name: '麥當勞大麥克套餐', price: 165  },
  { icon: 'dumpling',   name: '鼎泰豐小籠包',     price: 280  },
  { icon: 'film',       name: '電影票',           price: 320  },
  { icon: 'noodle',     name: '一蘭拉麵',         price: 380  },
  { icon: 'beef',       name: '王品牛排',         price: 1500 },
  { icon: 'gamepad',    name: 'AAA 遊戲',         price: 1790 },
  { icon: 'mic',        name: '演唱會內場票',     price: 6800 },
  { icon: 'plane',      name: '東京機票 (來回)',  price: 13800 },
  { icon: 'smartphone', name: 'iPhone 16 Pro',    price: 36900 },
];

// 暴露到全域 (給 globe.js / app.js 用)
window.THSR_DATA = {
  THSR_STATIONS,
  WORLD_CITIES,
  TAIPEI,
  SPEND_ITEMS,
  haversineKm,
  findClosestCity,
};
