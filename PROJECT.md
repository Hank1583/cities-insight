# Cities Insight — 專案功能說明

> 台灣各縣市環境、能源、水資源與經濟趨勢數據可視化平台

---

## 技術堆棧

| 項目 | 版本 |
|------|------|
| Next.js | 16.2.3 (App Router + Static Export) |
| React | 19.2.3 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| Lucide React | 1.8.0 (圖標) |
| 部署平台 | Cloudflare Pages (via wrangler + @opennextjs/cloudflare) |

---

## 目錄結構

```
cities-insight/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 全局佈局（側邊欄 + 頂部欄）
│   ├── globals.css               # 全局樣式
│   ├── page.tsx                  # Dashboard 首頁
│   ├── cities/
│   │   ├── page.tsx              # 城市列表頁面
│   │   └── [cityCode]/
│   │       ├── page.tsx          # 城市詳情頁面（靜態預生成）
│   │       └── CityClient.tsx    # 城市詳情客戶端邏輯
│   ├── indicators/
│   │   ├── page.tsx              # 指標列表頁面
│   │   └── [indicatorCode]/
│   │       ├── page.tsx          # 指標詳情頁面
│   │       └── IndicatorClient.tsx
│   ├── compare/
│   │   └── page.tsx              # 城市比較頁面
│   ├── alerts/
│   │   └── page.tsx              # LINE 示警設定頁面
│   └── reports/
│       └── page.tsx              # 週報管理頁面
│
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx        # 左側導航欄
│   │   ├── TopNavbar.tsx         # 頂部導航欄
│   │   └── PageHeader.tsx        # 頁面標題組件
│   ├── dashboard/
│   │   ├── MetricCard.tsx        # KPI 指標卡片
│   │   └── AlertCard.tsx         # 警報卡片
│   ├── city/
│   │   ├── CityMetricSummary.tsx # 城市 8 個指標摘要
│   │   └── CityIndicatorTabs.tsx # 城市指標標籤頁
│   └── charts/
│       ├── LineTrendChart.tsx    # 趨勢線圖（自繪 SVG）
│       ├── BarRankingChart.tsx   # 排行柱狀圖（自繪 SVG）
│       ├── CompareLineChart.tsx  # 多城市比較線圖（自繪 SVG）
│       ├── IndicatorCharts.tsx   # 指標圖表包裝組件
│       └── index.ts
│
├── lib/
│   ├── api/
│   │   └── client.ts             # API 請求客戶端 + TypeScript 接口定義
│   └── mock/                     # 模擬資料（開發用）
│       ├── cities.ts
│       ├── indicators.ts
│       ├── series.ts
│       └── summaries.ts
│
├── types/                        # TypeScript 類型定義
│   ├── city.ts
│   ├── indicator.ts
│   ├── alert.ts
│   └── report.ts
│
├── public/
│   ├── logo.svg
│   └── _routes.json              # Cloudflare Routes 配置
│
├── next.config.ts                # Next.js 配置（output: 'export'）
├── open-next.config.ts           # Cloudflare 適配器配置
├── tsconfig.json
└── package.json
```

---

## 頁面功能說明

### 1. Dashboard 首頁 (`app/page.tsx`)

全台城市關鍵指標概覽儀表板。

**展示內容：**
- 全台 5 個 KPI 卡片：全台平均 AQI、即時用電(GW)、平均降雨量(mm)、水庫平均蓄水率(%)、平均備轉容量(%)
- AQI Top 5 最污染城市排行
- 水庫蓄水率最低 Top 5 排行
- 最近 4 筆異常警報

**API：**
- `GET /cities`
- `GET /cities/{code}/summary`
- `GET /alerts?limit=4`

---

### 2. 城市列表 (`app/cities/page.tsx`)

瀏覽台灣 22 個縣市的基本資訊與即時指標。

**功能：**
- 搜索：支持中文名稱、英文名稱、城市代碼
- 排序：名稱、AQI、用電、降雨
- 切換視圖：卡片模式 / 表格模式

**卡片顯示：** 城市名稱、人口、面積、AQI、用電(MW)、降雨(mm)

---

### 3. 城市詳情 (`app/cities/[cityCode]/`)

單一城市的詳細數據分析頁面，利用 `generateStaticParams()` 預生成全部 22 個城市頁面。

**展示內容：**
- 城市基礎資訊（名稱、人口、面積、座標）
- 8 個指標摘要卡片

| 指標 | 顏色 |
|------|------|
| AQI | 黃色 |
| PM2.5 | 橙色 |
| 氣溫 (°C) | 紅色 |
| 降雨量 (mm) | 紫色 |
| 水庫蓄水率 (%) | 藍色 |
| 月用電量 (億度) | 橙色 |
| 尖峰用電 (MW) | 黃色 |
| 備轉容量率 (%) | 綠色 |

**三個指標標籤頁：**
- **環境**：AQI、氣溫、降雨（近 30 天趨勢線圖）
- **水資源**：水庫蓄水率（近 30 天）+ 相關水庫列表
- **能源**：月用電量（近 12 個月）、尖峰用電、備轉容量率

---

### 4. 指標列表 (`app/indicators/page.tsx`)

瀏覽所有可追蹤指標。

**功能：**
- 按類別篩選：全部、環境、水資源、能源、經濟
- 搜索：中文名稱、指標代碼
- 卡片顯示：名稱、分類、描述、單位、更新頻率、數據來源

---

### 5. 指標詳情 (`app/indicators/[indicatorCode]/`)

單一指標的全台趨勢與各城市排行。

**展示內容：**
- 指標元數據（名稱、代碼、描述、單位、來源）
- 全國趨勢線圖（或台北市代表線）
- 各城市 Top 10 排行柱狀圖（非全國性指標）

**特殊指標邏輯：**
- `electricity_load`、`reserve_margin` → 全國統計，不提供城市排行
- `electricity_monthly` → 月度數據（近 12 個月）
- 其他指標 → 日度數據（近 30 天）

---

### 6. 城市比較 (`app/compare/page.tsx`)

同一指標下，多城市數據對比分析。

**功能：**
- 可選指標：aqi、pm25、weather_temp、rainfall、reservoir_storage、electricity_monthly
- 最多同時選擇 6 個城市（預設：台北、台中、高雄、台南、桃園）
- 時間範圍：7 天、30 天、90 天（electricity_monthly 固定 365 天）
- 多線比較圖 + 最新數值排行表

**API：**
- `GET /compare?indicator={code}&cities={codes}&range={range}&granularity={grain}`

---

### 7. LINE 示警設定 (`app/alerts/page.tsx`)

設定自動警報推播規則，整合 LINE 通知。

**三個標籤頁：**
- **使用說明**：Highlight 會員 LINE 綁定流程
- **警示規則**：創建、編輯、啟用/停用、刪除規則
- **推播記錄**：最近 30 筆警報觸發日誌

**規則設定欄位：**
- 城市選擇
- 指標選擇（aqi、pm25、weather_temp、rainfall、reservoir_storage、electricity_monthly、earthquake_count）
- 條件：高於(gt)、低於(lt)、高於等於(gte)、低於等於(lte)
- 門檻值
- 冷卻時間（1–24 小時）

**LINE User ID** 儲存於 localStorage。

---

### 8. 週報管理 (`app/reports/page.tsx`)

城市指標週報的管理與訂閱。

**統計卡片：** 已寄出報告數、訂閱人數、待寄出數量

**三個標籤頁：**
- **週報列表**：報告清單（狀態、操作：寄送/下載）
- **訂閱名單**：管理訂閱者（Email、類型、城市、日期、取消訂閱）
- **模板預覽**：週報模板示例

**報告狀態流程：** `draft` → `pending` → `sent`

---

## 共用組件說明

### Layout 組件

**`AppSidebar.tsx`**
- 左側固定導航欄（寬度 w-56，深灰 bg-slate-900）
- 6 個主導航項：Dashboard、城市列表、城市比較、指標列表、示警、週報
- 當前路由高亮（sky-500 背景）

**`TopNavbar.tsx`**
- 頂部欄（高度 h-14，白色背景）
- 動態頁面標題（依 pathname 推導）
- 搜索欄、通知圖標、用戶頭像

**`PageHeader.tsx`**
- 可傳入標題、副標題、右側操作區

### Dashboard 組件

**`MetricCard.tsx`**
- KPI 卡片，支持 4 種狀態：good / warning / danger / neutral
- 顯示圖標、數值、單位、趨勢百分比

**`AlertCard.tsx`**
- 5 級嚴重程度：low(藍)、medium(琥珀)、high(橙)、critical/danger(紅)

### 圖表組件（零依賴，自繪 SVG）

**`LineTrendChart.tsx`**
- 尺寸：600×220px
- 自動縮放 Y 軸、5 條網格線
- 填充區域 + 折線 + 懸停提示

**`BarRankingChart.tsx`**
- 支持橫向和縱向兩種模式
- Top 1 特殊顏色突出顯示

**`CompareLineChart.tsx`**
- 最多 6 條不同顏色折線
- 下方自動生成圖例
- 支援缺失數據斷線處理

---

## API 客戶端 (`lib/api/client.ts`)

**基礎 URL：**
```
process.env.NEXT_PUBLIC_API_URL ?? 'https://www.highlight.url.tw/cities-insight/api'
```

**主要端點：**

| 端點 | 說明 |
|------|------|
| `GET /cities` | 城市列表 |
| `GET /cities/{code}/summary` | 城市指標摘要 |
| `GET /indicators` | 指標列表 |
| `GET /indicators/{code}/series?city={city}&range={range}` | 指標時序數據 |
| `GET /compare?indicator={code}&cities={codes}&range={range}` | 多城市比較 |
| `GET /alerts` | 警報規則列表 |
| `POST /alerts` | 新增警報規則 |
| `PUT /alerts/{id}` | 更新警報規則 |
| `DELETE /alerts/{id}` | 刪除警報規則 |
| `GET /alerts/logs` | 警報觸發記錄 |
| `GET /reports` | 週報列表 |
| `GET /reports/subscriptions` | 訂閱者列表 |

---

## 建置與部署

**開發：**
```bash
npm run dev
```

**生產建置（靜態導出）：**
```bash
npm run build
```

**部署至 Cloudflare Pages：**
```bash
npm run deploy:cf
```

`next.config.ts` 設定 `output: 'export'`，產出純靜態檔案，適合 Cloudflare Pages 部署。

---

## 指標一覽

| 代碼 | 名稱 | 單位 | 類型 |
|------|------|------|------|
| `aqi` | 空氣品質指數 | — | 環境 |
| `pm25` | PM2.5 | μg/m³ | 環境 |
| `weather_temp` | 氣溫 | °C | 環境 |
| `rainfall` | 降雨量 | mm | 環境 |
| `reservoir_storage` | 水庫蓄水率 | % | 水資源 |
| `electricity_monthly` | 月用電量 | 億度 | 能源 |
| `electricity_load` | 即時電力負載 | GW | 能源（全國） |
| `reserve_margin` | 備轉容量率 | % | 能源（全國） |
| `earthquake_count` | 地震次數 | 次 | 環境（示警用） |

---

## 數據流向

```
用戶操作
  ↓
頁面元件（Server / Client Component）
  ↓
apiFetch（lib/api/client.ts）
  ↓
後端 API（highlight.url.tw/cities-insight/api）
  ↓
TypeScript 接口解析
  ↓
useState / useEffect 狀態管理
  ↓
SVG 圖表 + Tailwind UI 渲染
```
