"script";

const renderCountry = async function (country) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${country}`,
  );
  const data = await response.json();
  const { latitude, longitude, name, country: countryName } = data.results[0];
  renderDatas(latitude, longitude, name, countryName);
};
renderCountry("tashkent");

const renderDatas = async function (latitude, longitude, name, countryName) {
  fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m&forecast_days=7&timezone=auto`,
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    });

  console.log(latitude, longitude, name, countryName);
};

//  https://www.gismeteo.ru/weather-tashkent-5331/

//   const weatherIcons = {
//   0: "☀️",
//   1: "🌤️",
//   2: "⛅",
//   3: "☁️",
//   45: "🌫️",
//   48: "🌫️",
//   51: "🌦️",
//   53: "🌦️",
//   55: "🌧️",
//   61: "🌧️",
//   63: "🌧️",
//   65: "🌧️",
//   71: "❄️",
//   73: "❄️",
//   75: "❄️",
//   80: "🌦️",
//   81: "🌧️",
//   82: "⛈️",
//   95: "⛈️",
//   96: "⛈️",
//   99: "⛈️",
// };
// const icon = weatherIcons[data.current.weather_code];
