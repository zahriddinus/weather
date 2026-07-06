"script";

const elUserAddress = document.querySelector(".main__address");
const elForm = document.querySelector(".form");
const elFormInput = document.querySelector(".form__input");
const elSuggestionsList = document.querySelector(".suggestions__list");

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

  renderAddress(elFormInput.value.trim());
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
    } = data.results[index ?? 0];

    const regionNameYes = regionName ? regionName + " / " : "";

    if (name.split(" ").length === 1) {
      elUserAddress.textContent = `${name.split(" ")[0]} / ${regionNameYes}${countryName}`;
    } else if (name.split(" ").length === 2) {
      elUserAddress.textContent = `${name.split(" ")[0]} ${name.split(" ")[1].slice(0, 3)} / ${regionNameYes}${countryName}`;
    } else if (name.split(" ").length === 3) {
      elUserAddress.textContent = `${name.split(" ")[0]} ${name.split(" ")[1].slice(0, 3)}. ${name.split(" ")[2].slice(0, 3)} / ${regionNameYes}${countryName}`;
    }

    renderDatas(latitude, longitude, name, regionName, countryName);
  } catch (err) {
    alert("Error fetching data. Please try again later.");
  }
};
renderAddress("mumbai");

const renderDatas = async function (
  latitude,
  longitude,
  name,
  regionName,
  countryName,
) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m,precipitation_probability&forecast_days=7&timezone=auto`,
  );
  const data = await res.json();
  const days = data.daily.time.map((date) =>
    new Date(date).toLocaleDateString("en-CA", {
      weekday: "long",
    }),
  );
  const today = new Date().toISOString().split("T")[0];
  const todayIndex = data.daily.time.indexOf(today);

  console.log(data);

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

    elFormInput.value = evt.target.textContent.trim();
    elSuggestionsList.innerHTML = "";
    console.log(evt.target.textContent.trim().split(",")[0]);

    renderAddress(
      evt.target.textContent.trim().split(",")[0].split(" ")[0],
      index,
    );
  }
});
