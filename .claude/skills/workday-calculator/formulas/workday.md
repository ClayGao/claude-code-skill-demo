# 工作日計算公式

## 基本定義

**工作日** = 總天數 - 週末 - 國定假日

## 計算步驟

```
1. 計算開始日期到結束日期的總天數
2. 計算這段期間內的週六、週日數量
3. 計算這段期間內的國定假日數量（排除已落在週末的）
4. 工作日 = 總天數 - 週末數 - 國定假日數
```

## 公式

```javascript
function calculateWorkdays(startDate, endDate, holidays) {
  let workdays = 0;
  let current = new Date(startDate);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];

    // 不是週末且不是假日
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
      workdays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return workdays;
}
```

## 範例

| 期間 | 總天數 | 週末 | 假日 | 工作日 |
|------|--------|------|------|--------|
| 2024-01-01 ~ 2024-01-31 | 31 | 8 | 1 | 22 |
| 2024-02-01 ~ 2024-02-29 | 29 | 8 | 4 | 17 |

## 注意事項

- 週末定義：週六 (6) 和週日 (0)
- 假日如果落在週末，不重複扣除
- 補班日視為工作日
