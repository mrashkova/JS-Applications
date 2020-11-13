document.getElementById('register-btn')
    .addEventListener('click', registerUser);

document.getElementById('login-btn')
    .addEventListener('click', loginUser);

document.getElementById('logout-btn')
    .addEventListener('click', logout);


function registerUser(e) {
    e.preventDefault();

    const emailInput = document.querySelector('#register-form input[name="email"] ');
    const passwordInput = document.querySelector('#register-form input[name="psw"] ');

    if (emailInput.value != '' && passwordInput.value.length >= 6) {
        firebase.auth().createUserWithEmailAndPassword(emailInput.value, passwordInput.value)
            .then((data) => {
                console.log(data);
            })
            .catch(error => console.log(error))
    }
}

function loginUser(e) {
    e.preventDefault();

    const emailInput = document.querySelector('#login-form input[name="email"] ');
    const passwordInput = document.querySelector('#login-form input[name="psw"] ');

    firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value)
        .then(data => {
            console.log(data);
        })
        .catch(console.error)
}

function logout() {
    firebase.auth().signOut()
        .then((data) => {
            console.log(data);
        })
        .catch(console.error)
}