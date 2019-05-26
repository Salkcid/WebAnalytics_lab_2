const csv = require('csv-parser');
const fs = require('fs');

(async () => {
  const data = [];
  await parseCsv(data);

  const amountMax = Math.max.apply(Math, data.map((obj) => obj.amount ));
  normalizeAmount(data, amountMax);

  const dataGrouped = groupBy(data, e => e.category);

  sortByAmount(dataGrouped);

  const anomalies = detectAnomalies(dataGrouped, 0.99);

  const anomaliesGrouped = groupBy(anomalies, e => e.category);

  fs.writeFileSync('./resultsGrouped', JSON.stringify(Array.from(anomaliesGrouped.entries()), null, 2));
  fs.writeFileSync('./results', JSON.stringify(anomalies, null, 2));
})();

function parseCsv(results) {
  return new Promise((resolve, reject) => {
    fs.createReadStream('analytics.csv')
      .pipe(csv(['time', 'date', 'category', 'amount']))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      });
  });
}
function normalizeAmount(results, amountMax) {
  for (let i = 0; i < results.length; i++) {
    results[i].amount /= amountMax;
  }
}
function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
       const key = keyGetter(item);
       const collection = map.get(key);
       if (!collection) {
           map.set(key, [item]);
       } else {
           collection.push(item);
       }
  });
  return map;
}
function sortByAmount(dataGrouped) {
  for (const key of dataGrouped.keys()) {
    const arr = dataGrouped.get(key);
    arr.sort((a, b) => a.amount - b.amount);
  }
}
function valueBiggerThan(data, currentKey, value) {
  const res = [];

  for (const key of data.keys()) {
    if (key === currentKey) continue;

    const arr = data.get(key);

    const i = arr.findIndex(e => e.amount > value);

    if (i === -1) {
      res.push({
        category: key,
        perc: 1,
      });

      continue;
    }

    res.push({
      category: key,
      perc: i / arr.length,
    });
  }

  return res;
}
function detectAnomalies(data, threshold) {
  const anomalies = [];

  for (const [key, value] of data.entries()) {
    for (const entry of value) {
      const comparison = valueBiggerThan(data, key, entry.amount);

      if (comparison[0].perc >= threshold && comparison[1].perc >= threshold) {
        anomalies.push({
          category: entry.category,
          date: convertTime(entry.time, entry.date),
          amount: entry.amount,
        })
      }
    }
  }

  return anomalies;
}
function convertTime(hoursShift, startDate) {
  const val = startDate.slice(0, 10).split('.')
  const start = new Date(`${val[2]}-${val[1]}-${val[0]}`);

  start.setHours(start.getHours() + +hoursShift);

  return start.toGMTString();
}