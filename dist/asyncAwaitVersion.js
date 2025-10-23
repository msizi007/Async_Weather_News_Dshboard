"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWeatherData = fetchWeatherData;
exports.fetchNews = fetchNews;
const https_1 = __importDefault(require("https"));
function geocodeCity(city) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
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
                            resolve({ lat, lon });
                        }
                        else {
                            resolve({ error: `Error: Location "${city}" not found` });
                        }
                    }
                    catch (parseError) {
                        resolve({ error: 'Error: Failed to parse geocoding response' });
                    }
                });
            }).on('error', (err) => {
                resolve({ error: `Error: Geocoding service unavailable - ${err.message}` });
            });
        });
    });
}
// Refactor Promise code to use async/await
function fetchWeatherData(city) {
    return __awaiter(this, void 0, void 0, function* () {
        const coords = yield geocodeCity(city);
        if ('error' in coords) {
            return { data: null, cityName: city, error: coords.error };
        }
        const apiKey = 'YOUR_API_KEY';
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
        return new Promise((resolve, reject) => {
            https_1.default.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve({ data: JSON.parse(data), cityName: city });
                    }
                    catch (parseError) {
                        resolve({ data: null, cityName: city, error: 'Error: Failed to parse weather data' });
                    }
                });
            }).on('error', (err) => {
                resolve({ data: null, cityName: city, error: `Error: Weather service unavailable - ${err.message}` });
            });
        });
    });
}
function fetchNews() {
    return __awaiter(this, void 0, void 0, function* () {
        const apiKey = 'YOUR_API_KEY';
        const url = `https://dummyjson.com/posts`;
        return new Promise((resolve, reject) => {
            https_1.default.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(JSON.parse(data));
                });
            }).on('error', (err) => {
                console.error(err);
                reject(err);
            });
        });
    });
}
// Example usage:
function displayData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const city = process.argv[2] || 'Durban';
            const result = yield fetchWeatherData(city);
            if (result.error) {
                console.log(result.error);
            }
            else if (result.data) {
                const weather = result.data.current_weather;
                console.log(`Weather in ${result.cityName}:\nTemperature: ${weather.temperature}°C\nWindspeed: ${weather.windspeed} km/h\nTime: ${weather.time}`);
            }
            else {
                console.log(`Error: Could not fetch weather data for ${result.cityName}`);
            }
            const newsData = yield fetchNews();
            if (newsData && newsData.posts) {
                console.log('News Headlines:');
                newsData.posts.slice(0, 4).forEach((post, index) => {
                    console.log(`${index + 1}. ${post.title}`);
                });
            }
            else {
                console.log('Error: Failed to fetch news data');
            }
        }
        catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
        }
    });
}
displayData();
