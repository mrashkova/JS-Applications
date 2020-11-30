const userModel = firebase.auth();
const DB = firebase.firestore();

const app = Sammy('#root', function () {
    this.use('Handlebars', 'hbs');

    this.get('/home', function (context) {

        DB.collection('articles')
            .get()
            .then(response => {

                context.articles = response.docs.map((article) => { return { id: article.id, ...article.data() } })

                extendContext(context)
                    .then(function () {
                        this.partial('./templates/home.hbs');
                    });
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
        const { email, password } = context.params;

        if (email.length === 0 || password.length === 0) {
            return;
        };

        userModel.signInWithEmailAndPassword(email, password)
            .then((userData) => {
                saveUserData(userData);
                this.redirect('/home');
            })
            .catch(errorHandler);
    });


    this.get('/register', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/register.hbs');
            });
    });
    this.post('/register', function (context) {
        const { email, password, repeatPassword } = context.params;

        if (email.length === 0 || password.length === 0 || repeatPassword.length === 0) {
            return;
        };

        if (password.length < 6) {
            return;
        };

        if (password !== repeatPassword) {
            return;
        };

        userModel.createUserWithEmailAndPassword(email, password)
            .then((userData) => {
                this.redirect('/home');
            })
            .catch(errorHandler);
    });


    this.get('/logout', function (context) {
        userModel.signOut()
            .then(response => {
                clearUserData();
                this.redirect('#/login');
            })
            .catch(errorHandler);
    });

    this.get('/create', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/create.hbs');
            });
    });
    this.post('/create', function (context) {
        const { category, title, content } = context.params;

        if (category.length === 0 || title.length === 0 || content.length === 0) {
            return;
        }

        DB.collection('articles').add({
            category,
            title,
            content,
            creator: getUserData().uid,
        })
            .then(() => {
                this.redirect('#/home');
            })
            .catch(errorHandler);
    })

    this.get('/details/:articleId', function (context) {
        const { articleId } = context.params;

        DB.collection('articles')
            .doc(articleId)
            .get()
            .then(response => {
                const { uid } = getUserData();
                const actualOfferData = response.data();
                const imTheCreator = actualOfferData.creator === uid;

                context.article = { ...actualOfferData, imTheCreator, id: articleId };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/details.hbs');
                    });
            });
    });
    this.get('/delete/:articleId', function (context) {
        const { articleId } = context.params;
        DB.collection('articles')
            .doc(articleId)
            .delete()
            .then(() => {
                this.redirect('#/home');
            })
            .catch(errorHandler);
    });

    this.get('/edit/:articleId', function (context) {
        const { articleId } = context.params;

        DB.collection('articles')
            .doc(articleId)
            .get()
            .then(response => {
                context.article = { id: articleId, ...response.data() };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/edit.hbs');
                    });
            })
            .catch(errorHandler);
    });
    this.post('/edit/:articleId', function (context) {
        const { articleId, category, title, content } = context.params;

        DB.collection('articles')
            .doc(articleId)
            .get()
            .then(response => {
                return DB.collection('articles')
                    .doc(articleId)
                    .set({
                        ...response.data(),
                        category,
                        title,
                        content,
                    })
            })
            .then(response => {
                this.redirect(`#/home`)
            })
            .catch(errorHandler);
    })
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
