// set global variables
var searchButtonEl = $("#searchIcon");
var resultsSection = $("#resultsSection");

// runs when user clicks on search
function getWeather()
    {
        // first api call to get basic current conditions and lat/lon of city
        var searchCity = $("#city").val();
        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(searchCity)}&units=imperial&appid=bb2efb8b9d929b540e18d3c391b671c4`;
        fetch(requestUrl)
            .then(function (response) {
                return response.json();
            })
            .then(function(data) {
                resultsSection.empty();
                var location = data.name;
                var d = new Date();
                var shortDate = d.toLocaleDateString();

                var resultHeadingEl = $("<h2>");
                resultHeadingEl.text(`${location} (${shortDate})`);
                resultsSection.append(resultHeadingEl);

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
                    .then(function(data) {
                        var uvClass;
                        if (data.current.uvi < 3)
                            uvClass = "green";
                        else if (data.current.uvi < 6)
                            uvClass = "yellow";
                        else
                            uvClass = "red";
                        var uvIndexHTML = `<p>UV Index: <span id="currentUVI" class="${uvClass}">${data.current.uvi}</span>`;
                        resultsSection.append(uvIndexHTML);
                    });
            });
    }

// set event listener to track user input
searchButtonEl.on('click', getWeather);