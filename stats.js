function quantile(arr, q) {
  const sorted = arr.sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sorted[base + 1] !== undefined) {
    return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
  } else {
    return Math.floor(sorted[base]);
  }
}

function prepareData(result) {
  return result.data.map((item) => {
    item.date = item.timestamp.split('T')[0];

    return item;
  });
}

// добавить метрику за выбранный день
function addMetricByDate(data, page, name, date) {
  let sampleData = data
    .filter((item) => item.page == page && item.name == name && item.date == date)
    .map((item) => item.value);

  let result = {};

  result.hits = sampleData.length;
  result.p25 = quantile(sampleData, 0.25);
  result.p50 = quantile(sampleData, 0.5);
  result.p75 = quantile(sampleData, 0.75);
  result.p95 = quantile(sampleData, 0.95);

  return result;
}
// рассчитывает все метрики за день
function calcMetricsByDate(data, page, date) {
  console.log(`All metrics for ${date}:`);

  let table = {};
  table.connect = addMetricByDate(data, page, 'connect', date);
  table.ttfb = addMetricByDate(data, page, 'ttfb', date);
  table.cities = addMetricByDate(data, page, 'getCitiesData', date);
  table.weather = addMetricByDate(data, page, 'getWeatherData', date);
  table.render = addMetricByDate(data, page, 'renderMainBlock', date);
  table.icon = addMetricByDate(data, page, 'loadLargestIcon', date);

  console.table(table);
}

fetch('https://shri.yandex/hw/stat/data?counterId=AE7E99E2-CE57-4CDF-B138-38C847F82417')
  .then((res) => res.json())
  .then((result) => {
    let data = prepareData(result);

    calcMetricsByDate(data, 'weather widget', '2021-10-31');

    // добавить свои сценарии, реализовать функции выше
  });
