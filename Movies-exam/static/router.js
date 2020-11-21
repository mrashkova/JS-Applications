const routes = {
    'home': 'home-template',
    'login': 'login-form-template',
    'register': 'register-form-template',
    'add-movie': 'add-movie-template',
    'details': 'movie-details-template',
    'edit-movie': 'edit-movie-template',
}

const router = async (url) => {
    let [fullPath, queryString] = url.split('?');
    let [path, id, param] = fullPath.split('/');
    let app = document.getElementById('app');
    let templateData = authService.getData();

    let templateId = routes[path];

    switch (path) {
        case 'home':
            let searchText = queryString?.split('=')[1];
            templateData.movies = await movieService.getAll(searchText);
            break;
        case 'logout':
            authService.logout();
            return navigate('home');
        case 'details':
            let movieDetails = await movieService.getOne(id);
            Object.assign(templateData, movieDetails, { id });

            if (param == 'edit') {
                templateId = 'edit-movie-template';
            }
            break;
        default:
            break;
    }

    let template = Handlebars.compile(document.getElementById(templateId).innerHTML);

    app.innerHTML = template(templateData);
}

const navigate = (path) => {
    history.pushState({}, '', '/' + path);

    router(path);
}