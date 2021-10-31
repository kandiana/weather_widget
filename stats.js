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

const PARAMETERS = {
  connect: 'connect',
  ttfb: 'ttfb',
  cities: 'getCitiesData',
  weather: 'getWeatherData',
  render: 'renderMainBlock',
  icon: 'loadLargestIcon',
};

const BROWSERS = {
  ie: 'Internet Explorer',
  edge: 'Edge',
  firefox: 'Firefox',
  opera: 'Opera',
  yandex: 'Yandex Browser',
  google: 'Google Chrome',
  safari: 'Safari',
  other: 'other',
};

const PLATFORMS = { touch: 'touch', desktop: 'desktop' };

const CONNECTION_TYPES = {
  '2G': '2g',
  '3G': '3g',
  '4G': '4g',
  '5g': '5g',
  other: 'unsupported option',
};

// показать значение метрики за несколько дней
function getMetricByPeriod(data, page, name, dateStart, dateEnd) {
  const sampleData = data
    .filter(
      (item) =>
        item.page == page &&
        item.name == PARAMETERS[name] &&
        item.date >= dateStart &&
        item.date <= dateEnd
    )
    .map((item) => item.value);

  const result = {};

  result.hits = sampleData.length;
  result.p25 = quantile(sampleData, 0.25);
  result.p50 = quantile(sampleData, 0.5);
  result.p75 = quantile(sampleData, 0.75);
  result.p95 = quantile(sampleData, 0.95);

  return result;
}

function calcMetricByPeriod(data, page, dateStart, dateEnd) {
  console.log(`\nAll metrics for period from ${dateStart} to ${dateEnd}:`);

  const tableGeneral = {};
  Object.keys(PARAMETERS).forEach((parameter) => {
    const result = getMetricByPeriod(data, page, parameter, dateStart, dateEnd);
    if (result) {
      tableGeneral[parameter] = result;
    }
  });

  console.table(tableGeneral);
}

// сравнить метрику в разных срезах
function getBrowserMetric(data, page, name, browser) {
  const sampleData = data
    .filter(
      (item) =>
        item.page == page &&
        item.name == PARAMETERS[name] &&
        item.additional.browser == BROWSERS[browser]
    )
    .map((item) => item.value);

  const result = {};

  result.hits = sampleData.length;
  result.p25 = quantile(sampleData, 0.25);
  result.p50 = quantile(sampleData, 0.5);
  result.p75 = quantile(sampleData, 0.75);
  result.p95 = quantile(sampleData, 0.95);

  return result.hits === 0 ? undefined : result;
}

function getPlatformMetric(data, page, name, platform) {
  const sampleData = data
    .filter(
      (item) =>
        item.page == page &&
        item.name == PARAMETERS[name] &&
        item.additional.platform == PLATFORMS[platform]
    )
    .map((item) => item.value);

  const result = {};

  result.hits = sampleData.length;
  result.p25 = quantile(sampleData, 0.25);
  result.p50 = quantile(sampleData, 0.5);
  result.p75 = quantile(sampleData, 0.75);
  result.p95 = quantile(sampleData, 0.95);

  return result.hits === 0 ? undefined : result;
}

function getConnectionTypeMetric(data, page, name, type) {
  const sampleData = data
    .filter(
      (item) =>
        item.page == page &&
        item.name == PARAMETERS[name] &&
        item.additional.connectionType == CONNECTION_TYPES[type]
    )
    .map((item) => item.value);

  const result = {};

  result.hits = sampleData.length;
  result.p25 = quantile(sampleData, 0.25);
  result.p50 = quantile(sampleData, 0.5);
  result.p75 = quantile(sampleData, 0.75);
  result.p95 = quantile(sampleData, 0.95);

  return result.hits === 0 ? undefined : result;
}

// сравнить метрику в разных срезах
function compareMetric(data, page, name) {
  console.log(`Metric: ${PARAMETERS[name]}, Browsers`);
  const tableBrowser = {};
  Object.keys(BROWSERS).forEach((browser) => {
    const result = getBrowserMetric(data, page, name, browser);
    if (result) {
      tableBrowser[browser] = result;
    }
  });
  console.table(tableBrowser);

  console.log(`Metric: ${PARAMETERS[name]}, Platform`);
  const tablePlatform = {};
  Object.keys(PLATFORMS).forEach((platform) => {
    const result = getPlatformMetric(data, page, name, platform);
    if (result) {
      tablePlatform[platform] = result;
    }
  });

  console.table(tablePlatform);

  console.log(`Metric: ${PARAMETERS[name]}, Connection type`);
  const tableConnectionType = {};
  Object.keys(CONNECTION_TYPES).forEach((type) => {
    const result = getConnectionTypeMetric(data, page, name, type);
    if (result) {
      tableConnectionType[type] = result;
    }
  });

  console.table(tableConnectionType);
}

// добавить метрику за выбранный день
function addMetricByDate(data, page, name, date) {
  const sampleData = data
    .filter((item) => item.page == page && item.name == PARAMETERS[name] && item.date == date)
    .map((item) => item.value);

  const result = {};

  result.hits = sampleData.length;
  result.p25 = quantile(sampleData, 0.25);
  result.p50 = quantile(sampleData, 0.5);
  result.p75 = quantile(sampleData, 0.75);
  result.p95 = quantile(sampleData, 0.95);

  return result;
}
// рассчитывает все метрики за день
function calcMetricsByDate(data, page, date) {
  console.log(`\nAll metrics for ${date}:`);

  const tableGeneral = {};
  Object.keys(PARAMETERS).forEach((parameter) => {
    const result = addMetricByDate(data, page, parameter, date);
    if (result) {
      tableGeneral[parameter] = result;
    }
  });

  console.table(tableGeneral);
}

fetch('https://shri.yandex/hw/stat/data?counterId=AE7E99E2-CE57-4CDF-B138-38C847F82417')
  .then((res) => res.json())
  .then((result) => {
    let data = prepareData(result);

    calcMetricByPeriod(data, 'weather widget', '2021-10-31', '2021-11-06');

    calcMetricsByDate(data, 'weather widget', '2021-10-31');

    Object.keys(PARAMETERS).forEach((parameter) => {
      console.log(`\n${PARAMETERS[parameter]}`);
      compareMetric(data, 'weather widget', parameter);
    });
  });
