// Практически уверена, что что-то из этого списка - град, но что, я без понятия...
const weatherDescription = {
	thunderstorm: 'Гроза',
	'thunderstorm with light rain': 'Гроза с небольшим дождем',
	'thunderstorm with rain': 'Гроза с дождем',
	'thunderstorm with heavy rain': 'Гроза с проливным дождем',
	'light thunderstorm': 'Гроза',
	'heavy thunderstorm': 'Сильная гроза',
	'ragged thunderstorm': 'Местами грозы',
	'thunderstorm with light drizzle': 'Гроза с легкой моросью',
	'thunderstorm with drizzle': 'Гроза с моросью',
	'thunderstorm with heavy drizzle': 'Гроза с моросящим дождем',

	'clear sky': 'Ясно',

	'few clouds': 'Малооблачно',
	'scattered clouds': 'Переменная облачность',
	'broken clouds': 'Облачно с прояснениями',
	'overcast clouds': 'Пасмурно',

	drizzle: 'Морось',
	'light intensity drizzle': 'Легкая морось',
	'heavy intensity drizzle': 'Плотная морось',
	'light intensity drizzle rain': 'Легкий моросящий дождик',
	'drizzle rain': 'Моросящий дождь',
	'heavy intensity drizzle rain': 'Морось с дождем',
	'shower rain and drizzle': 'Дождь с моросью',
	'heavy shower rain and drizzle': 'Ливень с моросью',
	'shower drizzle': 'Моросящий ливень',

	rain: 'Дождь',
	'light rain': 'Небольшой дождь',
	'moderate rain': 'Дождь',
	'heavy intensity rain': 'Льет как из ведра',
	'very heavy rain': 'Сильный дождь',
	'extreme rain': 'Очень сильный дождь',
	'freezing rain': 'Ледяной дождь',
	'light intensity shower rain': 'Проливной дождь',
	'shower rain': 'Ливень',
	'heavy intensity shower rain': 'Сильный ливень',
	'ragged shower rain': 'Местами ливни',

	snow: 'Снег',
	'light snow': 'Небольшой снегопад',
	'heavy snow': 'Снегопад',
	sleet: 'Мокрый снег',
	'light shower sleet': 'Мокрый снег',
	'shower sleet': 'Снег с дождем',
	'light rain and snow': 'Дождь со снегом',
	'rain and snow': 'Дождь со снегом',
	'light shower snow': 'Небольшой снегопад',
	'shower snow': 'Метель',
	'heavy shower snow': 'Сильный снегопад',

	mist: 'Туман',
	smoke: 'Дым',
	haze: 'Дымка',
	dust: 'Пыль',
	'sand/ dust whirls': 'Песчаные вихри',
	fog: 'Густой туман',
	sand: 'Песок',
	'volcanic ash': 'Вулканический пепел',
	squalls: 'Шквальный ветер',
	tornado: 'Ураган',
}

const windDirections = [
	[0, 'С'],
	[20, 'СВ'],
	[70, 'В'],
	[110, 'ЮВ'],
	[160, 'Ю'],
	[200, 'ЮЗ'],
	[250, 'З'],
	[290, 'СЗ'],
	[340, 'С'],
]

function getWindDirection(angle) {
	let i = 1
	while (i < windDirections.length && angle > windDirections[i][0]) {
		i++
	}

	return windDirections[i - 1][1]
}

function kelvinsToCelsius(temperature) {
	return Math.round(temperature - 273.15)
}

function pascalToMMHg(pressure) {
	return Math.round(+pressure * 0.75)
}

function styleTemperature(kelvins) {
	const celsius = kelvinsToCelsius(kelvins)
	const sign = celsius > 0 ? '+' : ''

	return `${sign}${celsius}\u00b0C`
}

function getIcon(weather) {
	const iconPath = (name) => `./imgs/${name}.svg`
	const generalDescription = weather.weather[0].main.toLowerCase()

	switch (generalDescription) {
		case 'tornado':
		case 'thunderstorm':
		case 'drizzle':
		case 'rain':
		case 'snow':
			return iconPath(generalDescription)

		case 'clear':
			if (weather.dt < weather.sys.sunrise || weather.dt > weather.sys.sunset) {
				return iconPath('night_' + generalDescription)
			}
			return iconPath(generalDescription)

		case 'clouds':
			if (weather.dt < weather.sys.sunrise || weather.dt > weather.sys.sunset) {
				return iconPath('night_' + weather.weather[0].description.toLowerCase().replace(/\s/g, '_'))
			}
			return iconPath(weather.weather[0].description.toLowerCase().replace(/\s/g, '_'))

		default:
			return iconPath('mist')
	}
}

function styleDescription(description) {
	return weatherDescription[description.toLowerCase()]
}

function styleWindSpeed(windSpeed) {
	const speed = windSpeed.toFixed(1).toString().replace('.', ',')
	return `${speed} м/с`
}

function styleHumidity(humidity) {
	return `${humidity}%`
}

function stylePressure(pressure) {
	const mmHg = pascalToMMHg(pressure)
	return `${mmHg} мм.рт.ст.`
}

function weatherTemplate(weatherData) {
	return {
		block: 'div',
		content: [
			{
				block: 'div',
				cls: 'weather__info-block',
				content: [
					{
						block: 'p',
						cls: ['weather__info', 'weather__temperature'],
						content: styleTemperature(weatherData.main.temp),
					},
					{
						block: 'img',
						attrs: {
							src: getIcon(weatherData),
							alt: weatherData.weather[0].main,
							'aria-hidden': true,
						},
						cls: ['weather__info', 'weather__icon'],
					},
					{
						block: 'div',
						cls: ['weather__wrapper', 'weather__wrapper_column'],
						content: [
							{
								block: 'p',
								cls: 'weather__info',
								content: styleDescription(weatherData.weather[0].description),
							},
							{
								block: 'p',
								cls: 'weather__info',
								content: [
									{
										block: 'span',
										content: 'Ощущается как ',
									},
									styleTemperature(weatherData.main.feels_like),
								],
							},
						],
					},
				],
			},
			{
				block: 'div',
				cls: 'weather__info-block',
				content: [
					{
						block: 'div',
						cls: 'weather__wrapper',
						content: [
							{
								block: 'img',
								attrs: {
									src: './imgs/wind.svg',
									alt: 'wind',
									'aria-hidden': true,
								},
								cls: 'weather__icon_small',
							},
							{
								block: 'p',
								cls: 'weather__info',
								content: getWindDirection(weatherData.wind.deg),
							},
							{
								block: 'img',
								attrs: {
									src: './imgs/compass.svg',
									alt: 'wind',
									'aria-hidden': true,
								},
								cls: ['weather__icon_small', 'weather__compass'],
							},
							{
								block: 'p',
								cls: 'weather__info',
								content: styleWindSpeed(weatherData.wind.speed),
							},
						],
					},
					{
						block: 'div',
						cls: 'weather__wrapper',
						content: [
							{
								block: 'img',
								attrs: {
									src: './imgs/humidity.svg',
									alt: 'humidity',
									'aria-hidden': true,
								},
								cls: 'weather__icon_small',
							},
							{
								block: 'p',
								cls: 'weather__info',
								content: styleHumidity(weatherData.main.humidity),
							},
						],
					},
					{
						block: 'div',
						cls: 'weather__wrapper',
						content: [
							{
								block: 'img',
								attrs: {
									src: './imgs/barometer.svg',
									alt: 'air-pressure',
									'aria-hidden': true,
								},
								cls: 'weather__icon_small',
							},
							{
								block: 'p',
								cls: 'weather__info',
								content: stylePressure(weatherData.main.pressure),
							},
						],
					},
				],
			},
		],
	}
}

function templateEngine(block) {
	if (block === undefined || block === null || block === false) {
		return document.createTextNode('')
	}

	if (typeof block === 'string' || typeof block === 'number' || block === true) {
		return document.createTextNode(String(block))
	}

	if (Array.isArray(block)) {
		const fragment = document.createDocumentFragment()

		block.forEach((contentItem) => {
			const el = templateEngine(contentItem)

			fragment.appendChild(el)
		})

		return fragment
	}

	const element = document.createElement(block.block)

	;[]
		.concat(block.cls)
		.filter(Boolean)
		.forEach((className) => element.classList.add(className))

	if (block.attrs) {
		Object.keys(block.attrs).forEach((key) => {
			element.setAttribute(key, block.attrs[key])
		})
	}

	element.appendChild(templateEngine(block.content))

	return element
}

function buildWeatherBlock(weatherData) {
	const dataObject = weatherTemplate(weatherData)
	return templateEngine(dataObject)
}
