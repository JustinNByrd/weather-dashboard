// set global variables
var searchButtonEl = $("#searchIcon");
var resultsSection = $("#resultsSection");

// ran when user clicks on search
function getWeather()
    {
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
            });
    }

// set event listener to track user input
searchButtonEl.on('click', getWeather);