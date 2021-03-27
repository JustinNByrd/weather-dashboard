// set global variables
var searchButtonEl = $("#searchIcon");
var resultsSection = $("#resultsSection");
var date = new Date();

// runs when user clicks on search
function getWeather() {
    // first api call to get basic current conditions and lat/lon of city
    var searchCity = $("#city").val();
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(searchCity)}&units=imperial&appid=bb2efb8b9d929b540e18d3c391b671c4`;
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            resultsSection.empty();
            var location = data.name;
            var shortDate = date.toLocaleDateString();

            var resultHeadingEl = $("<h2>");
            resultHeadingEl.html(`${location} (${shortDate}) <img src="" class="conditionsImg" id="currentConditionsImg">`);
            resultsSection.append(resultHeadingEl);
            // save img tag to variable to set the source later depending on 2nd api call
            currentConditionsImgEl = $("#currentConditionsImg");

            var resultTempEl = $("<p>");
            var currentTemp = data.main.temp;
            resultTempEl.html(`Temperature: ${Number.parseFloat(currentTemp).toPrecision(3)} &deg;F`);
            resultsSection.append(resultTempEl);

            var resultHumidityEl = $("<p>");
            resultHumidityEl.html(`${data.main.humidity}&percnt;`);
            resultsSection.append(resultHumidityEl);

            var resultWindEl = $("<p>");
            var resultWind = data.wind.speed;
            resultWindEl.text(`${Number.parseFloat(resultWind).toPrecision(2)} MPH`);
            resultsSection.append(resultWindEl);

            // second api call to get uv index, weather icon info and forecast data
            requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=bb2efb8b9d929b540e18d3c391b671c4`;
            fetch(requestUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    currentConditionsImgEl.attr("src", `./assets/weatherIcons/${data.current.weather[0].icon}.png`);

                    var uvClass;
                    if (data.current.uvi < 3)
                        uvClass = "green";
                    else if (data.current.uvi < 6)
                        uvClass = "yellow";
                    else
                        uvClass = "red";
                    var uvIndexHTML = `<p>UV Index: <span id="currentUVI" class="${uvClass}">${data.current.uvi}</span>`;
                    resultsSection.append(uvIndexHTML);

                    // add section container for forecast cards
                    var forecastSection = $("<section>");
                    forecastSection.attr("id", "forecastSection");
                    forecastSection.addClass("forecast");
                    resultsSection.append(forecastSection);

                    var forecastHeadingEl = $("<h2>");
                    forecastHeadingEl.text("5-Day Forecast");
                    forecastHeadingEl.addClass("block");
                    forecastSection.append(forecastHeadingEl);

                    // loop for 1 to 5 days in the future
                    for (var i = 1; i < 6; i++) {
                        var forecastDate = new Date();
                        forecastDate.setDate(date.getDate() + i);
                        var cardEl = $("<card>");
                        cardEl.addClass("forecastCard");
                        forecastSection.append(cardEl);

                        var cardHeadingEl = $("<h3>");
                        cardHeadingEl.text(forecastDate.toLocaleDateString());
                        cardEl.append(cardHeadingEl);

                        forecastImgEl = $("<img>");
                        forecastImgEl.attr("src", `./assets/weatherIcons/${data.daily[i].weather[0].icon}.png`);
                        forecastImgEl.addClass("conditionsImg");
                        cardEl.append(forecastImgEl);

                        var forecastTempEl = $("<p>");
                        forecastTempEl.html(`Temp: ${Number.parseFloat(data.daily[i].temp.day).toPrecision(3)}  &deg;F`);
                        cardEl.append(forecastTempEl);

                        var forecastHumidity = $("<p>");
                        forecastHumidity.html(`Humidity: ${Number.parseFloat(data.daily[i].humidity).toPrecision(2)}%`);
                        cardEl.append(forecastHumidity);
                    }
                });
        });
}

// set event listener to track user input
searchButtonEl.on('click', getWeather);