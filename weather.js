const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const locationError = document.getElementById("locationError");
const getLocation = document.forms["getLocation"];
//getLocation.elements["location"].value = "Enter a city";

document.getElementById("getLocation").addEventListener("submit", (e) => {
  e.preventDefault();
});

document.getElementById("getLocation").addEventListener("keyup", (e) => {
  const keyPressed = e.key || e.keyCode || e.which;
  console.log(keyPressed);
  if (keyPressed === "Enter") {
    console.log("Enter pressed");
    //getWeatherDataForecast(getLocation.elements["location"].value);
    const citySchema = Joi.string()
      .regex(/^[a-zA-Z0-9 ]*$/)
      .max(30)
      .min(2)
      .label("City name");
    Joi.validate(
      getLocation.elements["location"].value,
      citySchema,
      (errors, val) => {
        errors
          ? (locationError.innerHTML =
              "A valid location has not been entered, please check and try again")
          : updateWeatherByCityName(getLocation.elements["location"].value);

        // errors.details[0].message
      }
    );
  }
});

navigator.geolocation.getCurrentPosition(
  (location) => {
    console.log(location.coords.latitude, location.coords.longitude);
    //getWeatherDataByCoords(location.coords.latitude, location.coords.longitude);
    updateWeatherByCoords(location.coords.latitude, location.coords.longitude);
  },
  (error) => {
    console.log(error);
  },
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
);

async function updateWeatherByCoords(latitude, longitude) {
  const currentResult = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
  );
  console.log(currentResult.data);
  refreshCurrentDisplay(currentResult.data);

  const forecastResult = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
  );
  console.log(forecastResult);
  const forecastData = processForecastResult(forecastResult);
  console.log(forecastData);
  refreshForecastDisplay(forecastData);
}

async function updateWeatherByCityName(cityName) {
  try {
    const currentResult = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
    );
    console.log(currentResult.data);
    refreshCurrentDisplay(currentResult.data);
  } catch (error) {
    if (error.message.includes("404")) {
      locationError.innerHTML =
        "A valid location has not been entered, please check and try again";
    }
  }
  const forecastResult = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
  );
  console.log(forecastResult);
  const forecastData = processForecastResult(forecastResult);
  console.log(forecastData);
  refreshForecastDisplay(forecastData);
}

//Why does await here cause problems?
function processForecastResult(forecastResult) {
  //API call will return a reading every 3 hours for next 5 days
  //Pick out the midday reading from each day
  const forecastData = [];
  const filteredData = [];
  for (let i = 0; i < forecastResult.data.list.length; i++) {
    if (forecastResult.data.list[i].dt_txt.includes("12:00:00")) {
      filteredData.push(forecastResult.data.list[i]);
    }
  }
  console.log(filteredData);

  for (let i = 0; i < filteredData.length; i++) {
    const date = new Date(filteredData[i].dt * 1000);
    const day = date.getDay();
    const iconCode = filteredData[i].weather[0].icon;
    const iconImage = axios.get(
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
    console.log(forecastData);

    //i += 8;
  }
  return forecastData;
  //const cityName = forecastResult.data.city.name;
  //console.log("forecast", forecastData, cityName);
  //updateWeatherForecast(forecastData, cityName);
}

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
//data.day
function refreshForecastDisplay(data) {
  console.log(data);
  let html = "";
  //html += `<p>${data.city.name}</p>`;
  html += `<div id =${"forecastContainer"}>`;
  data.forEach((data) => {
    html += `<div class=${"day"}> 
    <h4>${data.day}</h4>
    <img src=https://openweathermap.org/img/wn/${data.iconCode}@2x.png alt="">
    <p>${data.temp} &#8451</p>
</div>`;
  });
  // console.log(html);
  document.getElementById("forecast").innerHTML = html;
}

function refreshCurrentDisplay(data) {
  console.log(data);
  let html = `<h1>${data.name}</h1>`;
  html += `<h2>The temp is ${Math.round(data.main.temp - 273)} &#8451</h2>`;
  html += `<h2>description ${data.weather[0].description}</h2>
  <img src=https://openweathermap.org/img/wn/${
    data.weather[0].icon
  }@2x.png alt="">
  <h3> Feels like ${data.main.feels_like - 273}</h3>
  <h3>Humidity ${data.main.humidity}%</h3>
  <h3>Pressure ${data.main.pressure}hPa</h3>`;
  document.getElementById("content").innerHTML = html;
}
