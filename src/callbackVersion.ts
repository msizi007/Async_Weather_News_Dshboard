import { log } from 'console';
import http from 'https';

function geocodeCity(city: string, callback: (lat: number | null, lon: number | null, error?: string) => void): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const options = {
        headers: {
            'User-Agent': 'WeatherDashboard/1.0'
        }
    };
    http.get(url, options, (res) => {
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
                } else {
                    callback(null, null, `Error: Location "${city}" not found`);
                }
            } catch (parseError) {
                callback(null, null, 'Error: Failed to parse geocoding response');
            }
        });
    }).on('error', (err) => {
        callback(null, null, `Error: Geocoding service unavailable - ${err.message}`);
    });
}

function fetchWeatherData(city: string, callback: (data: any, cityName: string, error?: string) => void): void {
    geocodeCity(city, (lat, lon, geoError) => {
        if (geoError) {
            callback(null, city, geoError);
            return;
        }
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    callback(JSON.parse(data), city);
                } catch (parseError) {
                    callback(null, city, 'Error: Failed to parse weather data');
                }
            });
        }).on('error', (err) => {
            callback(null, city, `Error: Weather service unavailable - ${err.message}`);
        });
    });
}

function fetchNews(callback: (data: any) => void): void {
    const apiKey = 'YOUR_API_KEY';
    const url = `https://dummyjson.com/posts`;
    http.get(url, (res) => {
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
        log(error);
        return;
    }
    if (weatherData) {
        const weather = weatherData.current_weather;
        log(`Weather in ${cityName}:\nTemperature: ${weather.temperature}°C\nWindspeed: ${weather.windspeed} km/h\nTime: ${weather.time}`);
        fetchNews((newsData) => {
            if (newsData && newsData.posts) {
                log('News Headlines:');
                newsData.posts.slice(0, 4).forEach((post: any, index: number) => {
                    log(`${index + 1}. ${post.title}`);
                });
            } else {
                log('Error: Failed to fetch news data');
            }
        });
    } else {
        log(`Error: Could not fetch weather data for ${cityName}`);
    }
});





