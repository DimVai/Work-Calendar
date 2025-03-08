
console.log('firebase.js loaded')

var googleAuth = new firebase.auth.GoogleAuthProvider();
firebase.auth().languageCode = 'el';

function signInWithGoogle() {
    firebase.auth().signInWithRedirect(googleAuth).then(function(result) {
        var user = result.user;
        console.log(user)
        console.log('Sign in with Google successful')
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('Sign in with Google failed')
        console.log(errorCode)
        console.log(errorMessage)
    });
}

Q("#google-login").on('click', signInWithGoogle);
