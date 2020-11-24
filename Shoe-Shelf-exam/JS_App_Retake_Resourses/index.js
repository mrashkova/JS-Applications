const userModel = firebase.auth();
const DB = firebase.firestore();

const app = Sammy('#root', function () {

    this.use('Handlebars', 'hbs');

    this.get('/home', function (context) {
        DB.collection('offers')
            .get()
            .then(response => {
                context.offers = response.docs.map((offer) => { return { id: offer.id, ...offer.data() } })

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
                this.redirect('#/login');
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

        DB.collection('offers').add({
            productName,
            price,
            imageUrl,
            description,
            brand,
            salesman: getUserData().uid,
            clients: []
        })
            .then((createProduct) => {
                console.log(createProduct);
                this.redirect('#/home');
            })
            .catch(errorHandler);
    });

    this.get('/details/:offerId', function (context) {
        const { offerId } = context.params;

        DB.collection('offers')
            .doc(offerId)
            .get()
            .then(response => {
                const { uid } = getUserData();
                const actualOfferData = response.data();
                const imTheSalesman = actualOfferData.salesman === uid;

                const userIndex = actualOfferData.clients.indexOf(uid);
                const imInTheClientsList = userIndex > -1;

                context.offer = { ...actualOfferData, imTheSalesman, id: offerId, imInTheClientsList };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/details.hbs');
                    });
            });
    });
    this.get('/delete/:offerId', function (context) {
        const { offerId } = context.params;
        DB.collection('offers')
            .doc(offerId)
            .delete()
            .then(() => {
                this.redirect('#/home');
            })
            .catch(errorHandler);
    });
    this.get('/edit/:offerId', function (context) {
        const { offerId } = context.params;

        DB.collection('offers')
            .doc(offerId)
            .get()
            .then(response => {
                context.offer = { id: offerId, ...response.data() };
                extendContext(context)
                    .then(function () {
                        this.partial('./templates/editOffer.hbs');
                    });
            })
            .catch(errorHandler);
    });
    this.post('/edit/:offerId', function (context) {
        const { offerId, productName, price, brand, description, imageUrl } = context.params;

        DB.collection('offers')
            .doc(offerId)
            .get()
            .then(response => {
                return DB.collection('offers')
                    .doc(offerId)
            .set({
                ...response.data(),
                productName,
                price,
                brand,
                description,
                imageUrl,
            })
            })
            .then(response => {
                this.redirect(`#/details/${offerId}`)
            })
            .catch(errorHandler);
    })

    this.get('/buy/:offerId', function (context) {
        const { offerId } = context.params;
        const { uid } = getUserData();

        DB.collection('offers')
            .doc(offerId)
            .get()
            .then(response => {
                const offerData = { ...response.data() };
                offerData.clients.push(uid)

                return DB.collection('offers')
                    .doc(offerId)
                    .set(offerData);
            })
            .then(() => {
                this.redirect(`#/details/${offerId}`);
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
