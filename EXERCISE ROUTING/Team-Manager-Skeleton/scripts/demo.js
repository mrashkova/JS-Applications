/* globals $, sammy */

$(() => {
    const app = Sammy('#main', function (context) {
        this.use('Handlebars', 'hbs');

        // this === Sammy.Application
        console.log(this);

        this.get('index.html', function (context) {
            console.log(this);

            // this === Sammy.EventContext
            this.render('./templates/register/registerForm.hbs').then(function (html) {
                //this === Sammy.RendexContext
                console.log(this);

                this.swap(html)
            })
        })

        
    // this.loadPartials({
    //     header: './templates/common/header.hbs',
    //     footer: './templates/common/footer.hbs',
    // }).then(function () {
    //     this.partial('./templates/home/home.hbs', {loggedIn: false} );
    // })

    // this.render('./templates/register/registerForm.hbs').then(function (html) {

    //     this.swap(html)
    // })
    });

    app.run();
})