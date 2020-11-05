function attachEvents() {
    let weatherBtn = document.getElementById('submit');
    let locationName = document.getElementById('location');
    let currentDiv = document.getElementById('current');
    let upcomingDiv = document.getElementById('upcoming');
    let forecastParentDiv = document.getElementById('forecast');

    const locationsURL = 'https://judgetests.firebaseio.com/locations.json';
    const baseURL = 'https://judgetests.firebaseio.com/forecast/';

    const symbols = {
        "Sunny"	: "&#x2600", // ☀
        "Partly sunny": "&#x26C5", // ⛅
        "Overcast":	"&#x2601", // ☁
        "Rain":	"&#x2614", // ☂
        "degrees": "&#176",   // °
    }

    weatherBtn.addEventListener('click', () => {
        fetch(locationsURL)
            .then(response => response.json())
            .then(data => {
                let {code} = data.find((city) => city.name === locationName.value);

                //fetch today
                let current = fetch(baseURL + `today/${code}.json`)
                                    .then(response => response.json())
                                    // .then(d => console.log(d))

                //fetch upcoming
                let upcoming = fetch(baseURL + `upcoming/${code}.json`)
                                    .then(response => response.json())
                                    // .then(d => console.log(d))

                Promise.all([current, upcoming])
                    .then(showForecast)
                    .catch(e => console.log(e));

            })
    });


    function createElement (ele, classes, content) {
        let element = document.createElement(ele);
        element.className = classes;
        element.innerHTML = content;

        return element;
    }

    function showForecast([currentData, upcomingData]) {   
        forecastParentDiv.style.display = 'block';

        showCurrent(currentData);
        showUpcoming(upcomingData);
    }

    function showCurrent(currentData) {
        let forecastDiv = createElement('div', 'forecasts', '');

        let currentSymbol = symbols[currentData.forecast.condition];
        let conditionSymbolSpan = createElement('span', 'condition symbol', currentSymbol);
        
        let conditionInfoSpan = createElement('span', 'condition', '');

        let forecastCitySpan = createElement('span', 'forecast-data', currentData.name);

        let highLow = `${currentData.forecast.low}${symbols.degrees}/${currentData.forecast.high}${symbols.degrees}`;
        let forecastInfoSpan = createElement('span', 'forecast-data', highLow);

        let forecastConditionSpan = createElement('span', 'forecast-data', currentData.forecast.condition);

        forecastDiv.appendChild(conditionSymbolSpan);
        currentDiv.appendChild(forecastDiv);

        conditionInfoSpan.appendChild(forecastCitySpan)
        conditionInfoSpan.appendChild(forecastInfoSpan)
        conditionInfoSpan.appendChild(forecastConditionSpan)

        forecastDiv.appendChild(conditionInfoSpan);
    }

    function showUpcoming(upcomingData) {
        let forecastInfo = createElement('div', 'forecast-info', '');

        upcomingData.forecast.forEach(obj => {
            let upcomingSpan = createElement('span', 'upcoming', '');
            let conditionSymbolSpan = createElement('span', 'symbol', symbols[obj.condition]);

            let highLow = `${obj.low}${symbols.degrees}/${obj.high}${symbols.degrees}`;
            let forecastInfoSpan = createElement('span', 'forecast-data', highLow);

            let forecastConditionSpan = createElement('span', 'forecast-data', obj.condition);

            upcomingSpan.appendChild(conditionSymbolSpan);
            upcomingSpan.appendChild(forecastInfoSpan);
            upcomingSpan.appendChild(forecastConditionSpan);
            forecastInfo.appendChild(upcomingSpan);

        });
        upcomingDiv.appendChild(forecastInfo)
    }
}

attachEvents();