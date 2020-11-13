const elements = {
    input: () => document.querySelector('input#towns'),
    button: () => document.querySelector('button#btnLoadTowns'),
    root: () => document.querySelector('div#root'),
}

elements.button().addEventListener('click', getInputInformation);

function getInputInformation(e) {
    e.preventDefault();

    const { value } = elements.input();
    const towns = value.split(/[, ]+/g).map((t) => { return { name: t } });
    appendTowns(towns);
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