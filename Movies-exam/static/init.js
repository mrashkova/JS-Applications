function addEventListeners() {
    let navigationTemplate = Handlebars.compile(document.getElementById('navigation-template').innerHTML);
    let movieCartTemplate = Handlebars.compile(document.getElementById('movie-card-template').innerHTML);

    Handlebars.registerPartial('navigation-template', navigationTemplate);
    Handlebars.registerPartial('movie-card', movieCartTemplate);

    navigate(location.pathname == '/' ? 'home' : location.pathname.slice(1));

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

function navigateHandler(e) {
    e.preventDefault();

    // if (!e.target.classList.contains('nav-link')) {
    if (e.target.tagName != 'A') {
        return;
    }

    let url = new URL(e.target.href);

    navigate(url.pathname.slice(1));
}

function onLoginSubmit(e) {
    e.preventDefault();

    let formData = new FormData(document.forms['login-form']);

    let email = formData.get('email');
    let password = formData.get('password');

    if (email.length > 0 && password.length > 0) {
        authService.login(email, password)
        .then(data => {
            navigate('home');
            showNotification('Login successful.');
        });
    } else {
        showNotification('You must fill all fields.', 'error');
    }
    
}

function onRegisterSubmit(e) {
    e.preventDefault();

    let formData = new FormData(document.forms['register-form']);

    let email = formData.get('email');
    let password = formData.get('password');
    let repeatPassword = formData.get('repeatPassword');

    if (!email.length > 0 || !password.length > 0 || !repeatPassword.length > 0) {
        showNotification('You must fill all fields.', 'error');
    }

    if (password !== repeatPassword) {
        showNotification('The passwords do not match!', 'error');
    } 

    if (password.length < 6) {
        showNotification('The password must be at least 6 characters.', 'error');
    }

        authService.register(email, password, repeatPassword)
        .then(data => {
            navigate('home');
            showNotification('Successful registration!');
        });
}

function onAddMovieSubmit(e) {
    e.preventDefault();

    let formData = new FormData(document.forms['add-movie-form']);

    let title = formData.get('title');
    let description = formData.get('description');
    let imageUrl = formData.get('imageUrl');

    let { email } = authService.getData();

    movieService.add({
        creator: email,
        title,
        description,
        imageUrl,
    }).then(res => {
        navigate('home');
        showNotification('Created successfully!');
    })
}

function deleteMovie(e) {
    e.preventDefault();

    let id = e.target.dataset.id;

    movieService.deleteMovie(id)
        .then(res => {
            navigate('home');
        });
};

function onEditMovieSubmit(e, id) {
    e.preventDefault();

    let formData = new FormData(document.forms['edit-movie-form']);

    let title = formData.get('title');
    let description = formData.get('description');
    let imageUrl = formData.get('imageUrl');

    movieService.editMovie(id, {
        creator: email,
        title,
        description,
        imageUrl,
    }).then(res => {
        navigate(`details/${id}`);
        showNotification('Eddited successfully');
    })
}

function onMovieLike(e, movieId) {
    e.preventDefault();

    let { email } = authService.getData();

    movieService.likeMovie(movieId, email)
        .then(res => {
            navigate(`details/${movieId}`);
            showNotification('You liked a movie.');
        })
}

function onMovieSearchSubmit(e) {
    e.preventDefault();

    let formData = new FormData(document.forms['search-movie-form']);

    let searchText = formData.get('searchText');

    navigate(`home?search=${searchText}`)
}

addEventListeners();