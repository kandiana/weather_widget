const DEFAULT_CITY = 'Санкт-Петербург';
const loader =
  '<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>';

const MAX_NUMBER_OF_SUGGESTIONS = 5;
const cities = [];

/*****************************/
//метрики
let citiesRequestStart = Date.now();
let weatherRequestStart = Date.now();

/*****************************/

const weatherBlock = document.querySelector('.weather');
const cityBlock = weatherBlock.querySelector('.weather__city-name');
const locationIcon = weatherBlock.querySelector('.weather__hint');
const inputBlock = weatherBlock.querySelector('.input-city');

/************************ WEATHER *************************/

function loadWheatherData(block) {
  //метрики
  counter.send('getWeatherData', Math.round(Date.now() - weatherRequestStart));

  const data = JSON.parse(block);

  weatherBlock.classList.remove('weather_night');

  if (data.dt < data.sys.sunrise || data.dt > data.sys.sunset) {
    weatherBlock.classList.add('weather_night');
  }

  const renderStart = Date.now();

  const node = buildWeatherBlock(data);

  const formerWeatherData = weatherBlock.lastChild;
  formerWeatherData.remove();

  const iconLoadStart = Date.now();
  weatherBlock.appendChild(node);

  document.querySelector('.weather__icon').addEventListener('load', () => {
    //метрики
    counter.send('loadLargestIcon', Math.round(Date.now() - iconLoadStart));
  });

  const compassIcon = weatherBlock.querySelector('.weather__compass');
  compassIcon.style = `transform: rotate(${data.wind.deg + 135}deg)`;

  //метрики
  counter.send('renderMainBlock', Math.round(Date.now() - renderStart));
}

function showError(status, description) {
  const error = document.createElement('h1');
  error.classList.add('error');
  error.textContent = `Error ${status}: ${description}`;

  const formerWeatherData = weatherBlock.lastChild;
  formerWeatherData.remove();

  weatherBlock.appendChild(error);
}

function processRecievedData(event, onSuccess, onError) {
  const target = event.target;

  if (target.readyState !== 4) {
    return;
  }

  if (target.status === 200) {
    onSuccess(target.responseText);
  } else {
    if (onError) {
      onError(target.status, target.statusText);
    }
  }
}

function getWeatherData(cityName) {
  //метрики
  weatherRequestStart = Date.now();

  const xhr = new XMLHttpRequest();
  const requestURL = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`;

  xhr.open('GET', requestURL);
  xhr.send();

  xhr.addEventListener('readystatechange', (event) => {
    processRecievedData(event, loadWheatherData, showError);
  });

  const formerWeatherData = weatherBlock.lastChild;
  if (formerWeatherData.tagName !== 'P') {
    formerWeatherData.remove();
  }
  weatherBlock.insertAdjacentHTML('beforeend', loader);
}

/************************ CITIES *************************/

const suggestionsBlock = document.querySelector('.suggested-cities');
suggestionsBlock.onmousedown = () => {
  return false;
};

function hideSuggestions(event) {
  const target = event.target;

  if (suggestionsBlock.textContent === '' || !target.closest('.wrapper_suggested')) {
    suggestionsBlock.classList.add('hidden');
  }
}

function showSuggestions() {
  if (suggestionsBlock.textContent !== '') {
    suggestionsBlock.classList.remove('hidden');
  }
}

function newLine(cityName, index) {
  const textBlock = document.createElement('p');
  textBlock.classList.add('suggested-text');
  textBlock.tabIndex = index;
  textBlock.textContent = cityName;
  return textBlock;
}

function updateSuggestions(event) {
  const inputValue = event.target.value;

  if (inputValue === '') {
    suggestionsBlock.textContent = '';
    hideSuggestions(event);
    return;
  }

  const cityRegExStart = new RegExp(`^${inputValue}`, 'i');
  const cityRegExMiddle = new RegExp(`.${inputValue}`, 'i');
  const suggestionsFragment = document.createDocumentFragment();
  const additionalSuggestions = [];
  let count = 0;

  for (let city of cities) {
    if (city.match(cityRegExStart)) {
      count += 1;
      suggestionsFragment.appendChild(newLine(city, count));
      if (count === MAX_NUMBER_OF_SUGGESTIONS) {
        break;
      }
    } else if (city.match(cityRegExMiddle)) {
      additionalSuggestions.push(newLine(city, 0));
    }
  }

  if (count < MAX_NUMBER_OF_SUGGESTIONS) {
    for (let line of additionalSuggestions) {
      count += 1;
      suggestionsFragment.appendChild(line);
      line.tabIndex = count;
      if (count === MAX_NUMBER_OF_SUGGESTIONS) {
        break;
      }
    }
  }

  if (count === 0) {
    const textBlock = document.createElement('p');
    textBlock.classList.add('suggested_error');
    textBlock.textContent = 'Подходящих городов не найдено';
    suggestionsFragment.appendChild(textBlock);
  }

  suggestionsBlock.textContent = '';
  suggestionsBlock.appendChild(suggestionsFragment);
  showSuggestions();
}

function chooseSuggestion(event) {
  const target = event.target;

  if (!target.classList.contains('suggested-text')) {
    return;
  }

  inputBlock.value = target.textContent;
  suggestionsBlock.textContent = '';

  getWeatherData(inputBlock.value);
  updateCityName();
  hideSuggestions(event);
}

function updateCityName() {
  if (inputBlock.value) {
    cityBlock.textContent = inputBlock.value;
  }
  cityBlock.classList.remove('hidden');
  inputBlock.classList.add('hidden');
}

function loadCitiesData(block) {
  //метрики
  counter.send('getCitiesData', Math.round(Date.now() - citiesRequestStart));

  const data = JSON.parse(block);

  for (let city of data) {
    cities.push(city.name);
  }

  inputBlock.addEventListener('click', updateSuggestions);
  inputBlock.addEventListener('input', updateSuggestions);

  suggestionsBlock.addEventListener('click', chooseSuggestion);
}

function getCities() {
  //метрики
  citiesRequestStart = Date.now();

  const xhr = new XMLHttpRequest();
  const requestURL =
    'https://raw.githubusercontent.com/pensnarik/russian-cities/master/russian-cities.json';

  xhr.open('GET', requestURL);
  xhr.send();

  xhr.addEventListener('readystatechange', (event) => {
    processRecievedData(event, loadCitiesData);
  });
}

function changeCity() {
  inputBlock.value = cityBlock.textContent;
  inputBlock.classList.remove('hidden');
  cityBlock.classList.add('hidden');

  inputBlock.focus();
}

/********************************************/

cityBlock.textContent = DEFAULT_CITY;
getWeatherData(DEFAULT_CITY);
getCities();

cityBlock.addEventListener('click', changeCity);
locationIcon.addEventListener('click', () => {
  cityBlock.click();
});

inputBlock.addEventListener('blur', (event) => {
  cityBlock.classList.remove('hidden');
  inputBlock.classList.add('hidden');
  hideSuggestions(event);
});

document.addEventListener('keyup', (event) => {
  const key = event.key;
  switch (key) {
    case 'Escape':
      cityBlock.classList.remove('hidden');
      inputBlock.classList.add('hidden');
      hideSuggestions(event);
      return;
    case 'Enter':
      getWeatherData(inputBlock.value);
      updateCityName();
      hideSuggestions(event);
      return;
  }
});
