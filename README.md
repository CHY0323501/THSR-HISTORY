# 高鐵購票紀錄 · THSR Journey Tracker

一個用來記錄台灣高鐵搭乘紀錄的 RWD 單頁網站。可以新增/編輯/刪除行程，把車票渲染成新版或舊版實體車票的樣子，並且把累積里程在 3D 地球上換算成「從台灣可以飛到哪個城市」，同時把累積花費換算成日常生活中買得到的東西。

## 主要功能

- **CRUD 行程紀錄** — 新增、編輯、刪除；資料用 `localStorage` 持久化保存
- **新版 / 舊版車票切換** — 兩種完全手繪的實體票卡視覺，可在右上角切換
  - 新版：橘白配色 + QR Code 區 + 票卡兩側剪票孔
  - 舊版：米黃磁性票卡 + 黑色磁條 + 等寬字體 + 點陣紋路
- **3D 地球距離換算** — Three.js 渲染真實地球紋理，用大圓 (great-circle) 弧線從台北飛到符合累積里程的目的地，含相機 ease-out tween / 自動旋轉 / 標記脈動 / 飛行光點
  - 內建 70+ 個全球城市座標，以 haversine 公式即時計算最接近的城市
  - 範圍從澎湖 (~50 km) 到布宜諾斯艾利斯 (~19500 km)
- **花費換算動畫** — 把總花費換算成 15 種日常購物 (從茶葉蛋到 iPhone 16 Pro)，含 count-up 動畫、icon bounce、買得起時的 shimmer 高光
- **RWD** — 桌機 / 平板 / 手機都有最佳化版面 (900px / 560px breakpoints)
- **Lucide 風格手繪 SVG icon** — 無任何 emoji，所有圖示為自製線條 SVG

## 操作

| 動作 | 方式 |
|---|---|
| 新增行程 | 右上角「新增行程」按鈕 |
| 編輯行程 | 點擊任何車票卡片 |
| 刪除行程 | 滑鼠移到車票上 → 右上角垃圾桶圖示 |
| 切換車票樣式 | 右上角「新版車票 / 舊版車票」 |
| 旋轉地球 | 滑鼠拖曳 |
| 縮放地球 | 滾輪 |

## 資料

第一次造訪時會自動 seed 三筆範例車票，方便立即看到所有功能效果。之後使用者新增的紀錄都存在瀏覽器的 `localStorage`，重新整理或關閉瀏覽器都不會消失，但**不會跨裝置同步**。

要清除資料：DevTools → Application → Local Storage → 刪除 `thsr.tickets.v1` 和 `thsr.style.v1` 與 `thsr.seeded` 三個 key。

## 檔案架構

```
THSR-HISTORY/
├── index.html       主結構 (header / 統計卡 / spend / globe / 車票列表 / modal)
├── styles.css       全部手寫 CSS、無框架；新版/舊版車票兩套視覺、RWD breakpoints
├── icons.js         Lucide 風格手繪 SVG icon 集 + svgIcon() helper
├── data.js          THSR 站點 + 70+ 個全球城市 + 15 個日常品 + haversine + 城市配對
├── globe.js         Three.js 3D 地球：地球 / 大氣輝光 / 星空 / 弧線 / OrbitControls
├── app.js           CRUD / localStorage / 樣式切換 / 統計 / 動畫 / 事件繫結
└── lib/
    ├── three.min.js       Three.js r147 (vendored)
    ├── OrbitControls.js   軌道控制
    └── earth.jpg          地球白晝紋理 (NASA Blue Marble 衍生)
```

## 在本機執行

純前端，沒有 build 步驟，只要用任何 HTTP server 服務檔案即可：

```bash
# Python 內建
python3 -m http.server 8000

# Node 內建
npx serve .
```

打開 http://localhost:8000 即可使用。

> 不要直接用 `file://` 開啟 `index.html`，因為瀏覽器會擋住 Three.js 載入紋理 (CORS)。

## 技術細節

- **Three.js**：r147 (vendored 在 `lib/`，不依賴 CDN，完全離線可用)
- **距離計算**：haversine 大圓距離公式，誤差 < 0.5%
- **THSR 站點**：以南港為 0 km 計算的官方營運里程，總長 345 km
- **CSS**：CSS Grid + Flexbox + 自訂 properties；無 Bootstrap、無 Tailwind、無框架
- **JS**：原生 ES2020，無框架；每個檔案用 IIFE 隔離名稱空間
- **無第三方追蹤**

## License

MIT
