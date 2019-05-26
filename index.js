const csv = require('csv-parser');
const fs = require('fs');

(async () => {
  const data = [];
  await parseCsv(data);

  const amountMax = Math.max.apply(Math, data.map((obj) => obj.amount ));
  normalizeAmount(data, amountMax);

  const dataGrouped = groupBy(data, e => e.category);

  sortByAmount(dataGrouped);

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