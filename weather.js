const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getLocation = document.forms["getLocation"];
getLocation.elements["location"].value = "Enter a city";

document.getElementById("getLocation").addEventListener("submit", (e) => {
  e.preventDefault();
});

document.getElementById("getLocation").addEventListener("keyup", (e) => {
  const keyPressed = e.key || e.keyCode || e.which;
  console.log(keyPressed);
  if (keyPressed === "Enter") {
    console.log("Enter pressed");
    getWeatherDataForecast(getLocation.elements["location"].value);
  }
});

navigator.geolocation.getCurrentPosition(
  (location) => {
    console.log(location.coords.latitude, location.coords.longitude);
    getWeatherDataByCoords(location.coords.latitude, location.coords.longitude);
  },
  (error) => {
    console.log(error);
  },
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
);

async function getWeatherDataByCoords(latitude, longitude) {
  const currentResult = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
  );
  console.log(currentResult.data);
  updateCurrentData(currentResult.data, latitude, longitude);

  const forecastResult = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
  );
  console.log(forecastResult);

  //API call will return a reading every 3 hours for next 5 days
  //Pick out the midday reading from each day
  const forecastData = [];
  const filteredData = [];
  for (let i = 0; i < forecastResult.data.list.length; i++) {
    if (forecastResult.data.list[i].dt_txt.includes("12:00:00")) {
      filteredData.push(forecastResult.data.list[i]);
    }
  }

  for (let i = 0; i < filteredData.length; i++) {
    const date = new Date(filteredData[i].dt * 1000);
    const day = date.getDay();
    const iconCode = filteredData[i].weather[0].icon;
    const iconImage = await axios.get(
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    );
    // document.getElementById(
    //   "icon"
    // ).src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    forecastData.push({
      temp: Math.round(filteredData[i].main.temp - 273),
      day: days[day],
      iconCode: iconCode,
    });
    //i += 8;
  }
  const cityName = forecastResult.data.city.name;
  console.log("forecast", forecastData, cityName);
  updateWeatherForecast(forecastData, cityName);
}

//async function getWeatherData(latitude, longitude) {
// const result = await axios.get(
//    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
// );
//  updateInterface(result.data, latitude, longitude);
//}

async function getWeatherDataForecast(cityName) {
  const forecastResult = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
  );

  const forecastData = [];
  for (let i = 0; i < forecastResult.data.list.length; ) {
    const date = new Date(forecastResult.data.list[i].dt * 1000);
    const day = date.getDay();
    const iconCode = forecastResult.data.list[i].weather[0].icon;
    const iconImage = await axios.get(
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    );
    // document.getElementById(
    //   "icon"
    // ).src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    forecastData.push({
      temp: Math.round(forecastResult.data.list[i].main.temp - 273),
      day: days[day],
      iconCode: iconCode,
    });
    i += 8;
  }
  updateWeatherForecast(forecastData, cityName);
}

//getWeatherDataForecast();

function updateWeatherForecast(data, cityName) {
  let html = "";
  html += `<p>${cityName}</p>`;
  html += `<div id =${"forecastContainer"}>`;
  data.forEach((data) => {
    html += `<div id=${data.day}>
    <h4>${data.day}</h4>
    <img src=https://openweathermap.org/img/wn/${data.iconCode}@2x.png alt="">
    <p>${data.temp}</p>
</div>`;
  });
  // console.log(html);
  document.getElementById("forecast").innerHTML = html;
}

function updateCurrentData(data, latitude, longitude) {
  let html = `<h2>The temp is ${Math.round(data.main.temp - 273)}c</h2>`;
  html += `<h2>description ${data.weather[0].description}</h2>
  <img src=https://openweathermap.org/img/wn/${
    data.weather[0].icon
  }@2x.png alt="">
  <h3> Feels like ${data.main.feels_like - 273}</h3>
  <h3>Humidity ${data.main.humidity}%</h3>
  <h3>Pressure ${data.main.pressure}hPa</h3>`;
  document.getElementById("content").innerHTML = html;
}
