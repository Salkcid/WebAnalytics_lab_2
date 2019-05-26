const csv = require('csv-parser');
const fs = require('fs');

(async () => {
  const data = [];
  await parseCsv(data);

  const amountMax = Math.max.apply(Math, data.map((obj) => obj.amount ));
  normalizeAmount(data, amountMax);

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
