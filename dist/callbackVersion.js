"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const https_1 = __importDefault(require("https"));
function geocodeCity(city, callback) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const options = {
        headers: {
            'User-Agent': 'WeatherDashboard/1.0'
        }
    };
    https_1.default.get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            try {
                const results = JSON.parse(data);
                if (results.length > 0) {
                    const lat = parseFloat(results[0].lat);
                    const lon = parseFloat(results[0].lon);
                    callback(lat, lon);
                }
                else {
                    callback(null, null, `Error: Location "${city}" not found`);
                }
            }
            catch (parseError) {
                callback(null, null, 'Error: Failed to parse geocoding response');
            }
        });
    }).on('error', (err) => {
        callback(null, null, `Error: Geocoding service unavailable - ${err.message}`);
    });
}
function fetchWeatherData(city, callback) {
    geocodeCity(city, (lat, lon, geoError) => {
        if (geoError) {
            callback(null, city, geoError);
            return;
        }
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        https_1.default.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    callback(JSON.parse(data), city);
                }
                catch (parseError) {
                    callback(null, city, 'Error: Failed to parse weather data');
                }
            });
        }).on('error', (err) => {
            callback(null, city, `Error: Weather service unavailable - ${err.message}`);
        });
    });
}
function fetchNews(callback) {
    const apiKey = 'YOUR_API_KEY';
    const url = `https://dummyjson.com/posts`;
    https_1.default.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            callback(JSON.parse(data));
        });
    }).on('error', (err) => {
        console.error(err);
        callback(null);
    });
}
const city = process.argv[2] || 'Durban';
fetchWeatherData(city, (weatherData, cityName, error) => {
    if (error) {
        (0, console_1.log)(error);
        return;
    }
    if (weatherData) {
        const weather = weatherData.current_weather;
        (0, console_1.log)(`Weather in ${cityName}:\nTemperature: ${weather.temperature}°C\nWindspeed: ${weather.windspeed} km/h\nTime: ${weather.time}`);
        fetchNews((newsData) => {
            if (newsData && newsData.posts) {
                (0, console_1.log)('News Headlines:');
                newsData.posts.slice(0, 4).forEach((post, index) => {
                    (0, console_1.log)(`${index + 1}. ${post.title}`);
                });
            }
            else {
                (0, console_1.log)('Error: Failed to fetch news data');
            }
        });
    }
    else {
        (0, console_1.log)(`Error: Could not fetch weather data for ${cityName}`);
    }
});
