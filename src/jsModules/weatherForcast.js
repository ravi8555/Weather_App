// import { API_KEY } from '../../config';
const API_KEY = process.env.WEATHER_API_KEY

const weather_codes = {
  0: {
    name: 'Clear Sky',
    icons: {
      day: 'clear.svg',
      night: 'clear-night.svg',
    },
  },
  1: {
    name: 'Mainly Clear',
    icons: {
      day: 'clear.svg',
      night: 'clear-night.svg',
    },
  },
  2: {
    name: 'Partly Cloudy',
    icons: {
      day: 'partly-cloudy.svg',
      night: 'partly-cloudy-night.svg',
    },
  },
  3: {
    name: 'Overcast',
    icons: {
      day: 'overcast.svg',
      night: 'overcast.svg',
    },
  },
  45: {
    name: 'Fog',
    icons: {
      day: 'fog.svg',
      night: 'fog-night.svg',
    },
  },
  48: {
    name: 'Rime Fog',
    icons: {
      day: 'rime-fog.svg',
      night: 'rime-fog.svg',
    },
  },
  51: {
    name: 'Light Drizzle',
    icons: {
      day: 'light-drizzle.svg',
      night: 'light-drizzle.svg',
    },
  },
  53: {
    name: 'Moderate Drizzle',
    icons: {
      day: 'drizzle.svg',
      night: 'drizzle.svg',
    },
  },
  55: {
    name: 'Heavy Drizzle',
    icons: {
      day: 'heavy-drizzle.svg',
      night: 'heavy-drizzle.svg',
    },
  },
  56: {
    name: 'Light Freezing Drizzle',
    icons: {
      day: 'drizzle.svg',
      night: 'drizzle.svg',
    },
  },
  57: {
    name: 'Dense Freezing Drizzle',
    icons: {
      day: 'heavy-drizzle.svg',
      night: 'heavy-drizzle.svg',
    },
  },
  61: {
    name: 'Slight Rain',
    icons: {
      day: 'slight-rain.svg',
      night: 'slight-rain-night.svg',
    },
  },
  63: {
    name: 'Moderate Rain',
    icons: {
      day: 'rain.svg',
      night: 'rain.svg',
    },
  },
  65: {
    name: 'Heavy Rain',
    icons: {
      day: 'heavy-rain.svg',
      night: 'heavy-rain.svg',
    },
  },
  66: {
    name: 'Light Freezing Rain',
    icons: {
      day: 'rain.svg',
      night: 'rain.svg',
    },
  },
  67: {
    name: 'Heavy Freezing Rain',
    icons: {
      day: 'heavy-rain.svg',
      night: 'heavy-rain.svg',
    },
  },
  71: {
    name: 'Slight snowfall',
    icons: {
      day: 'light-snow.svg',
      night: 'light-snow-night.svg',
    },
  },
  73: {
    name: 'Moderate snowfall',
    icons: {
      day: 'snow.svg',
      night: 'snow.svg',
    },
  },
  75: {
    name: 'Heavy snowfall',
    icons: {
      day: 'heavy-snow.svg',
      night: 'heavy-snow.svg',
    },
  },
  77: {
    name: 'Snow Grains',
    icons: {
      day: 'snow-grains.svg',
      night: 'snow-grains.svg',
    },
  },
  80: {
    name: 'Slight Rain Showers',
    icons: {
      day: 'slight-rain-showers.svg',
      night: 'slight-rain-showers-night.svg',
    },
  },
  81: {
    name: 'Moderate Rain Showers',
    icons: {
      day: 'rain-showers.svg',
      night: 'rain-showers.svg',
    },
  },
  82: {
    name: 'Violent Rain Showers',
    icons: {
      day: 'heavy-rain-showers.svg',
      night: 'heavy-rain-showers.svg',
    },
  },
  85: {
    name: 'Light Snow Showers',
    icons: {
      day: 'light-snow-showers.svg',
      night: 'light-snow-showers.svg',
    },
  },
  86: {
    name: 'Heavy Snow Showers',
    icons: {
      day: 'heavy-snow-showers.svg',
      night: 'heavy-snow-showers.svg',
    },
  },
  95: {
    name: 'Thunderstorm',
    icons: {
      day: 'thunderstorm.svg',
      night: 'thunderstorm.svg',
    },
  },
  96: {
    name: 'Slight Hailstorm',
    icons: {
      day: 'hail.svg',
      night: 'hail.svg',
    },
  },
  99: {
    name: 'Heavy Hailstorm',
    icons: {
      day: 'heavy-hail.svg',
      night: 'heavy-hail.svg',
    },
  },
}

import L from 'leaflet';
// import 'leaflet/dist/leaflet.css'

class ForecastWeather {
    constructor(city) {
      this.city = city;
      this.cache = new Map();
      this.cacheExpiry = 5 * 60 * 1000;  
    }

    async getGeoLocation(location) {
      this.location = location;
      const options = {
        method: 'GET',
        headers: {accept: 'application/json', 'accept-encoding': 'deflate, gzip, br'}
      };
      try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${this.location}&count=1&language=en&format=json`, options);
        if(!response.ok) {
          throw new Error("Failed to fetch location data");
        }
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
          throw new Error("Location not found");
        }
        console.log("Geo Location===>",data.results[0]);
        
        return data.results[0];
      } catch (error) {
        console.error("Error:", error);
        throw error;
      }
    }

   async getWeatherData(city) {
  const cacheKey = city.toLowerCase();

  if(this.cache.has(cacheKey)) {
    const {data, timestamp} = this.cache.get(cacheKey);
    if(Date.now() - timestamp < this.cacheExpiry) {
      console.log("Returning cached weather data");
      return data;
    }
  }

  try {
    const geoData = await this.getGeoLocation(city);
    const {longitude: lon, latitude: lat} = geoData;
    
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch weather data: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Cache the data
    this.cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    console.log("Weather Data==>", data);
    
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

    async displayForecast(cityName) {
      try {
        const cityName = cityName || document.getElementById('location-input').value.trim();
        if (!cityName) return;
        
        const dataWeather = await this.getWeatherData(cityName);
        const {current, daily} = dataWeather;
        
        const weatherCondition = weather_codes[current.weather_code];
        const isDay = current.is_day === 1;
        const imgSrc = `https://portfoliohub.in/weatherapp/images/${isDay ? weatherCondition.icons.day : weatherCondition.icons.night}`;
        
        // Update current weather
        const splitCityval = cityName.split().join('')  
        const firstLcap =  splitCityval[0].toUpperCase() + splitCityval.slice(1)
        document.getElementById('location').textContent = firstLcap;
        const date = new Date(current.time)
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dayNum = date.getDate();
        const month = date.toLocaleDateString('en-US', { month: 'long' });
        const formattedDate = `${day}, ${dayNum} ${month}`;  // "Sunday 20 July"
        const timeOption = {
          hour : "numeric",
          minute : "2-digit",
          hour12 : true
        }
        const formattedTime = date.toLocaleTimeString('en-US', timeOption)
        document.getElementById('currentDate').textContent = formattedDate;
        document.getElementById('currentTime').textContent = formattedTime;
        document.getElementById('temperature').textContent = `${current.temperature_2m}`;
        document.getElementById('wind-speed').textContent = `${current.wind_speed_10m} km/h`;
        document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
        document.getElementById('weather-condition-name').textContent = weatherCondition.name;
        document.getElementById('weather-condition-icon').src = imgSrc;

        // Update 7-day forecast
        const forecastDaily = document.getElementById('daily-forecast');
        forecastDaily.innerHTML = ''; // Clear previous forecast

        for(let i = 1; i < 7; i++) {
          const dailyCode = daily.weather_code[i];
          console.log("Daily Cards =>", dailyCode);
          
          const weatherCond = weather_codes[dailyCode];
          const temperatureMax = daily.temperature_2m_max[i];
          const temperatureMin = daily.temperature_2m_min[i];
          const timeStamp = new Date(daily.time[i]).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });

          const divElement = document.createElement('div');
          divElement.className = 'forecast-day card';
          
          
          divElement.innerHTML = `
            <img src="https://portfoliohub.in/weatherapp/images/${weatherCond.icons.day}" alt="weather-icon" width="100" height="100"/>
            <div class="temps">
              <p class="temp" title="Maximum Temperature">${temperatureMax}°<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 5c1.55 0 3 .47 4.19 1.28l-1.16 2.89A4.47 4.47 0 0 0 16.5 8C14 8 12 10 12 12.5s2 4.5 4.5 4.5c1.03 0 1.97-.34 2.73-.92l1.14 2.85A7.47 7.47 0 0 1 16.5 20A7.5 7.5 0 0 1 9 12.5A7.5 7.5 0 0 1 16.5 5M6 3a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0 2a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1"/></svg></p>
              <p class="temp" title="Minimum Temperature">${temperatureMin}°<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 5c1.55 0 3 .47 4.19 1.28l-1.16 2.89A4.47 4.47 0 0 0 16.5 8C14 8 12 10 12 12.5s2 4.5 4.5 4.5c1.03 0 1.97-.34 2.73-.92l1.14 2.85A7.47 7.47 0 0 1 16.5 20A7.5 7.5 0 0 1 9 12.5A7.5 7.5 0 0 1 16.5 5M6 3a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0 2a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1"/></svg></p>
            </div>
            <p class="date">${timeStamp}</p>`;
            
          forecastDaily.appendChild(divElement);
        }
      } catch (error) {
        console.error("Error displaying forecast:", error);
        errorMsg.textContent = error.message;
        document.getElementById('weather-details').style.display = 'none';
      }
    }
}
const weatherApp = new ForecastWeather();
// 93ed41b6-f387-48d0-820a-c11f9ce53017


// const searchBtn = document.getElementById('search-button');
const errorMsg = document.getElementById('errTxt');
const searchBox = document.getElementById('weather-form');


const loadMap = async (city)=>{
  const cityMapContainer = document.getElementById('cityMap');
 
  try {
    errorMsg.textContent = 'Loading map...';
  
     // Then load the map
    const geoData = await weatherApp.getGeoLocation(city);
    const { latitude, longitude, country, admin1 } = geoData;

    // Ensure map container exists
    if (!cityMapContainer) {
      throw new Error('Map container not found');
    }
    errorMsg.textContent = 'Loading...';
    // Set container styles
    cityMapContainer.style.display = 'block';
    cityMapContainer.style.height = '300px';

    // Properly destroy previous map instance
    if (window.cityMap) {
      window.cityMap.remove();
      window.cityMap = null;
      cityMapContainer.innerHTML = ''; // Clear any leftover tiles
    }
    errorMsg.textContent = '';

    // Recreate the container if needed
    if (!document.getElementById('cityMap')) {
      const newMapContainer = document.createElement('div');
      newMapContainer.id = 'cityMap';
      newMapContainer.className = 'city-map';
      document.querySelector('.grid').appendChild(newMapContainer);
    }

    // Initialize new map
    window.cityMap = L.map('cityMap').setView([latitude, longitude], 4);


const baseLayer =  L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key='+ API_KEY);

const osmLayer = {
  "OSM Standard": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  "OSM Humanitarian": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'),
  "Watercolor": L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg')
};

// Try watercolor first, fallback to OSM if it fails
  baseLayer.addTo(window.cityMap);

 window.cityMap.on('tileerror', () => {
    map.removeLayer(watercolorLayer);
    osmLayer.addTo(window.cityMap);
  });

    // Add marker
    L.marker([latitude, longitude])
      .addTo(window.cityMap)
      .bindPopup(`<div class="mapPopup">
  <h2>${city}</h2>
  <p>Lat:${latitude} <br/> Lon:${longitude}</p>
  <p>${admin1}</p>
  <p>${country}</p>
</div>`)
      .openPopup();
  } catch (error) {
    console.error("Map loading error:", error);
    throw error;
  }
}
// display default weather info
async function defaultCity(){
  const lastCity = localStorage.getItem( 'lastCity')
  const cityValue = lastCity || "Mumbai"
  try { 
    document.getElementById('location-input').value = cityValue   
    await weatherApp.displayForecast(cityValue);
    await loadMap(cityValue)
    
  } catch (error) {
    console.error("Default city not fetch", error)
  }
}

document.addEventListener('DOMContentLoaded', defaultCity());

searchBox.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = document.getElementById('location-input').value.trim();
  const weatherDataElement = document.getElementById('weather-details');
  // const cityMapContainer = document.getElementById('cityMap');
  
  if (!city) {
    errorMsg.textContent = 'Please enter the city name';
    weatherDataElement.style.display = 'none';
    return;
  }

  errorMsg.textContent = 'Loading...';
  weatherDataElement.style.display = 'block';

  try {
    // First get weather data
    await weatherApp.displayForecast();
    await loadMap(city)
    localStorage.setItem('lastCity', city)
    
} catch (error) {
    console.error("Error:", error);
    errorMsg.textContent = `Failed to load: ${error.message}`;
    weatherDataElement.style.display = 'none';
  }
});


// const worldMap = function initMap(){
//   const map = L.map('map').setView([19.07283, 72.88261], 4);
// //  const baseLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=93ed41b6-f387-48d0-820a-c11f9ce53017', {
// //   minZoom: 1,
// //   maxZoom: 16,
// //   attribution: '©'
// // }).addTo(map);

// const baseLayer =  L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key='+ API_KEY);

// const osmLayer = {
//   "OSM Standard": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
//   "OSM Humanitarian": L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'),
//   "Watercolor": L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg')
// };

// // Try watercolor first, fallback to OSM if it fails
//   baseLayer.addTo(map);

//  map.on('tileerror', () => {
//     map.removeLayer(watercolorLayer);
//     osmLayer.addTo(map);
//   });
// }

// document.addEventListener('DOMContentLoaded', worldMap);


