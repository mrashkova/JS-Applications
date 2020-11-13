const htmlSelectors = {
    'createBtn': () => document.querySelector('#create-form > button'),
    'firstNameInput': () => document.getElementById('firstName'),
    'lastNameInput': () => document.getElementById('lastName'),
    'facultyNumberInput': () => document.getElementById('facultyNumber'),
    'gradeInput': () => document.getElementById('grade'),
    'id': () => document.getElementById('id'),
    'errorContainer': () => document.getElementById('error-notification'),
    'studentsContainer': () => document.querySelector('table > tbody'),
}

htmlSelectors['createBtn']()
    .addEventListener('click', createStudent);

function fetchAllStudents() {
    fetch('https://students-exercise-cf0f7.firebaseio.com/Students/.json')
        .then(res => res.json())
        .then(renderStudents)
        .catch(handleError)
}

function renderStudents(studentsData) {
    const studentsContainer = htmlSelectors['studentsContainer']();

    if (studentsContainer.innerHTML != '') {
        studentsContainer.innerHTML = ''
    };

    Object
        .keys(studentsData)
        .sort((a, b) => a.id - b.id)
        .forEach(studentId => {
            const { id, firstName, lastName, facultyNumber, grade } = studentsData[studentId];
            
            // studentsData.sort((a, b) => a.id - b.id);
            const tableRow = createDOMElement('tr', '', {}, {},
                createDOMElement('td', id, {}, {}),
                createDOMElement('td', firstName, {}, {}),
                createDOMElement('td', lastName, {}, {}),
                createDOMElement('td', facultyNumber, {}, {}),
                createDOMElement('td', grade, {}, {}),
            );
            
            studentsContainer.appendChild(tableRow);
            
        })                
}

function createStudent(e) {
    e.preventDefault();

    const id = htmlSelectors['id']();
    const firstName = htmlSelectors['firstNameInput']();
    const lastName = htmlSelectors['lastNameInput']();
    const facultyNumber = htmlSelectors['facultyNumberInput']();
    const grade = htmlSelectors['gradeInput']();

    if (id.value !== '' || firstName.value !== '' && lastName.value !== '' && facultyNumber.value !== '' && grade.value !== '') {

        const initObj = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id.value, firstName: firstName.value, lastName: lastName.value, facultyNumber: facultyNumber.value, grade: grade.value })
        }

        fetch('https://students-exercise-cf0f7.firebaseio.com/Students.json', initObj)
            .then(fetchAllStudents)
            .catch(handleError);

        id.value = '';
        firstName.value = '';
        lastName.value = '';
        facultyNumber.value = '';
        grade.value = '';
    } else {
        const error = ({ message: '' });

        if (firstName.value === '') {
            error.message += 'You must fill the First Name field!';
        }
        if (lastName.value === '') {
            error.message += 'You must fill the Last Name field!';
        }
        if (facultyNumber.value === '') {
            error.message += 'You must fill the Faculty Number field!';
        }
        if (grade.value === '') {
            error.message += 'You must fill the Grade field!';
        }

        handleError(error);
    }


}

function handleError(err) {
    const errorContainer = htmlSelectors['errorContainer']();
    errorContainer.style.display = 'block';
    errorContainer.textContent = err.message;

    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);

}

function createDOMElement(type, text, attributes, events, ...children) {
    const domElement = document.createElement(type);

    if (text !== '') {
        domElement.textContent = text;
    }

    Object.entries(attributes)
        .forEach(([attrKey, attrValue]) => {
            domElement.setAttribute(attrKey, attrValue);
        });

    Object.entries(events)
        .forEach(([eventName, eventHandler]) => {
            domElement.addEventListener(eventName, eventHandler);
        });

    domElement.append(...children);
    // children.forEach((child) => domElement.appendChild(child));

    return domElement;
}
