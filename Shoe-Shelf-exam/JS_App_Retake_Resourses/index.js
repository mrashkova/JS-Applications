const userModel = firebase.auth();
const db = firebase.firestore();

const app = Sammy('#root', function () {

    this.use('Handlebars', 'hbs');

    this.get('/home', function (context) {
        db.collection('offers')
            .get()
            .then(response => {
                context.offers = [];
                response.forEach((offer) => {
                    context.offers.push({ id: offer.id, ...offer.data() });
                })
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/home.hbs');
                    });
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

    this.get('/logout', function (context) {
        userModel.signOut()
            .then(response => {
                clearUserData();
                this.redirect('/login');
            })
            .catch(errorHandler);
    })

    this.get('/create-offer', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/createOffer.hbs');
            });
    });
    this.post('/create-offer', function (context) {
        const { productName, price, imageUrl, description, brand } = context.params;

        if (productName.length === 0 || price.length === 0 || imageUrl.length === 0 || description.length === 0 || brand.length === 0) {
            return;
        }

        if (!Number(price)) {
            return;
        }

        db.collection('offers').add({
            productName,
            price,
            imageUrl,
            description,
            brand,
            salesman: getUserData().uid,
        })
            .then((createProduct) => {
                console.log(createProduct);
                this.redirect('/home');
            })
            .catch(errorHandler);
    });

    this.get('/edit-offer/:id', function (context) {
        extendContext(context)
            .then(function () {
                this.partial('./templates/editOffer.hbs');
            });
    });

    this.get('/details/:offerId', function (context) {
        const { offerId } = context.params;

        db.collection('offers')
            .doc(offerId)
            .get()
            .then(response => {
                const actualOfferData = response.data();
                const imTheSalesman = actualOfferData.salesman === getUserData().uid;

                context.offer = { ...actualOfferData, imTheSalesman };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/details.hbs');
                    });
            });
    });

});

(() => {
    app.run('/home');
})();

function extendContext(context) {

    let user = getUserData()
    context.isLoggedIn = Boolean(user);
    context.userEmail = user ? user.email : '';

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