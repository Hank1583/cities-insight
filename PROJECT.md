# Cities Insight — 專案功能說明

> 台灣各縣市環境、能源、水資源與經濟趨勢數據可視化平台

---

## 技術堆棧

| 項目 | 版本 / 說明 |
|------|------------|
| Next.js | 16.2.3（App Router + Static Export） |
| React | 19.2.3 |
| TypeScript | 5 |
| Tailwind CSS | 4 + PostCSS |
| Lucide React | 1.8.0（圖標庫） |
| 部署平台 | Cloudflare Pages（wrangler + @opennextjs/cloudflare） |
| 圖表 | 自繪 SVG（零外部圖表依賴） |
| 分析 | Google Analytics GA4（ID: G-JSN1T7F9KG） |

---

## 目錄結構

```
cities-insight/
├── app/                               # Next.js App Router
│   ├── layout.tsx                     # 全局佈局（側邊欄 + 頂部欄）+ GA4 初始化
│   ├── globals.css                    # 全局樣式（Tailwind + CSS 變量）
│   ├── page.tsx                       # Dashboard 首頁（Client Component）
│   ├── cities/
│   │   ├── page.tsx                   # 城市列表頁面（Client Component）
│   │   └── [cityCode]/
│   │       ├── page.tsx               # 城市詳情靜態預生成（Server Component）
│   │       └── CityClient.tsx         # 城市詳情互動邏輯（Client Component）
│   ├── indicators/
│   │   ├── page.tsx                   # 指標列表頁面（Client Component）
│   │   └── [indicatorCode]/
│   │       ├── page.tsx               # 指標詳情靜態預生成（Server Component）
│   │       └── IndicatorClient.tsx    # 指標詳情互動邏輯（Client Component）
│   ├── compare/
│   │   └── page.tsx                   # 城市比較頁面（Client Component）
│   ├── alerts/
│   │   └── page.tsx                   # LINE 示警設定頁面（Client Component）
│   └── reports/
│       └── page.tsx                   # 週報管理頁面（Client Component）
│
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx             # 左側導航欄（Client Component）
│   │   ├── TopNavbar.tsx              # 頂部導航欄（Client Component）
│   │   └── PageHeader.tsx             # 可重用頁面標題區塊
│   ├── dashboard/
│   │   ├── MetricCard.tsx             # KPI 指標卡片
│   │   └── AlertCard.tsx              # 警報卡片
│   ├── city/
│   │   ├── CityMetricSummary.tsx      # 城市 8 個指標摘要格
│   │   └── CityIndicatorTabs.tsx      # 城市指標三標籤頁（環境/水資源/能源）
│   └── charts/
│       ├── LineTrendChart.tsx         # 趨勢折線圖（自繪 SVG）
│       ├── BarRankingChart.tsx        # 排行柱狀圖（自繪 SVG）
│       ├── CompareLineChart.tsx       # 多城市比較折線圖（自繪 SVG）
│       ├── IndicatorCharts.tsx        # 指標圖表包裝組件
│       └── index.ts                   # 圖表統一導出
│
├── lib/
│   ├── api/
│   │   └── client.ts                  # API 請求客戶端 + 所有 TypeScript API 接口
│   └── mock/                          # 模擬資料（開發備用）
│       ├── cities.ts                  # 22 縣市資料 + getCityByCode()
│       ├── indicators.ts              # 15 個指標資料 + getIndicatorByCode()
│       ├── series.ts                  # 時序數據生成器（generateSeries / getTimeSeries）
│       └── summaries.ts               # 城市摘要生成器（getCitySummary）
│
├── types/                             # TypeScript 類型定義
│   ├── city.ts                        # City、CitySummary
│   ├── indicator.ts                   # Indicator、TimeSeriesPoint、IndicatorRanking
│   ├── alert.ts                       # Alert
│   └── report.ts                      # Report
│
├── public/
│   ├── logo.svg                       # 應用 Logo
│   └── _routes.json                   # Cloudflare Pages Routes 設定
│
├── next.config.ts                     # Next.js 設定（output: 'export'）
├── open-next.config.ts                # Cloudflare 適配器設定
├── tsconfig.json
└── package.json
```

---

## 頁面功能說明

### 1. 全局佈局 (`app/layout.tsx`)

所有頁面共用的根佈局。

- **結構**：左側 `<AppSidebar />`（固定）+ 右側主內容區（含 `<TopNavbar />`）
- **SEO**：全局 metadata（title、description、OG、Twitter Card、Google 驗證）
- **分析**：Google Analytics 4（`G-JSN1T7F9KG`）腳本初始化

---

### 2. Dashboard 首頁 (`app/page.tsx`)

全台城市數據總覽儀表板。

**區塊一：Hero Banner**
- 漸層背景橫幅，顯示平台名稱與副標題
- 兩個 CTA 按鈕（探索城市 / 查看指標）

**區塊二：KPI 指標卡片**（5 張）

| 指標 | 來源 | 狀態色 |
|------|------|--------|
| 全台平均 AQI | 22 城市平均 | 綠/黃/紅 |
| 即時用電 (GW) | 22 城市加總 | 固定 sky |
| 平均降雨量 (mm) | 22 城市平均 | 固定 violet |
| 水庫平均蓄水率 (%) | 22 城市平均 | 藍/黃/紅 |
| 平均備轉容量率 (%) | 22 城市平均 | 綠/黃/紅 |

**區塊三：排行榜**
- AQI Top 5 最污染城市（進度條）
- 水庫蓄水率最低 Top 5（進度條）

**區塊四：最近異常警報**
- 最新 4 筆 `AlertCard`（含嚴重程度、城市、訊息）

**API 呼叫：**
```
GET /cities
GET /cities/{code}/summary   ← 22 個城市並發請求
GET /alerts/logs?limit=4
```

---

### 3. 城市列表 (`app/cities/page.tsx`)

瀏覽台灣 22 個縣市的即時數據。

**控制列：**
- 搜索：中文名稱 / 英文名稱 / 城市代碼
- 排序：名稱、AQI、用電、降雨（點擊欄標題亦可排序）
- 視圖切換：卡片模式 / 表格模式

**卡片模式（預設）：**
- 響應式格柵（1–4 欄）
- 顯示：城市名稱、代碼、人口、面積、AQI（紅/琥珀/綠色標）、用電(MW)、降雨(mm)
- 點擊連結至城市詳情

**表格模式：**
- 欄位：城市、英文名、人口、面積、AQI、用電、降雨、詳情連結

**API：**
```
GET /cities
GET /cities/{code}/summary   ← 逐一取得指標摘要
```

---

### 4. 城市詳情 (`app/cities/[cityCode]/`)

單一城市的深度數據分析。

**靜態預生成（SSG）：**
- `generateStaticParams()` 預建 22 個城市頁面
- 動態 metadata（title 含城市中文名）
- Server Component 包裝 → `<CityClient cityCode={code} />`

**頁面內容（CityClient.tsx）：**

*頁首區塊*
- 城市中英文名稱、代碼徽章
- 人口、面積、座標、最後更新時間
- 返回城市列表按鈕

*8 個指標摘要（CityMetricSummary）：*

| 指標 | 顏色 | 單位 |
|------|------|------|
| AQI | 黃色 | — |
| PM2.5 | 橙色 | μg/m³ |
| 氣溫 | 紅色 | °C |
| 降雨量 | 紫色 | mm |
| 水庫蓄水率 | 藍色 | % |
| 月用電量 | 橙色 | 億度 |
| 尖峰用電 | 黃色 | MW |
| 備轉容量率 | 綠色 | % |

*三個指標標籤頁（CityIndicatorTabs）：*

| 標籤 | 圖表內容 | 時間範圍 |
|------|----------|---------|
| 環境 | AQI 趨勢、氣溫趨勢、降雨趨勢 | 近 30 天（日度） |
| 水資源 | 水庫蓄水率趨勢 + 相關水庫備註 | 近 30 天（日度） |
| 能源 | 月用電量、尖峰用電趨勢、備轉容量率趨勢 | 月度 12 月 / 日度 30 天 |

> 水庫備註：各城市對應主要水庫（如台北市 → 翡翠水庫、台中市 → 德基水庫）

**API 呼叫（共 8 支）：**
```
GET /cities/{code}/summary
GET /cities/{code}/indicators/aqi?range=30d&granularity=day
GET /cities/{code}/indicators/weather_temp?range=30d&granularity=day
GET /cities/{code}/indicators/rainfall?range=30d&granularity=day
GET /cities/{code}/indicators/reservoir_storage?range=30d&granularity=day
GET /cities/{code}/indicators/electricity_load?range=30d&granularity=day
GET /cities/{code}/indicators/reserve_margin?range=30d&granularity=day
GET /cities/{code}/indicators/electricity_monthly?range=365d&granularity=month
```

---

### 5. 指標列表 (`app/indicators/page.tsx`)

瀏覽所有可追蹤指標。

**控制列：**
- 類別篩選：全部 / 環境(emerald) / 水資源(sky) / 能源(yellow) / 經濟(violet)
- 搜索：中文名稱 / 指標代碼

**卡片顯示（響應式 1–3 欄）：**
- 指標中文名、分類徽章、描述
- 代碼、單位、更新頻率、數據來源
- 連結至指標詳情頁

**API：** `GET /indicators`

---

### 6. 指標詳情 (`app/indicators/[indicatorCode]/`)

單一指標的全台趨勢與各城市排行。

**靜態預生成（SSG）：**
- 預建 8 個核心指標頁面：`aqi`、`pm25`、`weather_temp`、`rainfall`、`reservoir_storage`、`electricity_monthly`、`electricity_load`、`reserve_margin`
- 動態 metadata（title 含指標中文名）

**頁面內容（IndicatorClient.tsx）：**

*頁首*
- 指標中英文名稱、代碼、描述
- 類別、單位、更新頻率、數據來源
- 全國性指標（`electricity_load`、`reserve_margin`）顯示特別提示

*圖表區塊（IndicatorCharts）：*
- 全國 / 台北市代表趨勢折線圖
- 各城市 Top 10 排行柱狀圖（全國性指標不顯示）

**特殊邏輯：**

| 指標代碼 | 數據類型 | 排行圖 |
|----------|---------|--------|
| `electricity_load`、`reserve_margin` | 全國統計 | 不顯示 |
| `electricity_monthly` | 月度（近 12 個月）| 顯示 |
| 其他所有指標 | 日度（近 30 天）| 顯示 |

**API 呼叫：**
```
GET /indicators/{code}
GET /cities/taipei/indicators/{code}?range=30d&granularity=day
GET /indicators/{code}/ranking
```

---

### 7. 城市比較 (`app/compare/page.tsx`)

同一指標下，多城市數據橫向對比。

**控制區：**
- 指標選擇（6 個可比較指標）：

| 代碼 | 名稱 | 備註 |
|------|------|------|
| `aqi` | 空氣品質指數 | |
| `pm25` | PM2.5 | |
| `weather_temp` | 氣溫 | |
| `rainfall` | 降雨量 | |
| `reservoir_storage` | 水庫蓄水率 | |
| `electricity_monthly` | 月用電量 | 固定顯示 365 天 |

> `electricity_load`、`reserve_margin` 為全國性指標，排除於比較功能

- 城市多選（最多 6 個，預設：台北、台中、高雄、台南、桃園）
- 時間範圍：7 天、30 天、90 天（electricity_monthly 固定 365 天，選項隱藏）

**圖表輸出：**
- 多線折線比較圖（含顏色圖例）
- 最新數值排行表（依數值降序）

**API：**
```
GET /compare?indicator={code}&cities={csv}&range={days}d&granularity={day|month}
```

---

### 8. LINE 示警設定 (`app/alerts/page.tsx`)

設定自動警報推播規則，整合 LINE 推播通知。

**LINE 身份綁定：**
- 主要：OAuth 登入（LIFF 連結：`https://liff.line.me/1654243071-qaFTJv1S`）
- 備用：手動輸入 LINE User ID
- 自動登入：偵測 URL 參數 `?uid=Uxxxx`，自動填入並儲存
- User ID 儲存於 `localStorage`

**三個標籤頁：**

*使用說明*
- LINE 綁定流程引導，連結至 Highlight 會員綁定頁

*警示規則*
- 新增規則表單：

| 欄位 | 說明 |
|------|------|
| 城市 | 下拉選擇縣市 |
| 指標 | aqi、pm25、weather_temp、rainfall、reservoir_storage、electricity_monthly、earthquake_count |
| 條件 | 高於(gt)、低於(lt)、高於等於(gte)、低於等於(lte) |
| 門檻值 | 數字輸入 |
| 冷卻時間 | 1–24 小時（防止重複推播） |

- 規則列表：城市、指標、條件式、最後觸發時間
- 操作：啟用/停用切換、刪除

*推播記錄*
- 最近 30 筆觸發日誌：城市、指標、觸發值、門檻值、時間戳

**API 呼叫：**
```
GET  /alerts?line_user_id={id}
GET  /alerts/logs?line_user_id={id}&limit=30
POST /alerts                              ← 建立規則
PUT  /alerts/{id}/toggle?line_user_id={id} ← 啟用/停用
DEL  /alerts/{id}?line_user_id={id}      ← 刪除規則
```

---

### 9. 週報管理 (`app/reports/page.tsx`)

城市指標週報的管理與訂閱維護。

**統計卡片：** 已寄出數、訂閱人數、待寄出數

**三個標籤頁：**

*週報列表*
- 報告資訊：標題、期間、城市、狀態徽章
- 狀態流程：`draft`（草稿）→ `pending`（待寄送）→ `sent`（已寄送）
- 操作：寄送（僅 draft）、下載

*訂閱名單*
- 欄位：Email、報告類型、城市、訂閱日期、取消訂閱

*模板預覽*
- 週報 Email 模板排版示例

**API：**
```
GET /reports
GET /reports/subscriptions
```

---

## 共用組件說明

### Layout 組件

**`AppSidebar.tsx`**（Client Component）
- 左側固定導航欄（`w-56`，`bg-slate-900` 深灰）
- 5 個主導航項：Dashboard、城市列表、城市比較、指標列表、示警
- 當前路由高亮（`sky-500` 背景）
- 底部品牌 Logo 與版本資訊

**`TopNavbar.tsx`**（Client Component）
- 頂部欄（`h-14`，白色背景）
- 依 `pathname` 動態對應中文頁面標題
- 通知圖示（紅色提示點）+ 用戶頭像（縮寫 "CI"）

**`PageHeader.tsx`**
- Props：`title`（必填）、`subtitle?`、`action?`（右側操作元件）

---

### Dashboard 組件

**`MetricCard.tsx`**

| Prop | 型別 | 說明 |
|------|------|------|
| `label` | string | 卡片標題 |
| `value` | string/number | 顯示數值 |
| `unit` | string? | 單位文字 |
| `icon` | LucideIcon | 圖示 |
| `color` | sky/emerald/amber/red/violet | 圖示框顏色 |
| `trend` | number? | 趨勢百分比（正/負箭頭） |
| `status` | good/warning/danger | 狀態徽章 |

**`AlertCard.tsx`**

| severity | 顏色 | 圖示 |
|----------|------|------|
| low | 藍色 | Info |
| medium | 琥珀色 | AlertTriangle |
| high | 橙色 | AlertTriangle |
| critical / danger | 紅色 | XCircle |

---

### 城市相關組件

**`CityMetricSummary.tsx`**
- 橫向捲動的 8 個指標徽章
- 每格：彩色圖示 + 數值 + 單位 + 標籤

**`CityIndicatorTabs.tsx`**
- 三標籤切換（`useState` 控制）
- 每個標籤內嵌 2–3 個 `LineTrendChart`
- 水資源標籤含水庫來源備註

---

### 圖表組件（零依賴，純 SVG）

**`LineTrendChart.tsx`**

| 屬性 | 說明 |
|------|------|
| 畫布尺寸 | 600 × 220 px |
| Y 軸 | 自動縮放，5 條網格線 + 標籤 |
| X 軸 | 6 個時間間隔標籤 |
| 視覺 | 漸層填充區域（8% 透明）+ 折線 |
| 互動 | 懸停顯示 Tooltip（日期 + 數值） |
| 數字格式 | ≥ 1000 自動顯示 k 後綴 |

Props：`data[]`、`label?`、`color?`、`unit?`

**`BarRankingChart.tsx`**

| 模式 | 說明 |
|------|------|
| 縱向（預設）| 依數值降序排列的直條圖 |
| 橫向（`horizontal`）| 標籤 + 橫條 + 數值，自動調整高度 |

- Top 1 使用實色，其餘 50% 透明度
- Props：`data[]`、`color?`、`unit?`、`horizontal?`

**`CompareLineChart.tsx`**
- 最多 6 條不同顏色折線（自動循環色盤）
- 跨所有 series 自動縮放 Y 軸
- 缺失資料點自動斷線
- 下方自動產生圖例（1–4 欄響應式）

Props：`data: Record<cityCode, TimeSeriesPoint[]>`、`cityNames: Record`、`unit?`

**`IndicatorCharts.tsx`**（包裝元件）
- 依指標型別決定顯示 30 天或 12 個月趨勢圖
- 自動判斷是否顯示城市排行柱狀圖

---

## API 客戶端 (`lib/api/client.ts`)

**基礎 URL：**
```
process.env.NEXT_PUBLIC_API_URL
  ?? 'https://www.highlight.url.tw/cities-insight/api'
```

**通用請求函式：** `apiFetch<T>(path, options?)`
- 預設禁用快取：`cache: 'no-store'`
- 自動 JSON 解析，非 200 回應拋出錯誤

**完整 API 端點：**

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/cities` | 城市列表 |
| GET | `/cities/{code}/summary` | 城市指標摘要 |
| GET | `/cities/{code}/indicators/{indicatorCode}?range=30d&granularity=day` | 城市指標時序 |
| GET | `/indicators` | 指標列表 |
| GET | `/indicators/{code}` | 指標元數據 |
| GET | `/indicators/{code}/ranking` | 各城市指標排行 |
| GET | `/compare?indicator={code}&cities={csv}&range={days}d&granularity={grain}` | 多城市比較 |
| GET | `/alerts?line_user_id={id}` | 警報規則列表 |
| POST | `/alerts` | 新增警報規則 |
| PUT | `/alerts/{id}/toggle?line_user_id={id}` | 切換規則啟用狀態 |
| DELETE | `/alerts/{id}?line_user_id={id}` | 刪除警報規則 |
| GET | `/alerts/logs?line_user_id={id}&limit=30` | 警報觸發記錄 |
| GET | `/reports` | 週報列表 |
| GET | `/reports/subscriptions` | 訂閱者列表 |

**主要 TypeScript 接口：**

```typescript
ApiCity            // id, code, name_zh, name_en, population, area, lat, lng
ApiIndicator       // id, code, name_zh, name_en, description, unit, freq, category_*
ApiMetricValue     // value, value_text, updated_at
ApiSummary         // city, updatedAt, metrics: Record<string, ApiMetricValue>
ApiTimeSeries      // time, value
ApiCompare         // indicator, range, granularity, cities, series
ApiAlertLog        // id, status, severity, title, message, trigger_value, threshold_value, ...
ApiReport          // id, report_type, title, period_start, period_end, status, city_code, ...
ApiSubscription    // id, email, report_type, city_code, city_name_zh, created_at
```

---

## TypeScript 類型定義 (`types/`)

| 檔案 | 主要類型 |
|------|---------|
| `city.ts` | `City`（code、nameZh、nameEn、population、area、lat、lng）<br>`CitySummary`（7 個指標：aqi、pm25、temperature、rainfall、reservoir_storage、electricity_load、reserve_margin） |
| `indicator.ts` | `Indicator`（code、nameZh、category: environment/water/energy/economy、unit、freq、sourceName）<br>`TimeSeriesPoint`（time、value）<br>`IndicatorRanking` |
| `alert.ts` | `Alert`（id、cityCode、indicatorCode、condition、threshold、severity: low/medium/high/critical、status: active/resolved） |
| `report.ts` | `Report`（id、title、period、status: sent/pending/draft、recipients） |

---

## 模擬資料 (`lib/mock/`)

開發環境或 API 不可用時的本地數據（共 4 個檔案）：

| 檔案 | 內容 |
|------|------|
| `cities.ts` | `CITIES[]`（22 縣市）、`getCityByCode()` |
| `indicators.ts` | `INDICATORS[]`（15 個指標）、`getIndicatorByCode()` |
| `summaries.ts` | `getCitySummary(cityCode)`（城市指標快照，含城市偏移模擬）、`ALL_SUMMARIES` |
| `series.ts` | `generateSeries()`（生成 30 天數據）、`getTimeSeries()`、`getCompareSeriesForCities()` |

---

## 指標一覽

| 代碼 | 中文名稱 | 單位 | 類別 | 備註 |
|------|---------|------|------|------|
| `aqi` | 空氣品質指數 | — | 環境 | |
| `pm25` | PM2.5 | μg/m³ | 環境 | |
| `weather_temp` | 氣溫 | °C | 環境 | |
| `rainfall` | 降雨量 | mm | 環境 | |
| `reservoir_storage` | 水庫蓄水率 | % | 水資源 | |
| `electricity_monthly` | 月用電量 | 億度 | 能源 | 月度資料 |
| `electricity_load` | 即時電力負載 | GW | 能源 | 全國性，無城市排行 |
| `reserve_margin` | 備轉容量率 | % | 能源 | 全國性，無城市排行 |
| `earthquake_count` | 地震次數 | 次 | 環境 | 僅用於示警規則 |

---

## 建置與部署

**開發：**
```bash
npm run dev
```

**靜態建置：**
```bash
npm run build
```

**Cloudflare Pages 建置：**
```bash
npm run build:cf
```

**部署至 Cloudflare Pages：**
```bash
npm run deploy:cf
```

> `next.config.ts` 設定 `output: 'export'`，產出純靜態 HTML/CSS/JS，無需 Node.js 伺服器，直接由 Cloudflare Pages 托管。

---

## SEO 與 Metadata

| 頁面 | Metadata 內容 |
|------|--------------|
| 全局 (layout.tsx) | title、description、OG tags、Twitter Card、Google 驗證碼 |
| 城市詳情 | title: `{城市名} 城市數據 — Cities Insight`，含城市描述 |
| 指標詳情 | title: `{指標名} 指標分析 — Cities Insight`，含指標描述 |

---

## 數據流向

```
用戶操作（點擊 / 搜索 / 切換）
  ↓
Client Component（useState / useEffect）
  ↓
apiFetch()（lib/api/client.ts）
  ↓
後端 REST API（highlight.url.tw/cities-insight/api）
  ↓
JSON 回應 → TypeScript 接口解析
  ↓
setState 更新狀態
  ↓
SVG 圖表（LineTrendChart / BarRankingChart / CompareLineChart）
  + Tailwind CSS UI 元件重新渲染
```
