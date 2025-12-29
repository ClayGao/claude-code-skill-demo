# 加班時數計算公式

## 基本定義

**加班時數** = 實際工作時數 - 正常工作時數 (8小時)

## 加班類型

| 類型 | 定義 | 加班費倍率 |
|------|------|------------|
| 平日加班 | 超過 8 小時 | 前 2 小時 1.34 倍，之後 1.67 倍 |
| 週末加班 | 週六或週日工作 | 前 2 小時 1.34 倍，之後 1.67 倍 |
| 假日加班 | 國定假日工作 | 全日 2 倍 |

## 計算公式

```javascript
function calculateOvertime(records) {
  return records.map(record => {
    const normalHours = 8;
    const workedHours = record.hours;

    if (workedHours <= normalHours) {
      return { ...record, overtime: 0, overtimePay: 0 };
    }

    const overtime = workedHours - normalHours;
    let overtimePay = 0;

    if (record.isHoliday) {
      // 假日加班：全日 2 倍
      overtimePay = overtime * record.hourlyRate * 2;
    } else {
      // 平日/週末加班
      if (overtime <= 2) {
        overtimePay = overtime * record.hourlyRate * 1.34;
      } else {
        overtimePay = 2 * record.hourlyRate * 1.34 +
                      (overtime - 2) * record.hourlyRate * 1.67;
      }
    }

    return { ...record, overtime, overtimePay };
  });
}
```

## 範例

| 日期 | 工作時數 | 加班時數 | 類型 | 加班費（時薪200） |
|------|----------|----------|------|-------------------|
| 2024-01-15 | 10 | 2 | 平日 | 536 元 |
| 2024-01-20 | 8 | 8 | 週六 | 2,936 元 |
| 2024-02-10 | 8 | 8 | 假日 | 3,200 元 |

## 注意事項

- 台灣勞基法規定
- 每月加班上限 46 小時
- 經勞資協議可延長至 54 小時
