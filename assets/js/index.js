import { apiKey } from "./api-key.js";

const API_KEY = apiKey; // Replace with your WeatherAPI key
const BASE_URL = 'https://api.weatherapi.com/v1';

const citySearch = document.getElementById('citySearch');
const searchBtn = document.getElementById('searchBtn');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const weatherIcon = document.getElementById('weatherIcon');
const currentTime = document.getElementById('current_time');
const currentDate = document.getElementById('current_date');
const forecastContainer = document.getElementById('forecastContainer');

searchBtn.addEventListener('click', handleSearch);
citySearch.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

getWeatherData('London');

async function handleSearch() {
    const city = citySearch.value.trim();
    if (!city) {
        showError('Please enter a city name.');
        return;
    }
    await getWeatherData(city);
}

async function getWeatherData(city) {
    try {
        const currentWeatherUrl = `${BASE_URL}/current.json?key=${API_KEY}&q=${city}`;
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const currentWeatherData = await currentWeatherResponse.json();

        if (!currentWeatherResponse.ok) {
            throw new Error(currentWeatherData.error.message);
        }

        const timeZone = currentWeatherData.location.tz_id;

        getFormattedTime(timeZone);

        updateCurrentWeather(currentWeatherData);

        const forecastUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=5`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (!forecastResponse.ok) {
            throw new Error(forecastData.error.message);
        }

        updateForecast(forecastData);
    } catch (error) {
        showError(error.message);
        console.error(error);
    }
}

function updateCurrentWeather(data) {
    const { location, current } = data;
    cityName.textContent = location.name || 'N/A';
    temperature.textContent = current.temp_c ? `${current.temp_c}°C` : 'N/A';
    description.textContent = current.condition.text || 'N/A';
    humidity.textContent = current.humidity ? `${current.humidity}%` : 'N/A';
    windSpeed.textContent = current.wind_kph ? `${current.wind_kph} km/h` : 'N/A';
    weatherIcon.src = `./assets/images/${getWeatherIcon(current.condition.code)}`;
}

function updateForecast(data) {
    forecastContainer.innerHTML = '';

    const dailyForecasts = data.forecast.forecastday;

    dailyForecasts.forEach(forecast => {

        const date = new Date(forecast.date);
        const card = document.createElement('div');
        const weatherIcon = getWeatherIcon(forecast.day.condition.code);

        card.className = 'forecast_card';
        card.innerHTML = `
                    <p class="date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <img src="./assets/images/${weatherIcon}" alt="${forecast.day.condition.text}">
                    <p class="temp">${forecast.day.avgtemp_c}°C</p>
                    <p class="description">${forecast.day.condition.text}</p>
                `;
        forecastContainer.appendChild(card);
    });
}

const customIcons = {
    1000: "clear-day.svg",
    1003: "partly-cloudy-day.svg",
    1006: "cloudy.svg",
    1009: "overcast.svg",
    1030: "mist.svg",
    1063: "drizzle.svg",
    1066: "snow-light.svg",
    1069: "sleet.svg",
    1072: "freezing-drizzle.svg",
    1087: "thunderstorm-possible.svg",
    1114: "blowing-snow.svg",
    1117: "blizzard.svg",
    1135: "fog.svg",
    1147: "freezing-fog.svg",
    1150: "drizzle-light.svg",
    1153: "drizzle.svg",
    1168: "freezing-drizzle.svg",
    1171: "freezing-drizzle-heavy.svg",
    1180: "rain-light.svg",
    1183: "rain.svg",
    1186: "rain-moderate.svg",
    1189: "rain-moderate.svg",
    1192: "rain-heavy.svg",
    1195: "rain-heavy.svg",
    1198: "freezing-rain-light.svg",
    1201: "freezing-rain-heavy.svg",
    1204: "sleet-light.svg",
    1207: "sleet-heavy.svg",
    1210: "snow-light.svg",
    1213: "snow.svg",
    1216: "snow-moderate.svg",
    1219: "snow-moderate.svg",
    1222: "snow-heavy.svg",
    1225: "snow-heavy.svg",
    1237: "hail.svg",
    1240: "rain-shower-light.svg",
    1243: "rain-shower-heavy.svg",
    1246: "rain-torrential.svg",
    1249: "sleet-shower-light.svg",
    1252: "sleet-shower-heavy.svg",
    1255: "snow-shower-light.svg",
    1258: "snow-shower-heavy.svg",
    1261: "hail-shower-light.svg",
    1264: "hail-shower-heavy.svg",
    1273: "thunderstorm-rain-light.svg",
    1276: "thunderstorm-rain-heavy.svg",
    1279: "thunderstorm-snow-light.svg",
    1282: "thunderstorm-snow-heavy.svg"
}

function getWeatherIcon(conditionCode) {
    return customIcons[conditionCode] || "default.svg";
}

function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `Error: ${message}`;

    document.querySelector('.dashboard_header').appendChild(errorDiv);


    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function getFormattedTime(timezone) {
    const options = {
        timeZone: timezone,
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    };

    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-GB", options);
    const formattedDateTime = formatter.format(now);

    const [date, time] = formattedDateTime.split(", ");

    const isoDateTime = now.toISOString();

    const timeElement = document.querySelector("#current_time");
    const dateElement = document.querySelector("#current_date");

    timeElement.textContent = time;
    dateElement.textContent = date;
    timeElement.setAttribute("datetime", isoDateTime);
    dateElement.setAttribute("datetime", isoDateTime);
}