#!/usr/bin/env node
/**
 * 工作日與工時計算器
 *
 * 用法：
 *   node calculate.js workdays <開始日期> <結束日期>
 *   node calculate.js overtime <csv檔案路徑>
 *   node calculate.js holidays <年份>
 *
 * 範例：
 *   node calculate.js workdays 2024-01-01 2024-01-31
 *   node calculate.js overtime ../demo-data/work-hours.csv
 *   node calculate.js holidays 2024
 */

const fs = require('fs');
const path = require('path');

// ===== 2024 台灣國定假日 =====
const HOLIDAYS_2024 = [
  '2024-01-01', // 元旦
  '2024-02-08', '2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12', '2024-02-13', '2024-02-14', // 春節
  '2024-02-28', // 和平紀念日
  '2024-04-04', '2024-04-05', // 兒童節、清明節
  '2024-06-10', // 端午節
  '2024-09-17', // 中秋節
  '2024-10-10', // 國慶日
];

const MAKEUP_DAYS_2024 = [
  '2024-02-17', // 補班
  '2024-09-14', // 補班
];

// ===== 工具函數 =====
function parseDate(dateStr) {
  return new Date(dateStr + 'T00:00:00');
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(dateStr) {
  return HOLIDAYS_2024.includes(dateStr);
}

function isMakeupDay(dateStr) {
  return MAKEUP_DAYS_2024.includes(dateStr);
}

// ===== 工作日計算 =====
function calculateWorkdays(startStr, endStr) {
  const start = parseDate(startStr);
  const end = parseDate(endStr);

  let totalDays = 0;
  let weekends = 0;
  let holidays = 0;
  let workdays = 0;

  const current = new Date(start);

  while (current <= end) {
    totalDays++;
    const dateStr = formatDate(current);
    const weekend = isWeekend(current);
    const holiday = isHoliday(dateStr);
    const makeup = isMakeupDay(dateStr);

    if (makeup) {
      // 補班日算工作日
      workdays++;
    } else if (weekend) {
      weekends++;
    } else if (holiday) {
      holidays++;
    } else {
      workdays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return { startStr, endStr, totalDays, weekends, holidays, workdays };
}

// ===== 加班計算 =====
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = isNaN(values[index]) ? values[index] : parseFloat(values[index]);
    });
    data.push(row);
  }

  return data;
}

function calculateOvertime(records) {
  const NORMAL_HOURS = 8;

  return records.map(record => {
    const date = record.date;
    const hours = record.hours;
    const hourlyRate = record.hourly_rate || 200;

    const isWeekendDay = isWeekend(parseDate(date));
    const isHolidayDay = isHoliday(date);

    let overtime = 0;
    let overtimePay = 0;
    let type = '平日';

    if (isHolidayDay) {
      type = '假日';
      overtime = hours;
      overtimePay = hours * hourlyRate * 2;
    } else if (isWeekendDay) {
      type = '週末';
      overtime = hours;
      if (hours <= 2) {
        overtimePay = hours * hourlyRate * 1.34;
      } else {
        overtimePay = 2 * hourlyRate * 1.34 + (hours - 2) * hourlyRate * 1.67;
      }
    } else if (hours > NORMAL_HOURS) {
      overtime = hours - NORMAL_HOURS;
      if (overtime <= 2) {
        overtimePay = overtime * hourlyRate * 1.34;
      } else {
        overtimePay = 2 * hourlyRate * 1.34 + (overtime - 2) * hourlyRate * 1.67;
      }
    }

    return {
      date,
      hours,
      type,
      overtime: overtime.toFixed(1),
      overtimePay: Math.round(overtimePay),
    };
  });
}

// ===== 輸出格式化 =====
function printWorkdaysReport(result) {
  console.log('\n# 工作日計算報告\n');
  console.log('┌──────────────────┬────────────┐');
  console.log('│ 項目             │ 數值       │');
  console.log('├──────────────────┼────────────┤');
  console.log(`│ 開始日期         │ ${result.startStr} │`);
  console.log(`│ 結束日期         │ ${result.endStr} │`);
  console.log(`│ 總天數           │ ${String(result.totalDays).padStart(6)} 天 │`);
  console.log(`│ 工作日           │ ${String(result.workdays).padStart(6)} 天 │`);
  console.log(`│ 週末             │ ${String(result.weekends).padStart(6)} 天 │`);
  console.log(`│ 國定假日         │ ${String(result.holidays).padStart(6)} 天 │`);
  console.log('└──────────────────┴────────────┘');
}

function printOvertimeReport(results) {
  console.log('\n# 加班時數報告\n');
  console.log('┌────────────┬────────┬────────┬──────────┬────────────┐');
  console.log('│ 日期       │ 工時   │ 類型   │ 加班時數 │ 加班費     │');
  console.log('├────────────┼────────┼────────┼──────────┼────────────┤');

  let totalOvertime = 0;
  let totalPay = 0;

  results.forEach(r => {
    console.log(`│ ${r.date} │ ${String(r.hours).padStart(4)}hr │ ${r.type.padEnd(4)} │ ${String(r.overtime).padStart(6)}hr │ ${String(r.overtimePay).padStart(8)}元 │`);
    totalOvertime += parseFloat(r.overtime);
    totalPay += r.overtimePay;
  });

  console.log('├────────────┼────────┼────────┼──────────┼────────────┤');
  console.log(`│ 合計       │        │        │ ${String(totalOvertime.toFixed(1)).padStart(6)}hr │ ${String(totalPay).padStart(8)}元 │`);
  console.log('└────────────┴────────┴────────┴──────────┴────────────┘');
}

function printHolidays(year) {
  console.log(`\n# ${year} 年台灣國定假日\n`);
  console.log('┌────────────┬──────────────────┐');
  console.log('│ 日期       │ 假日名稱         │');
  console.log('├────────────┼──────────────────┤');

  const holidayNames = {
    '2024-01-01': '元旦',
    '2024-02-08': '小年夜（彈性）',
    '2024-02-09': '除夕',
    '2024-02-10': '春節',
    '2024-02-11': '春節',
    '2024-02-12': '春節',
    '2024-02-13': '春節（補假）',
    '2024-02-14': '春節（補假）',
    '2024-02-28': '和平紀念日',
    '2024-04-04': '兒童節',
    '2024-04-05': '清明節',
    '2024-06-10': '端午節',
    '2024-09-17': '中秋節',
    '2024-10-10': '國慶日',
  };

  HOLIDAYS_2024.forEach(date => {
    const name = holidayNames[date] || '假日';
    console.log(`│ ${date} │ ${name.padEnd(14)} │`);
  });

  console.log('└────────────┴──────────────────┘');
  console.log(`\n共 ${HOLIDAYS_2024.length} 天國定假日`);
}

// ===== 主程式 =====
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('用法：');
    console.log('  node calculate.js workdays <開始日期> <結束日期>');
    console.log('  node calculate.js overtime <csv檔案路徑>');
    console.log('  node calculate.js holidays <年份>');
    process.exit(1);
  }

  const command = args[0];

  switch (command) {
    case 'workdays': {
      if (args.length < 3) {
        console.error('請提供開始日期和結束日期');
        process.exit(1);
      }
      const result = calculateWorkdays(args[1], args[2]);
      printWorkdaysReport(result);
      break;
    }

    case 'overtime': {
      if (args.length < 2) {
        console.error('請提供 CSV 檔案路徑');
        process.exit(1);
      }
      const csvPath = args[1];
      const content = fs.readFileSync(csvPath, 'utf-8');
      const records = parseCSV(content);
      const results = calculateOvertime(records);
      printOvertimeReport(results);
      break;
    }

    case 'holidays': {
      const year = args[1] || '2024';
      printHolidays(year);
      break;
    }

    default:
      console.error(`未知指令：${command}`);
      process.exit(1);
  }
}

main();
