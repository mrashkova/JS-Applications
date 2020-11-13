// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyCQu9y2avcN0wub-_oSiwgjdAD0RWznUuc",
    authDomain: "books-exercise-a4ceb.firebaseapp.com",
    databaseURL: "https://books-exercise-a4ceb.firebaseio.com",
    projectId: "books-exercise-a4ceb",
    storageBucket: "books-exercise-a4ceb.appspot.com",
    messagingSenderId: "648578851468",
    appId: "1:648578851468:web:053c49b6c12f8ff42991a9"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

console.dir(firebase.auth());