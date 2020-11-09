function attachEvents() {
    const addBtn = document.querySelector('#addForm button');
    const loadBtn = document.querySelector('aside button');
    const baseUrl = `https://fisher-game.firebaseio.com/catches.json`;
    const catchesDiv = document.getElementById('catches');

    addBtn.addEventListener('click', add);
    function add() {
        const [angler, weight, species, location, bait, captureTime] = document.querySelectorAll('#addForm input');

        const obj = JSON.stringify({
            angler: angler.value,
            weight: weight.value,
            species: species.value,
            location: location.value,
            bait: bait.value,
            captureTime: captureTime.value
        });

        fetch(baseUrl, {
            method: "POST",
            body: obj
        });
    }

    loadBtn.addEventListener('click', load);
    function load() {
        fetch(baseUrl)
            .then(res => res.json())
            .then(data => {
                Object.keys(data).forEach(key => appendCatch(key, data));
            });
    }

    function appendCatch(key, data) {
        const {angler, weight, species, location, bait, captureTime} = data[key];
        const catchDiv = createElements('div', 'catch', '');
        catchDiv.setAttribute('data-type', key);

        const anglerLabel = createElements('label', '', 'Angler')
        const anglerInput = createElements('input', 'angler', angler, 'text')

        const weightLabel = createElements('label', '', 'Weight')
        const weightInput = createElements('input', 'weight', weight, 'number')

        const speciesLabel = createElements('label', '', 'Species')
        const speciesInput = createElements('input', 'species', species, 'text')

        const locationLabel = createElements('label', '', 'Location')
        const locationInput = createElements('input', 'location', location, 'text')

        const baitLabel = createElements('label', '', 'Bait')
        const baitInput = createElements('input', 'bait', bait, 'text')

        const captureTimeLabel = createElements('label', '', 'Capture Time')
        const captureTimeInput = createElements('input', 'captureTime', captureTime, 'number')

        const createHrElements = (...types) => types.map(type => document.createElement(type))
        const hrEl = createHrElements('hr', 'hr', 'hr', 'hr', 'hr', 'hr')
        const [hr, hr1, hr2, hr3, hr4, hr5] = hrEl;

        const updateBtn = createElements('button', 'update', 'Update')
        const deleteBtn = createElements('button', 'delete', 'Delete')

        const deleteUrl = `https://fisher-game.firebaseio.com/catches/${key}.json`;

        deleteBtn.addEventListener('click', () => {
            fetch(deleteUrl, {method: "DELETE"})
        })

        updateBtn.addEventListener('click', () => {
            const obj = JSON.stringify({
                angler: anglerInput.value,
                weight: weightInput.value,
                species: speciesInput.value,
                location: locationInput.value,
                bait: baitInput.value,
                captureTime: captureTimeInput.value
            })

            const updateUrl = `https://fisher-game.firebaseio.com/catches/${key}.json`;

            fetch(updateUrl, {method: "PUT", body: obj});
        })

        const arrElements = [
            anglerLabel, anglerInput, hr, weightLabel,
            weightInput, hr1, speciesLabel, speciesInput,
            hr2, locationLabel, locationInput, hr3, baitLabel,
            baitInput, hr4, captureTimeLabel, captureTimeInput, hr5,
            updateBtn, deleteBtn
        ]
        append(arrElements, catchDiv);

        catchesDiv.appendChild(catchDiv);
    }

    function append(elements, target) {
        elements.map(el => target.appendChild(el));
    }

    function createElements (el, classes, content, type) {
        const element = document.createElement(el)

        if (el === 'input') {
            element.type = type;
            element.value = content;
        } else {
            element.innerHTML = content;
        }
        element.className = classes;
        element.innerHTML = content;

        return element;
    }
}

attachEvents();