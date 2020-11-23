let baseURL = `https://teammanager-41033.firebaseio.com/`;

const router = Sammy('#main', function() {

    this.use('Handlebars', 'hbs');

    let errorBox = document.querySelector('#errorBox');
    let infoBox = document.querySelector('#infoBox');

        let partials = {
            'header':'./templates/common/header.hbs',
            'footer':'./templates/common/footer.hbs',
        }

    this.get('/home', async function(context){

        let isLogged = isUserLogged(context);
        if (isLogged) {
            context.teamId = await checkUserTeam();
            context.hasTeam = !!context.teamId;
        }
        this.loadPartials(partials)
        .then(function(){
            this.partial('../templates/home/home.hbs');
    })})

    this.get('/about', function(context){
        isUserLogged(context);
        this.loadPartials(partials)
            .then(function(){
            this.partial('../templates/about/about.hbs');
           
        })});

    this.get('/login', function(){
        this.loadPartials({...partials, ...{'loginForm':'../templates/login/loginForm.hbs'}})
        .then(function(){
            this.partial('../templates/login/loginPage.hbs');
    })});

    this.get('/register', function(){
        this.loadPartials({...partials, ...{'registerForm':'../templates/register/registerForm.hbs'}})
        .then(function(){
            this.partial('../templates/register/registerPage.hbs');
    })});

    this.get('/logout', function(context){
        localStorage.clear();
        firebase.auth().signOut();
        displaySuccessMessage('You logged out!')
        this.redirect('/home');
    })

    this.get('/catalog', async function(context){
        
        isUserLogged(context);
        let hasTeam = await checkUserTeam();
        context.hasNoTeam = !hasTeam;     
        let teamsObj = await getAllTeams();
        let teamsArr = [];
        if (teamsObj) {
            let keys = Object.keys(teamsObj);
            for (const key of keys) {
                teamsArr.push({_id: key, name: teamsObj[key].name, comment: teamsObj[key].comment});
            }
        }
        context.teams = teamsArr;
        this.loadPartials({...partials, ...{'team':'../templates/catalog/team.hbs'}})
            .then(function(){
                this.partial('./templates/catalog/teamCatalog.hbs');
            })
    })
    
    this.get('/create', function(context){
        isUserLogged(context);
        this.loadPartials({...partials, ...{'createForm': './templates/create/createForm.hbs'}})
            .then(function(){
                this.partial('./templates/create/createPage.hbs');
            })
    })
    
    this.post('/create', function(context){
        let {name, comment} = context.params;
        let email = JSON.parse(localStorage.getItem('user')).email;

        fetch(`${baseURL}.json`, {method: 'POST', body: JSON.stringify({
            name: name,
            comment : comment,
            members: [email],
            creator: email
        })}).then(()=> this.redirect('/catalog'))

    })

    this.post('/register', function(context){
        let {email, password, repeatPassword} = context.params;
        let match = password === repeatPassword;
        if (email === '' || password === '' || repeatPassword === '') {
            errorBox.style.display = 'block';
            errorBox.textContent = 'You must fill all the fields!';
        }
        else if (!match) {
            errorBox.style.display = 'block';
            errorBox.textContent = 'The passwords must match!';
        }else{
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(()=>{
                displaySuccessMessage('You have successfully registered!')
                this.redirect('/login')
            })
            .catch((err)=>{
                errorBox.style.display = 'block';
                if (err.code === 'auth/email-already-in-use') {
                    errorBox.textContent = 'The email is already registered!';
                }else if (err.code === 'auth/weak-password') {
                    errorBox.textContent = 'The password must be at least 6 numbers or letters!';
                }
            });
        }
            setTimeout(() => {
                errorBox.style.display = 'none';
            }, 1500);
    })

    this.post('/login', function(context){
        let {email, password} = context.params;
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((data)=>{
                displaySuccessMessage('You have successfully logged in!');
                errorBox.style.display = 'none';
                localStorage.setItem('user', JSON.stringify({email: data.user.email, uid: data.user.uid}));
                this.redirect('/home');
            }).catch((err)=>{
                errorBox.style.display = 'block';
                errorBox.textContent = 'The password is incorrect or there is no such user with this email!';
            })
        setTimeout(() => {
            errorBox.style.display = 'none';
        }, 1500);
    })
        
    this.get('catalog/:id', async function(context){
        isUserLogged(context);
        let {id} = context.params;
        let team = await getTeam(id);
        context.name = team.name;
        context.members = team.members;
        context.comment = team.comment;
        context.teamId = id;
        

        let email = JSON.parse(localStorage.getItem('user')).email;
        if (team.creator === email) {
            context.isAuthor = true;
        }
        if (team.members.includes(email)) {
            context.isOnTeam = true;
            context.isNotInOtherTeam = false;
        }else{
            let userTeam = await checkUserTeam();
            console.log(!!userTeam);
            if (!!userTeam) {
                context.isNotInOtherTeam = false;
            }else{
                context.isNotInOtherTeam = true;
            }
        }

        this.loadPartials({...partials, ...{'teamControls': '../templates/catalog/teamControls.hbs', 'teamMember': '../templates/catalog/teamMember.hbs'}})
        .then(function(){
            this.partial('../templates/catalog/details.hbs');
        })
    })
    
    this.get('/edit/:id',async function(context){
        isUserLogged(context)
        let { id } = context.params;
        let team = await getTeam(id);
        context.teamId = id;
        context.name = team.name;
        context.comment = team.comment;

        this.loadPartials({...partials, ...{'editForm': '../templates/edit/editForm.hbs'}})
            .then(function(){
                this.partial('../templates/edit/editPage.hbs');
            });
    })

    this.post('/edit/:id', function(context){
        let {id ,name, comment} = context.params;
        let obj = JSON.stringify({name, comment});
        fetch(`${baseURL}${id}.json`, {method: 'PATCH', body: obj})
                .then(()=>{ 
                    displaySuccessMessage('You have successfully edited the team!');
                this.redirect(`/home`)});
    })

    this.get('/join/:id',async function(context){
        let { id } = context.params;
        let membersURL = `${baseURL}${id}/members.json`;
        let members = await fetch(membersURL)
            .then(response => response.json())
        let email = JSON.parse(localStorage.getItem('user')).email;
        members.push(email);
        await fetch(`${baseURL}${id}.json`, {method: 'PATCH', body: JSON.stringify({members})})

        displaySuccessMessage('You have joined the team!');
        this.redirect('/home')
    })
    
    this.get('/leave/:id',async function(context){
        let { id } = context.params;
        let team = await fetch(`${baseURL}${id}.json`)
            .then(response => response.json())
        let members = team.members;
        let email = JSON.parse(localStorage.getItem('user')).email;
        if (team.creator === email) {
            await fetch(`${baseURL}${id}.json`, {method: 'DELETE'});
        }else{
        let memberIndex = members.indexOf(email);
        members.splice(memberIndex, 1);
        await fetch(`${baseURL}${id}.json`, {method: 'PATCH', body: JSON.stringify({members})});
        }
        displaySuccessMessage('You left the team!')
        this.redirect('/home');
    })
});



(()=>{
    router.run('/home');
})();

function displaySuccessMessage(text){
    infoBox.style.display = 'block';
    infoBox.textContent = text
    setTimeout(()=>{
        infoBox.style.display = 'none';
    }, 1500)
}

function isUserLogged(context){
    let userStorage = JSON.parse(localStorage.getItem('user'));
    let user =firebase.auth().currentUser;
    if (user && userStorage && user.email === userStorage.email && user.uid === userStorage.uid) {
        context.email = user.email;
        context.loggedIn = true;
        return true;
    }
        context.loggedIn = false;
        return false;
}

async function checkUserTeam(){
    let userEmail = JSON.parse(localStorage.getItem('user')).email;
    let teams = await getAllTeams();
    if (teams) {
        let keys = Object.keys(teams);
        for (const key of keys) {
            if (teams[key].members.includes(userEmail)) {
                return key;
            }
        }
    }
}

function getAllTeams(){
    return fetch(`${baseURL}.json`)
        .then(response => response.json());
}

async function getTeam(id){
        let teams = await getAllTeams();
        return teams[id];
}
