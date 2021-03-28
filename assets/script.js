// set global variables
const maxPreviousSearches = 9;
var searchButtonEl = $("#searchIcon");
var resultsSection = $("#resultsSection");
var previousSearchSectionEl = $("#previousSearches");
var date = new Date();
var previousSearches = [];

// check localStorage for previous searches
if (localStorage.getItem("weather-previous-searches")) {
    previousSearches = JSON.parse(localStorage.getItem("weather-previous-searches"));
    // call function to display the searches
    displayPreviousSearches();
}

// called from getWeather() on successful api call to add search to previousSearches
function addPreviousSearch(searchTerm) {
    // capitalize the first letter of each word in search
    searchTerm = capFirstLetter(searchTerm);
    // check to see if search is already in search results
    if (previousSearches.includes(searchTerm)) {
        // move search to beging of array
        for (var i = 0; i < previousSearches.length; i++) {
            if (previousSearches[i] == searchTerm)
                previousSearches.splice(i, 1);
        }
        previousSearches.unshift(searchTerm);
    }
    else {
        // add search term to beginning of array and only keep a max of maxPreviousSearches
        if (previousSearches.unshift(searchTerm) > maxPreviousSearches)
            previousSearches.pop();
    }
    // store updated array to localStorage
    localStorage.setItem("weather-previous-searches", JSON.stringify(previousSearches));
    displayPreviousSearches();
}

function displayPreviousSearches() {
    previousSearchSectionEl.empty();
    // loop through array and add to previousSearches section
    for (var i = 0; i < previousSearches.length; i++) {
        var previousSearchCard = $("<card>");
        previousSearchCard.html(previousSearches[i]);
        previousSearchCard.addClass("previousSearch clickable");
        previousSearchCard.attr("data-search-term", previousSearches[i]);
        previousSearchSectionEl.append(previousSearchCard);
    }
    // add clear history option
    var clearHistoryEl = $("<card>");
    clearHistoryEl.text("Clear History");
    clearHistoryEl.addClass("previousSearch clickable");
    clearHistoryEl.attr("data-search-term", "clearHistory");
    previousSearchSectionEl.append(clearHistoryEl);
}

// runs when user clicks on the search button or a previous search
function getWeather(searchTerm) {
    if (typeof searchTerm != "object")
        var searchCity = searchTerm;
    else
        var searchCity = $("#city").val();

    // first api call to get basic current conditions and lat/lon of city
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(searchCity)}&units=imperial&appid=bb2efb8b9d929b540e18d3c391b671c4`;
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            resultsSection.empty();

            // if location not found, set message and end function
            if (data.cod == 404) {
                resultsSection.html(`<h2>OOPS! Sorry, but "${searchCity}" could not be found.  Please try another search.`);
                return;
            }

            var location = data.name;

            // add to previous searches
            addPreviousSearch(searchCity);

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
            resultHumidityEl.html(`Humidity: ${data.main.humidity}&percnt;`);
            resultsSection.append(resultHumidityEl);

            var resultWindEl = $("<p>");
            var resultWind = data.wind.speed;
            resultWindEl.text(`Wind Speed: ${Number.parseFloat(resultWind).toPrecision(2)} MPH`);
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

function capFirstLetter(strText) {
    var arrText = strText.split(" ");
    for (var i = 0; i < arrText.length; i++) {
        var arrWord = arrText[i].split("");
        arrWord[0] = arrWord[0].toUpperCase();
        arrText[i] = arrWord.join("");
    }
    return arrText.join(" ");
}

// set event listener to track user input
searchButtonEl.on('click', getWeather);

// set event listener on previous searches
$(previousSearchSectionEl).on('click', '.previousSearch', function (event) {
    if (event.target.dataset.searchTerm == "clearHistory") {
        localStorage.clear();
        previousSearchSectionEl.empty();
        previousSearches = [];
    }
    else
        getWeather(event.target.dataset.searchTerm);
});