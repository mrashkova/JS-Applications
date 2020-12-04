const userModel = firebase.auth();
const DB = firebase.firestore();

const app = Sammy('#root', function () {
    this.use('Handlebars', 'hbs');

    this.get('/home', function (context) {
        DB.collection('events').get()
            .then(data => {
                context.events = data.docs.map(event => {
                    return { id: event.id, ...event.data() }
                })
                    .sort((a, b) => b.peopleInterested - a.peopleInterested);

                extendContext(context).then(function () {
                    this.partial('./templates/home.hbs');
                });
            }).catch(error => notify.showError(error.message));
    });

    this.get('/register', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/register.hbs');
            });
    });
    this.post('/register', function (context) {
        const { username, password, rePassword } = context.params;

        if (username.length < 3) {
            notify.showError('The username should be at least 3 characters long.')
            return;
        }

        if (password.length < 6) {
            notify.showError('The password should be at least 6 characters long.')
            return;
        };

        if (password !== rePassword) {
            notify.showError('Passwords do not match.')
            return;
        };

        userModel.createUserWithEmailAndPassword(username + '@abv.bg', password)
            .then((userData) => {
                saveUserData(userData);
                notify.showSuccess('User registration successful.');
                this.redirect('#/home');
            })
            .catch(errorHandler);
    });

    this.get('/login', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/login.hbs');
            });
    });
    this.post('/login', function (context) {
        const { username, password } = context.params;

        if (username.length === 0 || password.length === 0) {
            notify.showError('You must fill all fields.')
            return;
        };

        userModel.signInWithEmailAndPassword(username + '@abv.bg', password)
            .then((userData) => {
                saveUserData(userData);
                notify.showSuccess('Login successful.');
                this.redirect('#/home');
            })
            .catch(errorHandler);
    });

    this.get('/logout', function (context) {
        userModel.signOut()
            .then(response => {
                clearUserData();
                notify.showError('Logout successful.');
                this.redirect('#/login');
            })
            .catch(errorHandler);
    });

    this.get('/organize', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/organize.hbs');
            });
    });
    this.post('/organize', function (context) {

        const { name, dateTime, description, imageURL } = context.params;

        if (name.length < 6) {
            notify.showError('The event name should be at least 6 characters long.')
            return;
        }

        if (dateTime.length < 2) {
            notify.showError('The date should be in string format (24 February; 24 March - 10 PM;).')
            return;
        }

        if (description.length < 10) {
            notify.showError('The description should be at least 10 characters long.')
            return;
        }

        if (!(imageURL.startsWith('http://') || imageURL.startsWith('https://'))) {
            notify.showError('The image should start with "http://" or "https://".');
            return;
        }

        DB.collection('events').add({
            name,
            dateTime,
            description,
            imageURL,
            organizer: getUserData().username,
            peopleInterested: 0,
        })
            .then(() => {
                notify.showSuccess('Event created successfully.');
                this.redirect('#/home');
            })
            .catch(errorHandler);
    });

    this.get('/details/:eventId', function (context) {
        const { eventId } = context.params;

        DB.collection('events')
            .doc(eventId)
            .get()
            .then(response => {
                const { username } = getUserData();
                const actualEventData = response.data();
                const imTheOrganizer = actualEventData.organizer === username;

                context.event = { ...actualEventData, imTheOrganizer, id: eventId };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/details.hbs');
                    });
            });
    });

    this.get('/edit/:eventId', function (context) {
        const { eventId } = context.params;

        DB.collection('events')
            .doc(eventId)
            .get()
            .then(response => {
                context.event = { id: eventId, ...response.data() };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/edit.hbs');
                    });
            })
            .catch(errorHandler);
    });
    this.post('/edit/:eventId', function (context) {
        const { eventId, name, dateTime, description, imageURL } = context.params;

        DB.collection('events')
            .doc(eventId)
            .get()
            .then(response => {
                return DB.collection('events')
                    .doc(eventId)
                    .set({
                        ...response.data(),
                        name,
                        dateTime,
                        description,
                        imageURL,
                    })
            })
            .then(response => {
                notify.showSuccess('Event edited successfully.');
                this.redirect('#/home')
            })
            .catch(errorHandler);
    });

    this.get('/close/:eventId', function (context) {
        const { eventId } = context.params;
        DB.collection('events')
            .doc(eventId)
            .delete()
            .then(() => {
                notify.showSuccess('Event closed successfully.');
                this.redirect('#/home');
            })
            .catch(errorHandler);
    });

    this.get('/join/:eventId', function (context) {
        const { eventId } = context.params;

        DB.collection('events')
            .doc(eventId)
            .get()
            .then(event => {
                const joined = {
                    ...event.data(),
                    peopleInterested: event.data().peopleInterested + 1,
                }
                notify.showSuccess('You join the event successfully.');
                return DB.collection('events')
                    .doc(eventId)
                    .set(joined);
            }).then(() => this.redirect('#/home'))
            .catch(error => notify.showError(error.message));
    });

    this.get('/username', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/username.hbs');
            });
    });

});

(() => {
    app.run('#/home');
})();

function extendContext(context) {

    let user = getUserData()
    context.isLoggedIn = Boolean(user);
    context.userUsername = user ? user.username : '';

    return context.loadPartials({
        'header': './partials/header.hbs',
        'footer': './partials/footer.hbs',
    });
}

function errorHandler(error) {
    notify.showError(error.message)
}

function saveUserData(data) {
    const { user: { username, uid } } = data;
    localStorage.setItem('user', JSON.stringify({ username, uid }))
}

function getUserData() {
    let user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function clearUserData() {
    this.localStorage.removeItem('user');
}
