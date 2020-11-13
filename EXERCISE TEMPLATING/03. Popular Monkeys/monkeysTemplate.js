import monkeys from './monkeys.js';

const elements = {
    allMonkeys: () => document.querySelector('div.monkeys')
}

fetch('./monkeys.hbs')
    .then(r => r.text())
    .then(monkeyTemplateSrc => {
        let monkeyTemplate = Handlebars.compile(monkeyTemplateSrc);
        const resultHtml = monkeyTemplate({ monkeys });

        elements.allMonkeys().innerHTML = resultHtml;
        atachEventListener();
    })
    .catch(e => console.error(e))

function atachEventListener() {
    elements.allMonkeys().addEventListener('click', e => {
        const { target } = e;

        if (target.nodeName !== 'BUTTON' || target.textContent !== 'Info') {
            return;
        }

        const p = target.parentNode.querySelector('p');

        if (p.style.display === 'none' || !p.style.display) {
            p.style.display = 'block';
        } else {
            p.style.display = 'none';
        }
    })
}