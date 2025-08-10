// JS Scripts

// https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
// https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
// https://openweathermap.org/img/wn/{icon_code}@2x.png

function runWeatherApp(card) {
  const appWindow = document.querySelector(".app-window");
  const weatherCard = document.querySelector(card);
  const displayCityName = weatherCard.querySelector(".display-city-name");
  const weatherIcon = weatherCard.querySelector(".weather-icon");
  const weatherCondition = weatherCard.querySelector(".weather-condition");
  const temperature = weatherCard.querySelector(".temperature");
  const windSpeed = weatherCard.querySelector(".wind-speed");
  const visibility = weatherCard.querySelector(".visibility");
  const expandWeather = weatherCard.querySelector(".expand-button");
  const getCityDialog = document.querySelector(".get-city-dialog");
  const getCityName = document.querySelector(".get-city-name");
  const buttonGetWeather = document.querySelector(".button-get-weather");
  const weatherAPIKey = "4827d042acf1380fe356f8ce977e6118";
  const progressDialog = weatherCard.querySelector(".progress-dialog");
  const progressBar = weatherCard.querySelector(".progress-bar");
  const forecastCard = document.querySelector(".forecast-card");
  let dataFetched = false;
  let weatherData;
  let forecast;
  let fiveDayForecast;
  appWindow.addEventListener("click", (event) => {
    let x = event.pageX;
    let y = event.pageY;
    getCityDialog.style.left = x + "px";
    getCityDialog.style.top = y + "px";
    forecastCard.classList.add("hidden");
    expandWeather.innerText = ">>";
    getCityDialog.showModal();
  });
  getCityDialog.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  buttonGetWeather.addEventListener("click", (event) => {
    event.preventDefault();
    //Removing extra spaces as well as leading and trailing spaces from input
    let city = getCityName.value.trim().replace(/\s+/g, " ");
    if (city.length > 0) {
      weatherData = fetchWeatherData(city);
    }
    getCityDialog.close();
  });
  expandWeather.addEventListener("click", (event) => {
    event.stopPropagation();
    if (event.target.innerText === ">>") {
      if (weatherData) {
        fetchForecast();
        forecastCard.style.height =
          weatherCard.getBoundingClientRect().height + "px";
        forecastCard.classList.remove("hidden");
        event.target.innerText = "<<";
      } else {
        console.log("No city to forecast");
      }
    } else {
      forecastCard.classList.add("hidden");
      event.target.innerText = ">>";
    }
  });
  async function fetchWeatherData(city) {
    let resolve = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}`,
      { mode: "cors" }
    );
    let data = await resolve.json();
    dataFetched = true;
    if (data.cod === 200) {
      weatherData = data;
      weatherCard.classList.remove("hidden");
      showWeatherdata(weatherData);
    } else {
      console.log(`Error: ${data.cod}, Message: ${data.message}`);
    }
  }

  function showWeatherdata(weatherData) {
    displayCityName.innerText = weatherData.name;
    weatherCondition.innerText = weatherData.weather[0].main;
    appWindow.style.backgroundImage = `url("../assets/images/backgrounds/${weatherData.weather[0].main}.jpg")`;
    temperature.innerText = `${(weatherData.main.temp - 273.15).toFixed(2)}°C`;
    windSpeed.innerText = `Wind speed: ${weatherData.wind.speed} (gust: ${weatherData.wind.gust})`;
    visibility.innerText = `Visibility: ${weatherData.visibility / 1000}km`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
  }

  async function fetchForecast() {
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${weatherAPIKey}`;
    let response = await fetch(url, { mode: "cors" });
    forecast = await response.json();
    fiveDayForecast = getFiveDayForecast(forecast);
    console.log(fiveDayForecast);
    let html = `<h2 class="card-title">5 Day Forecast</h2>`;
    fiveDayForecast.forEach((day, idx) => {
      html += `<p class="forecast-date">${day.date}</p>`;
      html += `<div class="forecast-weather-details">`;
      //      html += `<div class="forecast-icon-div">`;
      html += `<img class="forecast-icon" src=${day.iconUrl}>`;
      //      html += `</div>`;
      html += `<p>${(day.min - 273.15).toFixed(2)}°C</p>`;
      html += `<p>${(day.max - 273.15).toFixed(2)}°C</p>`;
      html += `</div>`;
    });
    forecastCard.innerHTML = html;
    console.log(html);
    html = null;
  }

  function showProgress() {
    progressDialog.show();
    let value = 0;
    const interval = setInterval(() => {
      if (dataFetched) {
        progressDialog.close();
        return;
      }
      value += 10;
      progressBar.value = value;
      if (value >= 100) {
        clearInterval(interval);
        value = 0;
      }
    }, 500);
  }

  function getFiveDayForecast(forecastData) {
    const days = {};
    const todayStr = new Date().toDateString(); // to skip today

    forecastData.list.forEach((entry) => {
      const date = new Date(entry.dt * 1000);

      // Skip if it's today
      if (date.toDateString() === todayStr) return;

      // Format date as dd-MMM-yyyy
      const day = String(date.getDate()).padStart(2, "0");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      // Initialize if not present
      if (!days[formattedDate]) {
        days[formattedDate] = {
          min: entry.main.temp_min,
          max: entry.main.temp_max,
          conditions: {},
          icons: {},
        };
      }

      // Update min and max temperatures
      days[formattedDate].min = Math.min(
        days[formattedDate].min,
        entry.main.temp_min
      );
      days[formattedDate].max = Math.max(
        days[formattedDate].max,
        entry.main.temp_max
      );

      // Count weather conditions & icons
      const condition = entry.weather[0].main;
      const icon = entry.weather[0].icon;
      days[formattedDate].conditions[condition] =
        (days[formattedDate].conditions[condition] || 0) + 1;
      days[formattedDate].icons[icon] =
        (days[formattedDate].icons[icon] || 0) + 1;
    });

    // Convert to array & pick most common condition and icon
    const forecastArray = Object.keys(days)
      .slice(0, 5) // only first 5 days
      .map((date) => {
        const conditionCounts = days[date].conditions;
        const mostFrequentCondition = Object.keys(conditionCounts).reduce(
          (a, b) => (conditionCounts[a] > conditionCounts[b] ? a : b)
        );

        const iconCounts = days[date].icons;
        const mostFrequentIcon = Object.keys(iconCounts).reduce((a, b) =>
          iconCounts[a] > iconCounts[b] ? a : b
        );

        return {
          date,
          min: days[date].min.toFixed(1),
          max: days[date].max.toFixed(1),
          condition: mostFrequentCondition,
          iconUrl: `https://openweathermap.org/img/wn/${mostFrequentIcon}@2x.png`,
        };
      });

    return forecastArray;
  }
}

window.onload = runWeatherApp("#card1");
