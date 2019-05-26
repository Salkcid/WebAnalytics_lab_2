const csv = require('csv-parser');
const fs = require('fs');

(async () => {
  const data = [];

  await parseCsv(data);

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