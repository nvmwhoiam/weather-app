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

// Initialize with default city
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
        // Get current weather
        const currentWeatherUrl = `${BASE_URL}/current.json?key=${API_KEY}&q=${city}`;
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const currentWeatherData = await currentWeatherResponse.json();

        if (!currentWeatherResponse.ok) {
            throw new Error(currentWeatherData.error.message);
        }

        const timeZone = currentWeatherData.location.tz_id;

        getFormattedTime(timeZone);

        updateCurrentWeather(currentWeatherData);

        // Get forecast
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
    cityName.textContent = location?.name || 'N/A';
    temperature.textContent = current?.temp_c ? `${current.temp_c}°C` : 'N/A';
    description.textContent = current?.condition?.text || 'N/A';
    humidity.textContent = current?.humidity ? `${current.humidity}%` : 'N/A';
    windSpeed.textContent = current?.wind_kph ? `${current.wind_kph} km/h` : 'N/A';
    // weatherIcon.src = current?.condition?.icon ? `https:${current.condition.icon}` : '';  
}

function updateForecast(data) {
    forecastContainer.innerHTML = '';

    // Get daily forecasts
    const dailyForecasts = data.forecast.forecastday;

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.date);
        const card = document.createElement('div');
        card.className = 'forecast_card';
        card.innerHTML = `
                    <p class="date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <img src="${forecast.day.condition.icon}" alt="${forecast.day.condition.text}">
                    <p class="temp">${forecast.day.avgtemp_c}°C</p>
                    <p class="description">${forecast.day.condition.text}</p>
                `;
        forecastContainer.appendChild(card);
    });
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