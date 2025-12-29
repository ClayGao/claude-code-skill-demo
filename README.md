# Workday Calculator - Claude Skill Demo

這個範例展示 Claude Skill 的核心能力：**漸進式載入** 與 **Script 整合**。

---

## 目錄結構

```
12-29-demo-skill/
├── .claude/skills/workday-calculator/
│   ├── SKILL.md              ← 主要入口（52 行）
│   ├── formulas/             ← 漸進式載入的公式
│   │   ├── workday.md        ← 工作日計算公式
│   │   ├── overtime.md       ← 加班費計算公式
│   │   └── holidays.md       ← 2024 台灣國定假日
│   └── scripts/
│       └── calculate.js      ← 精密計算腳本
│
└── demo-data/
    └── work-hours.csv        ← 25 筆工時記錄
```

---

## 展示的 Skill 能力

### 1. 自動觸發（Model-Invoked）

當你對 Claude 說：

```
幫我計算 demo-data/work-hours.csv 的加班費
```

Claude 會自動識別關鍵字「加班」並觸發 `workday-calculator` Skill，不需要手動打指令。

**觸發關鍵字**（定義在 SKILL.md 的 description）：
- 工作日、上班天數
- 加班時數、計算加班費
- 假日、計算天數

### 2. 漸進式載入（Progressive Disclosure）

| 階段 | 載入內容 | Token 消耗 |
|------|----------|-----------|
| 對話開始 | 只有 name + description | 極少 |
| 觸發 Skill | 載入 SKILL.md（52 行） | 少 |
| 需要公式時 | 才載入 formulas/*.md | 按需 |

**對比 Agent**：Agent 版本需要一次載入所有內容（108 行），無法漸進式載入。

### 3. Script 整合

Skill 可以呼叫 `scripts/calculate.js` 進行精密計算：

```bash
# 計算工作日
node scripts/calculate.js workdays 2024-01-01 2024-01-31

# 計算加班費（讀取 CSV）
node scripts/calculate.js overtime demo-data/work-hours.csv

# 查詢假日
node scripts/calculate.js holidays 2024
```

**為什麼用 Script？**
- 日期計算需要精確，不能讓 LLM 自己算
- 加班費倍率（1.34x, 1.67x, 2x）需要精密計算
- CSV 解析需要程式處理

---

## Demo 流程

### Step 1: 進入專案目錄

```bash
cd /path/to/12-29-demo-2/12-29-demo-skill
```

### Step 2: 啟動 Claude Code

```bash
claude
```

### Step 3: 測試 Skill 觸發

```
你：幫我計算 demo-data/work-hours.csv 的加班費
```

### Step 4: 觀察 Claude 行為

1. Claude 自動識別「加班費」關鍵字
2. 載入 SKILL.md 了解計算流程
3. 需要時才載入 `formulas/overtime.md` 查看公式
4. 呼叫 `scripts/calculate.js` 進行計算
5. 輸出格式化報告

### 預期輸出

```
# 加班時數報告

┌────────────┬────────┬────────┬──────────┬────────────┐
│ 日期       │ 工時   │ 類型   │ 加班時數 │ 加班費     │
├────────────┼────────┼────────┼──────────┼────────────┤
│ 2024-01-03 │   10hr │ 平日   │    2.0hr │      536元 │
│ 2024-01-06 │    6hr │ 週末   │    6.0hr │     1876元 │
│ 2024-02-10 │    8hr │ 假日   │    8.0hr │     3200元 │
│ ...        │        │        │          │            │
├────────────┼────────┼────────┼──────────┼────────────┤
│ 合計       │        │        │   35.0hr │    12000元 │
└────────────┴────────┴────────┴──────────┴────────────┘
```

---

## Skill vs Agent 對比

同樣的功能也有 Agent 版本在 `../12-29-demo-agent/`，可以對比：

| 面向 | Skill | Agent |
|------|-------|-------|
| 啟動方式 | 自動觸發 | 需要 Task tool |
| Context | 共享主對話 | 獨立 context |
| 載入方式 | 漸進式（按需載入） | 一次全載 |
| 檔案結構 | 多檔案模組化 | 單一 markdown |
| Token 消耗 | 較少 | 較多 |
| 適用場景 | 重複性任務、模組共用 | 獨立任務、需要隔離 |

---

## 加班費計算規則（台灣勞基法）

| 類型 | 定義 | 加班費倍率 |
|------|------|-----------|
| 平日加班 | 超過 8 小時 | 前 2 小時 1.34 倍，之後 1.67 倍 |
| 週末加班 | 週六或週日工作 | 前 2 小時 1.34 倍，之後 1.67 倍 |
| 假日加班 | 國定假日工作 | 全日 2 倍 |

---

## 相關資源

- [Anthropic Skill 最佳實踐](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [官方 Skill Creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
- [Don't Build Agents, Build Skills Instead (YouTube)](https://www.youtube.com/watch?v=CEvIs9y1uog)
# claude-code-skill-demo
