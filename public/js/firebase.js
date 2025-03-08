
console.log('firebase.js loaded');

/* The App User */
let AppUser = {
    name: 'Guest',
    email: '',
};

/* The web app's Firebase configuration */
/*
const firebaseConfig = {
    apiKey: "AIzaSyD0_ALHems5yDoDZ2SEL8iI0JN8qXjrg2U",
    authDomain: window.location.hostname,
    projectId: "dim-work-calendar",
    storageBucket: "dim-work-calendar.firebasestorage.app",
    messagingSenderId: "547684551323",
    appId: "1:547684551323:web:c047b2c121218a236c943e"
};
firebase.initializeApp(firebaseConfig);
*/

var googleAuth = new firebase.auth.GoogleAuthProvider();
firebase.auth().languageCode = 'el';

function signInWithGoogle() {
    // firebase.auth().signInWithRedirect(googleAuth);
    firebase.auth().signInWithPopup(googleAuth).then((result) => {
        console.log(result);
    }).catch((error) => {
        console.log(error);
    });
}

Q(".btn-google").on('click', signInWithGoogle);
Q(".btn-logout").on('click', function() {
    firebase.auth().signOut();
});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        AppUser.name = user.displayName;
        AppUser.email = user.email;
        Q('~email').set(AppUser.email);
        Q('~name').set(AppUser.name);
        Q.setCssVariable('--user-display', 'block');
        Q.setCssVariable('--guest-display', 'none');
    }
    else {
        console.log('User signed out');
        AppUser.name = 'Guest';
        AppUser.email = '';
        Q('~email').set('');
        Q('~name').set('Guest');
        Q.setCssVariable('--user-display', 'none');
        Q.setCssVariable('--guest-display', 'block');
    }
    console.log(AppUser);
});
