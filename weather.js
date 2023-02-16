//array needed to convert number of day in API response to a word
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// create dom references to be used later
const locationErrorDomRef = document.getElementById("locationError");
const currentDomRef = document.getElementById("current");
const forecastDomRef = document.getElementById("forecast");
const userLocationDomRef = document.forms["getLocation"];

//Initially show loading as there is delay in fetching weather data when page loads
currentDomRef.innerHTML = "<h3>Loading weather data...</h3>";

//prevent form submission upon user pressing enter
userLocationDomRef.addEventListener("submit", (e) => {
  e.preventDefault();
});

//event listener to handle Enter key being pressed
userLocationDomRef.addEventListener("keyup", (e) => {
  const keyPressed = e.key || e.keyCode || e.which;

  if (keyPressed === "Enter") {
    locationErrorDomRef.innerHTML = ""; //Need to clear a previous error

    //This Joi Schema allows alphanumeric and spaces only
    const citySchema = Joi.string()
      .regex(/^[a-zA-Z0-9 ]*$/)
      .max(30)
      .min(2)
      .label("City name");
    Joi.validate(
      userLocationDomRef.elements["location"].value,
      citySchema,
      (errors, val) => {
        errors
          ? (locationErrorDomRef.innerHTML =
              "A valid location has not been entered, please check and try again")
          : updateWeatherByCityName(
              //only update weather if input is valid
              userLocationDomRef.elements["location"].value
            );
      }
    );
  }
});

//Get coordinates of current location for user and display weather using these cordinates upon page load
navigator.geolocation.getCurrentPosition(
  (location) => {
    updateWeatherByCoords(location.coords.latitude, location.coords.longitude);
  },
  (error) => {
    console.log(error);
  },
  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
);

//Function to update weather using coordinates, asynchronous due delay in receiving response to API call
async function updateWeatherByCoords(latitude, longitude) {
  const currentResult = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
  );

  refreshCurrentDisplay(currentResult.data); //Call function that will update DOM

  const forecastResult = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
  );
  const forecastData = processForecastResult(forecastResult); //Call function to process data received from API call

  refreshForecastDisplay(forecastData);
}

//Function updates weather using city name
async function updateWeatherByCityName(cityName) {
  try {
    const currentResult = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
    );

    refreshCurrentDisplay(currentResult.data);
    const forecastResult = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=fcfa657b215adff2f15f5b0cbcaeea45`
    );

    const forecastData = processForecastResult(forecastResult);
    refreshForecastDisplay(forecastData);
  } catch (error) {
    if (error.message.includes("404")) {
      //404 error response means that user has enetered an incorrect location
      locationErrorDomRef.innerHTML =
        "A valid location has not been entered, please check and try again";
    }
  }
}

//Why does await here cause problems?
//Function to process the forecast data that is returned for the next 5 days
function processForecastResult(forecastResult) {
  //API call will return a reading every 3 hours for next 5 days

  const forecastData = [];
  const filteredData = [];
  //Pick out the midday reading from each day
  for (let i = 0; i < forecastResult.data.list.length; i++) {
    if (forecastResult.data.list[i].dt_txt.includes("12:00:00")) {
      filteredData.push(forecastResult.data.list[i]);
    }
  }

  //Now pick out relevant parts of each midday reading and construct array of forecast data
  for (let i = 0; i < filteredData.length; i++) {
    const date = new Date(filteredData[i].dt * 1000);
    const day = date.getDay();
    const iconCode = filteredData[i].weather[0].icon;
    const iconImage = axios.get(
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    );
    forecastData.push({
      temp: Math.round(filteredData[i].main.temp - 273),
      day: days[day],
      iconCode: iconCode,
    });
  }
  return forecastData;
}

//Function refreshes current weather area of DOM
function refreshCurrentDisplay(data) {
  let html = `<h2>${data.name} 's current weather </h2>`;
  html += `<h3>${Math.round(data.main.temp - 273)} &#8451</h3>`; //8451 is decimal code for degrees symbol
  html += `<h3>${data.weather[0].description}</h3>
  <img src=https://openweathermap.org/img/wn/${
    data.weather[0].icon
  }@2x.png alt="">
  <h4> Feels like ${Math.round(data.main.feels_like - 273)} &#8451</h4>
  <h4>Humidity ${data.main.humidity}%</h4>
  <h4>Pressure ${data.main.pressure}hPa</h4>`;
  currentDomRef.innerHTML = html;
}

//Function refreshes forecast weather area of DOM
function refreshForecastDisplay(data) {
  let html = "<h3> 5 day forecast</h3>";
  html += `<div id =forecastContainer class=forecastContainer>`;
  data.forEach((data) => {
    html += `<div class=${"day"}> 
    <h4>${data.day}</h4>
    <img src=https://openweathermap.org/img/wn/${data.iconCode}@2x.png alt="">
    <p>${data.temp} &#8451</p>
</div>`;
  });
  forecastDomRef.innerHTML = html;
}
