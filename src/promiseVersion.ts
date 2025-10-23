import http from 'https';

function geocodeCity(city: string): Promise<{lat: number, lon: number} | {error: string}> {
    return new Promise((resolve, reject) => {
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
                        resolve({lat, lon});
                    } else {
                        resolve({error: `Error: Location "${city}" not found`});
                    }
                } catch (parseError) {
                    resolve({error: 'Error: Failed to parse geocoding response'});
                }
            });
        }).on('error', (err) => {
            resolve({error: `Error: Geocoding service unavailable - ${err.message}`});
        });
    });
}

export function fetchWeatherData(city: string): Promise<{data: any, cityName: string, error?: string}> {
    return geocodeCity(city).then(coords => {
        if ('error' in coords) {
            return {data: null, cityName: city, error: coords.error};
        }
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;

        return new Promise((resolve, reject) => {
            http.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        resolve({data: JSON.parse(data), cityName: city});
                    } catch (parseError) {
                        resolve({data: null, cityName: city, error: 'Error: Failed to parse weather data'});
                    }
                });
            }).on('error', (err) => {
                resolve({data: null, cityName: city, error: `Error: Weather service unavailable - ${err.message}`});
            });
        });
    });
}
export function fetchNews(): Promise<any> {
    const apiKey = 'YOUR_API_KEY';
    const url = `https://dummyjson.com/posts`;      
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
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
}

// Example usage:

const city = process.argv[2] || 'Durban';

fetchWeatherData(city)
    .then((result) => {
        if (result.error) {
            console.log(result.error);
            return fetchNews();
        }
        if (result.data) {
            const weather = result.data.current_weather;
            console.log(`Weather in ${result.cityName}:\nTemperature: ${weather.temperature}°C\nWindspeed: ${weather.windspeed} km/h\nTime: ${weather.time}`);
        } else {
            console.log(`Error: Could not fetch weather data for ${result.cityName}`);
        }
        return fetchNews();
    })
    .then((newsData) => {
        if (newsData && newsData.posts) {
            console.log('News Headlines:');
            newsData.posts.slice(0, 4).forEach((post: any, index: number) => {
                console.log(`${index + 1}. ${post.title}`);
            });
        } else {
            console.log('Error: Failed to fetch news data');
        }
    })
    .catch((error) => {
        console.error('Error:', error.message || error);
    });

    // Implement Promise.all() and Promise.race() examples
Promise.all([fetchWeatherData(city), fetchNews()])
    .then(([weatherResult, newsData]) => {
        if (weatherResult.error) {
            console.log(`Promise.all - ${weatherResult.error}`);
        } else if (weatherResult.data) {
            const weather = weatherResult.data.current_weather;
            console.log(`Promise.all - Weather in ${weatherResult.cityName}:\nTemperature: ${weather.temperature}°C\nWindspeed: ${weather.windspeed} km/h\nTime: ${weather.time}`);
        } else {
            console.log(`Promise.all - Error: Could not fetch weather data for ${weatherResult.cityName}`);
        }
        if (newsData && newsData.posts) {
            console.log('Promise.all - News Headlines:');
            newsData.posts.slice(0, 4).forEach((post: any, index: number) => {
                console.log(`${index + 1}. ${post.title}`);
            });
        } else {
            console.log('Promise.all - Error: Failed to fetch news data');
        }
    })
    .catch((error) => {
        console.error('Promise.all Error:', error.message || error);
    });
Promise.race([fetchWeatherData(city), fetchNews()])
    .then((firstData) => {
        console.log('Promise.race - First Data:', firstData);
    })
    .catch((error) => {
        console.error('Promise.race Error:', error.message || error);
    });
    