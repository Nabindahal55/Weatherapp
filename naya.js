document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'a985f5790aef9a045353dd9e3e4391eb';
  const searchBtn = document.getElementById('searchBtn'); // search buttton
  const locationBtn = document.getElementById('lacationBtn');//location button
  const cityNameInput = document.getElementById('city-name'); // city search garni thaaun

  searchBtn.addEventListener('click', () => {
    const cityName = cityNameInput.value;
    if (cityName) {
      fetchWeatherData(cityName);
    }
  });

  locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        fetchWeatherDataByCoords(latitude, longitude);
      });
    }
  });
// weather data by city name dekhauna
  const fetchWeatherData = (city) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        updateCurrentWeather(data); //current data update garna
        fetchWeatherAlerts(data.coord.lat, data.coord.lon); // show weather alerts after current weather data
      })
      .catch(error => console.error('Error fetching weather data:', error));
  };
  // cordinate bata weather data dekhauna
  const fetchWeatherDataByCoords = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        updateCurrentWeather(data);
        fetchWeatherAlerts(lat, lon); // Fetch weather alerts after current weather data
      })
      .catch(error => console.error('Error fetching weather data:', error));
  };

  const updateCurrentWeather = (data) => {
    document.querySelector('.current-weather .details h2').textContent = `${data.main.temp}°C`;
    document.querySelector('.current-weather .details p:nth-child(3)').textContent = data.weather[0].description;
    document.querySelector('.current-weather .weather-icon img').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.querySelector('.card-footer p:nth-child(1)').textContent = new Date(data.dt * 1000).toLocaleDateString();
    document.querySelector('.card-footer p:nth-child(2)').textContent = data.name;

    document.getElementById('humidityval').textContent = `${data.main.humidity}%`;
    document.getElementById('pressureval').textContent = `${data.main.pressure} hPa`;
    document.getElementById('windSpeedval').textContent = `${data.wind.speed} m/s`;
    document.getElementById('feelsval').textContent = `${data.main.feels_like}°C`;
    document.getElementById('visibityval').textContent = `${data.visibility / 1000} km`;

    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    document.querySelector('.sunrise-sunset .item:nth-child(1) h2').textContent = sunriseTime;
    document.querySelector('.sunrise-sunset .item:nth-child(2) h2').textContent = sunsetTime;

    // Fetch additional data like 6-day forecast, hourly forecast, and air quality
    fetchSixDayForecast(data.coord.lat, data.coord.lon);
    fetchHourlyForecast(data.coord.lat, data.coord.lon);
    fetchAirQualityIndex(data.coord.lat, data.coord.lon);
  };

  const fetchSixDayForecast = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => updateSixDayForecast(data))
      .catch(error => console.error('Error fetching 6-day forecast:', error));
  };

  const updateSixDayForecast = (data) => {
    const forecastElements = document.querySelectorAll('.day-forecast .forecast-item');
    for (let i = 0; i < forecastElements.length; i++) {
      const forecastIndex = i * 8; // Every 8th item represents a day
      if (forecastIndex < data.list.length) {
        const forecast = data.list[forecastIndex];
        forecastElements[i].querySelector('.icon-wrapper img').src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
        forecastElements[i].querySelector('.icon-wrapper span').textContent = `${forecast.main.temp}°C`;
        forecastElements[i].querySelector('p:nth-child(2)').textContent = new Date(forecast.dt * 1000).toLocaleDateString();
        forecastElements[i].querySelector('p:nth-child(3)').textContent = forecast.weather[0].description;
      }
    }
  };

  const fetchHourlyForecast = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => updateHourlyForecast(data))
      .catch(error => console.error('Error fetching hourly forecast:', error));
  };

  const updateHourlyForecast = (data) => {
    const hourlyForecastElements = document.querySelectorAll('.hourly-forecast .card');
    for (let i = 0; i < hourlyForecastElements.length; i++) {
      if (i < data.list.length) {
        const forecast = data.list[i];
        const time = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        hourlyForecastElements[i].querySelector('p:nth-child(1)').textContent = time;
        hourlyForecastElements[i].querySelector('img').src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
        hourlyForecastElements[i].querySelector('p:nth-child(3)').textContent = `${forecast.main.temp}°C`;
      }
    }
  };

  const fetchAirQualityIndex = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        console.log(data); // Log the data for debugging
        updateAirQualityIndex(data);
      })
      .catch(error => console.error('Error fetching air quality index:', error));
  };

  const updateAirQualityIndex = (data) => {
    const aqi = data.list[0].main.aqi;
    const aqiText = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    document.querySelector('.air-index').textContent = aqiText[aqi - 1];
// upadate air quality components
    const components = data.list[0].components;
    document.querySelector('.air-indices .item:nth-child(2) h2').textContent = components.pm2_5;
    document.querySelector('.air-indices .item:nth-child(3) h2').textContent = components.pm10;
    document.querySelector('.air-indices .item:nth-child(4) h2').textContent = components.so2;
    document.querySelector('.air-indices .item:nth-child(5) h2').textContent = components.co;
    document.querySelector('.air-indices .item:nth-child(6) h2').textContent = components.no;
    document.querySelector('.air-indices .item:nth-child(7) h2').textContent = components.no2;
    document.querySelector('.air-indices .item:nth-child(8) h2').textContent = components.nh3;
    document.querySelector('.air-indices .item:nth-child(9) h2').textContent = components.o3;
  };
          // weather alert dekhauna
  const fetchWeatherAlerts = (lat, lon) => {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        const alertsContainer = document.getElementById('weather-alerts');
        alertsContainer.innerHTML = ''; // Clear previous alerts

        if (data.alerts && data.alerts.length > 0) {
          data.alerts.forEach(alert => {
            const alertCard = document.createElement('div');
            alertCard.className = 'alert-card';

            const alertTitle = document.createElement('h3'); // alert type
            alertTitle.innerText = alert.event;
            alertCard.appendChild(alertTitle);

            const alertDescription = document.createElement('p'); // alert ko barema
            alertDescription.innerText = alert.description;
            alertCard.appendChild(alertDescription);

            const alertStart = document.createElement('p'); // alert start huni time
            alertStart.innerText = `Starts: ${new Date(alert.start * 1000).toLocaleString()}`;
            alertCard.appendChild(alertStart);

            const alertEnd = document.createElement('p');// alert end huni time
            alertEnd.innerText = `Ends: ${new Date(alert.end * 1000).toLocaleString()}`;
            alertCard.appendChild(alertEnd);

            alertsContainer.appendChild(alertCard);
          });
        } else {
          const noAlertsMessage = document.createElement('p');
          noAlertsMessage.innerText = 'No weather alerts at this time.';
          alertsContainer.appendChild(noAlertsMessage);
        }
      })
      .catch(error => console.error('Error fetching weather alerts:', error));
  };
});

document.addEventListener('DOMContentLoaded', () => {  // celsius lai farenhiet ma
  const convertBtn = document.getElementById('convertBtn');
  let isCelsius = true;

  convertBtn.addEventListener('click', () => {
    isCelsius = !isCelsius;
    const currentTempElement = document.querySelector('.current-weather .details h2');
    let currentTemp = parseFloat(currentTempElement.textContent);
    if (isCelsius) {
      currentTemp = (currentTemp - 32) * 5 / 9;
      convertBtn.textContent = 'Convert to Fahrenheit';
    } else {
      currentTemp = (currentTemp * 9 / 5) + 32;
      convertBtn.textContent = 'Convert to Celsius';
    }
    currentTempElement.textContent = `${currentTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;

    const forecastItems = document.querySelectorAll('.day-forecast .forecast-item .icon-wrapper span');
    forecastItems.forEach(item => {
      let temp = parseFloat(item.textContent);
      if (isCelsius) {
        temp = (temp - 32) * 5 / 9;
      } else {
        temp = (temp * 9 / 5) + 32;
      }
      item.textContent = `${temp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    });

    const hourlyForecastItems = document.querySelectorAll('.hourly-forecast .card p:last-child');
    hourlyForecastItems.forEach(item => {
      let temp = parseFloat(item.textContent);
      if (isCelsius) {
        temp = (temp - 32) * 5 / 9;
      } else {
        temp = (temp * 9 / 5) + 32;
      }
      item.textContent = `${temp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;

      const feelsLikeElement = document.getElementById('feelsval');
      let feelsLikeTemp = parseFloat(feelsLikeElement.textContent.replace('°C', '').replace('°F', ''));
     
      if (isCelsius) {
        if (feelsLikeElement.textContent.includes('°F')) {
          feelsLikeTemp = (feelsLikeTemp - 32) * 5 / 9;
        }
      } else {
        if (feelsLikeElement.textContent.includes('°C')) {
          feelsLikeTemp = (feelsLikeTemp * 9 / 5) + 32;
        }
      }
     
      feelsLikeElement.textContent = `${feelsLikeTemp.toFixed(1)}°${isCelsius ? 'C' : 'F'}`;
    });
  });
});
