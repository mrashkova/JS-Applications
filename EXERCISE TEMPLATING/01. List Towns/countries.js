const elements = {
    input: () => document.querySelector('input#towns'),
    button: () => document.querySelector('button#btnLoadTowns'),
    root: () => document.querySelector('div#root'),
}

const baseUrl = 'https://restcountries.eu/rest/v2/all';

elements.button().addEventListener('click', fetchCountries);

function fetchCountries(e) {
    e.preventDefault();

    fetch(baseUrl)
        .then(r => r.json())
        .then(appendTowns);
};

function appendTowns(towns) {
    getTemplate()
        .then((tmplateSource) => {
            const template = Handlebars.compile(tmplateSource);
            const htmlResult = template({ towns });
            elements.root().innerHTML = htmlResult;
        })
        .catch(e => console.error(e));
};

function getTemplate() {
    return fetch('./template.hbs').then(r => r.text());

};