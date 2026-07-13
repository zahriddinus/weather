"script";

const elUserAddress = document.querySelector(".search__address");
const elForm = document.querySelector(".search__form");
const elFormInput = document.querySelector(".search__form-input");
const elSuggestionsList = document.querySelector(".search__suggestions-list");

const weatherInfo = {
  0: { icon: "☀️", text: "Clear" },
  1: { icon: "🌤️", text: "Mainly clear" },
  2: { icon: "⛅", text: "Partly cloudy" },
  3: { icon: "☁️", text: "Overcast" },
  45: { icon: "🌫️", text: "Fog" },
  48: { icon: "🌫️", text: "Depositing rime fog" },
  51: { icon: "🌦️", text: "Light drizzle" },
  53: { icon: "🌦️", text: "Moderate drizzle" },
  55: { icon: "🌧️", text: "Dense drizzle" },
  61: { icon: "🌧️", text: "Slight rain" },
  63: { icon: "🌧️", text: "Moderate rain" },
  65: { icon: "🌧️", text: "Heavy rain" },
  71: { icon: "❄️", text: "Slight snow" },
  73: { icon: "❄️", text: "Moderate snow" },
  75: { icon: "❄️", text: "Heavy snow" },
  80: { icon: "🌦️", text: "Rain showers" },
  81: { icon: "🌧️", text: "Heavy rain showers" },
  82: { icon: "⛈️", text: "Violent rain showers" },
  95: { icon: "⛈️", text: "Thunderstorm" },
  96: { icon: "⛈️", text: "Thunderstorm with hail" },
  99: { icon: "⛈️", text: "Heavy thunderstorm with hail" },
};

elForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  elSuggestionsList.classList.remove("d-block");
  elSuggestionsList.classList.add("d-none");

  renderAddress(elFormInput.value.trim().toLowerCase());
});

const renderAddress = async function (country, index) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${country}&count=10`,
    );
    const data = await response.json();
    const {
      latitude,
      longitude,
      name,
      admin1: regionName,
      country: countryName,
      country_code: countryCode,
    } = data.results[index ?? 0];

    const regionNameYes = regionName ? regionName + " / " : "";

    function formatName(text) {
      if (!text) return "";

      const words = text.split(" ");

      if (words.length <= 2) return text;

      return words
        .map((word, index) => (index === 0 ? word : `${word.slice(0, 3)}.`))
        .join(" ");
    }

    const currentCity = formatName(name);

    const currentRegion =
      regionName !== undefined
        ? `${formatName(regionName)} /`
        : regionNameYes.trim();

    const currentCountry =
      countryName.split(" ").length > 2 ? countryCode : countryName;

    elUserAddress.textContent = `${currentCity} / ${currentRegion} ${currentCountry}`;

    renderDatas(latitude, longitude);
  } catch (err) {
    console.log(err);
    // alert("Error fetching data. Please try again later.");
  }
};
renderAddress("tashkent");

const renderDatas = async function (latitude, longitude) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=7&timezone=auto`,
  );
  const data = await res.json();

  // Current information:
  const days = data.daily.time.map((date) =>
    new Date(date).toLocaleDateString("en-CA", {
      weekday: "long",
    }),
  );
  const today = data.current.time.split("T")[0];
  const todayIndex = data.daily.time.indexOf(today);
  document.querySelector(".conditions__left-icon").textContent =
    `${weatherInfo[data.current.weather_code].icon}`;
  document.querySelector(".conditions__left-temperature").textContent =
    `${data.current.temperature_2m}`;
  document.querySelector(".conditions__right-chance-of-prec").textContent =
    ` ${data.current.precipitation_probability}%`;
  document.querySelector(".conditions__right-humidity").textContent =
    ` ${data.current.relative_humidity_2m}%`;
  document.querySelector(".conditions__right-wind").textContent =
    ` ${data.current.wind_speed_10m} km/h`;
  document.querySelector(".conditions__datas-day").textContent =
    ` ${days[todayIndex]}`;
  document.querySelector(".conditions__datas-day-time").textContent =
    ` ${data.current.time.split("T")[1]}`;
  document.querySelector(".conditions__datas-items-condition").textContent =
    ` ${weatherInfo[data.current.weather_code].text}`;

  // Grapic:

  const dailyTimes = data.hourly.time.map((item) => item.split("T")[1]);
  const updatedTime = dailyTimes.indexOf(
    `${data.current.time.slice(11, 13)}:00`,
  );
  const hourlyTemp = data.hourly.temperature_2m.slice(
    updatedTime,
    updatedTime + 24,
  );
  const hourlyWeatherCode = data.hourly.weather_code.slice(
    updatedTime,
    updatedTime + 24,
  );

  const commonHourlyWeatherCode = hourlyTemp.map((item, index) => {
    const code = hourlyWeatherCode[index];
    return {
      temp: item,
      temp_icon: weatherInfo[code].icon,
    };
  });
  console.log(commonHourlyWeatherCode);

  const hourlyTimes = dailyTimes.slice(updatedTime, updatedTime + 24);

  const options = {
    chart: {
      type: "area",
      height: 250,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },

    responsive: [
      {
        breakpoint: 576,
        options: {
          chart: {
            height: 220,
          },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 250,
          },
        },
      },
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],

    series: [
      {
        data: hourlyTemp,
      },
    ],

    xaxis: {
      categories: hourlyTimes,
    },

    stroke: {
      curve: "smooth",
      width: 2,
    },

    colors: ["#FFC107"],

    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
      },
    },

    markers: {
      size: 0,
    },

    dataLabels: {
      enabled: true,
    },

    grid: {
      padding: {
        top: 25,
        left: 15,
      },
      show: false,
    },

    annotations: {
      points: commonHourlyWeatherCode.map((item, index) => ({
        x: hourlyTimes[index],
        y: item.temp + 0.1, // temperaturadan biroz tepaga chiqaradi
        marker: {
          size: 0,
        },
        label: {
          text: item.temp_icon,
          borderWidth: 0,
          style: {
            background: "transparent",
            color: "#000",
            fontSize: "20px",
          },
          offsetY: -10,
        },
      })),
    },

    tooltip: {
      custom: ({ dataPointIndex }) => {
        const weather = commonHourlyWeatherCode[dataPointIndex];

        return `
          <div class="weather__tooltip">
            <div class="mb-2 d-flex align-items-center justify-content-between gap-2">
              <div class="weather__tooltip-time">
                ${hourlyTimes[dataPointIndex]}
              </div>
              <div class="weather__tooltip-text">
                ${weatherInfo[hourlyWeatherCode[dataPointIndex]].text}
              </div>
            </div>

            <div class="d-flex align-items-center gap-2">
              <span class="weather__tooltip-icon">
                ${weather.temp_icon}
              </span>
              <span class="weather__tooltip-temp fw-bold">
                ${weather.temp}°C
              </span>
            </div>
          </div>
        `;
      },
    },

    yaxis: {
      show: false,
    },
  };

  document.querySelector("#chart").innerHTML = "";
  new ApexCharts(document.querySelector("#chart"), options).render();
};

let timer;
elFormInput.addEventListener("input", () => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    searchAddress(elFormInput.value.trim());
  }, 300);
});

const searchAddress = async function (country) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${country}&count=10`,
  );

  const data = await res.json();
  elSuggestionsList.innerHTML = "";

  if (country.length > 1) {
    elSuggestionsList.classList.remove("d-none");
    elSuggestionsList.classList.add("d-block");

    data.results?.forEach((city) => {
      elSuggestionsList.insertAdjacentHTML(
        "beforeend",
        `
        <li data-id=${city.id}>
        ${city.name}, ${city.admin1 ? city.admin1 + ", " : ""} ${city.country}
        </li>
        `,
      );
    });
  }
};

elSuggestionsList.addEventListener("click", function (evt) {
  if (evt.target.tagName === "LI") {
    const li = evt.target.closest("li");
    if (!li) return;
    const index = [...elSuggestionsList.querySelectorAll("li")].indexOf(li);
    elSuggestionsList.innerHTML = "";

    renderAddress(elFormInput.value, index);

    elFormInput.value = evt.target.textContent.trim();
  }
});
