const userModel = firebase.auth();
const DB = firebase.firestore();

const app = Sammy('#container', function () {
    this.use('Handlebars', 'hbs');

    this.get('/home', function (context) {
        DB.collection('movies')
            .get()
            .then(response => {
                context.movies = response.docs.map((movie) => { return { id: movie.id, ...movie.data() } })

                extendContext(context)
                    .then(function () {
                        this.partial('./templates/home.hbs');
                    });
            })

    });

    this.get('/login', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/login.hbs');
            });
    });
    this.post('/login', function (context) {
        const { email, password } = context.params;

        if (email.length === 0 || password.length === 0) {
            showNotification('You must fill all fields.', 'error');
            return;
        };

        userModel.signInWithEmailAndPassword(email, password)
            .then((userData) => {
                saveUserData(userData);
                this.redirect('/home');
                showNotification('Login successful.');

            })
            // .then(() => {
            // })
            .catch(errorHandler);
    })

    this.get('/register', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/register.hbs');
            });
    });
    this.post('/register', function (context) {
        const { email, password, repeatPassword } = context.params;

        if (email.length === 0 || password.length === 0 || repeatPassword.length === 0) {
            showNotification('You must fill all fields.', 'error');
            return;
        };

        if (password.length < 6) {
            showNotification('The password must be at least 6 characters long.', 'error');
            return;
        };

        if (password !== repeatPassword) {
            showNotification('The passwords do not match!', 'error');
            return;
        };

        userModel.createUserWithEmailAndPassword(email, password)
            .then((userData) => {
                this.redirect('/home');
                showNotification('Successful registration!');
            })
            .catch(errorHandler);
    });

    this.get('/logout', function (context) {
        userModel.signOut()
            .then(response => {
                clearUserData();
                this.redirect('#/login');
            })
            .then(() => {
                showNotification('Successful logout');
            })
            .catch(errorHandler);
    });

    this.get('/add-movie', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/add-movie.hbs');
            });
    });
    this.post('/add-movie', function (context) {
        const { title, description, imageUrl } = context.params;

        if (title.length === 0 || description.length === 0 || imageUrl.length === 0) {
            showNotification('Invalid inputs!', 'error');
            return;
        }

        DB.collection('movies').add({
            title,
            description,
            imageUrl,
            creator: getUserData().uid,
            likes: [],
        })
            .then((createMovie) => {
                this.redirect('#/home');
            })
            .then(() => {
                showNotification('Created successfully!');
            })
            .catch(errorHandler);
    })

    this.get('/details/:movieId', function (context) {
        const { movieId } = context.params;

        DB.collection('movies')
            .doc(movieId)
            .get()
            .then(response => {
                const { uid } = getUserData();
                const actualMovieData = response.data();
                const imTheCreator = actualMovieData.creator === uid;

                const userIndex = actualMovieData.likes.indexOf(uid);
                const imInTheLikesList = userIndex > -1;

                context.movie = { ...actualMovieData, imTheCreator, id: movieId, imInTheLikesList };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/details.hbs');
                    });
            });
    });

    this.get('/delete/:movieId', function (context) {
        const { movieId } = context.params;
        DB.collection('movies')
            .doc(movieId)
            .delete()
            .then(() => {
                this.redirect('#/home');
                showNotification('Deleted successfully');
            })
            .catch(errorHandler);
    })
    this.get('/edit/:movieId', function (context) {
        const { movieId } = context.params;

        DB.collection('movies')
            .doc(movieId)
            .get()
            .then(response => {
                context.movie = { id: movieId, ...response.data() };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/edit-movie.hbs');
                    });
            })
            .catch(errorHandler);
    });
    this.post('/edit/:movieId', function (context) {
        const { movieId, title, description, imageUrl } = context.params;

        DB.collection('movies')
            .doc(movieId)
            .get()
            .then(response => {
                return DB.collection('movies')
                    .doc(movieId)
                    .set({
                        ...response.data(),
                        title,
                        description,
                        imageUrl,
                    })
            })
            .then(response => {
                this.redirect(`#/details/${movieId}`);
            })
            .then(() => {
                showNotification('Eddited successfully');
            })
            .catch(errorHandler);
    })

    this.get('/like/:movieId', function (context) {
        const { movieId } = context.params;
        const { uid } = getUserData();

        DB.collection('movies')
            .doc(movieId)
            .get()
            .then(response => {
                const movieData = { ...response.data() };
                movieData.likes.push(uid)

                return DB.collection('movies')
                    .doc(movieId)
                    .set(movieData);
            })
            .then(() => {
                this.redirect(`#/details/${movieId}`);
            })
            .then(() => {
                showNotification('Liked successfully');
            })
            .catch(errorHandler);
    });
});

(() => {
    app.run('#/home');
})();

function extendContext(context) {

    let user = getUserData()
    context.isLoggedIn = Boolean(user);
    context.userEmail = user ? user.email : '';
    // context.areThereMovies = Boolean(movie);

    return context.loadPartials({
        'header': './partials/header.hbs',
        'notification': './partials/notification.hbs',
        'footer': './partials/footer.hbs',
    });
}

function errorHandler(error) {
    console.log(error);
}

function saveUserData(data) {
    const { user: { email, uid } } = data;
    localStorage.setItem('user', JSON.stringify({ email, uid }))
}

function getUserData() {
    let user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function clearUserData() {
    this.localStorage.removeItem('user');
}

function showNotification(message, type) {
    let notificationElement;

    switch (type) {
        case 'error':
            notificationElement = document.getElementById('errorBoxSection');
            break;
        default:
            notificationElement = document.getElementById('seccessBoxSection');
            break;
    };
    notificationElement.lastElementChild.innerText = message;
    notificationElement.style.display = 'block';

    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 1000);
}