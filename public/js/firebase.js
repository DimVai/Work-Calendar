
//#0 Μεταβλητές εφαρμογής

/* The App User */
let AppUser = {
    name: 'Guest',
    email: '',
    id: 0,
};

/* The web app's Firebase configuration */

/*
const firebaseConfig = {
    apiKey: "AIzaSyD0_ALHems5yDoDZ2SEL8iI0JN8qXjrg2U",
    // authDomain: "window.location.hostname",
    authDomain: "dim-work-calendar.web.app",
    projectId: "dim-work-calendar",
    storageBucket: "dim-work-calendar.firebasestorage.app",
    messagingSenderId: "547684551323",
    appId: "1:547684551323:web:c047b2c121218a236c943e"
};
firebase.initializeApp(firebaseConfig);
*/

//#1 Google authentication

var googleAuth = new firebase.auth.GoogleAuthProvider();
firebase.auth().languageCode = 'el';

function signInWithGoogle() {
    // firebase.auth().signInWithRedirect(googleAuth).then((result) => {
    firebase.auth().signInWithPopup(googleAuth).then((result) => {
        console.debug(result);
    }).catch((error) => {
        console.debug(error);
    });
}


Q(".btn-google").on('click', signInWithGoogle);
Q(".btn-logout").on('click', function() { firebase.auth().signOut() });

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        AppUser.name = user.displayName;
        AppUser.email = user.email;
        AppUser.id = user.uid;
        Q('~email').set(AppUser.email);
        Q('~name').set(AppUser.name);
        Q.setCssVariable('--user-display', 'block');
        Q.setCssVariable('--guest-display', 'none');
        loadCalendarFromDB(); // Φόρτωμα ημερολογίου από βάση δεδομένων
    }
    else {
        console.debug('User signed out');
        AppUser.name = 'Guest';
        AppUser.email = '';
        AppUser.id = 0;
        Q('~email').set('');
        Q('~name').set('Guest');
        Q.setCssVariable('--user-display', 'none');
        Q.setCssVariable('--guest-display', 'block');
    }
    console.debug(AppUser);
});


//#2 Φόρτωση δεδομένων από βάση δεδομένων

const db = firebase.firestore();

async function loadCalendarFromDB() {
    if (AppUser.id==0) { return }
    const calendarRef = db.collection('Calendars').doc(AppUser.id);
    let CalendarData = await calendarRef.get().then((doc) => {
        if (doc.exists) {
            let CalendarFromDB = doc.data();
            console.debug("Calendar loaded from database");
            // let dbDate = CalendarFromDB.lastUpdade.toDate();
            if (CalendarFromDB.days?.length >=3 ) {
                Calendar.lastUpdate = CalendarFromDB.lastUpdade.toDate();
                Calendar.days = CalendarFromDB.days;
                localStorage.setItem("days", JSON.stringify(CalendarFromDB.days));
                Options = CalendarFromDB.options ?? Options; // Αν δεν υπάρχουν επιλογές, χρησιμοποίησε τις default
                refreshOptions(Options); // Ενημέρωση στο UI και στο dayTypes
                generateCalendar(currentYear);      // (Με το refreshCalendar() δεν θα αποχρωματιστούν οι "παλιές" μέρες. Για αυτό generateCalendar)
                return CalendarFromDB;
            } else {
                console.debug("Calendar in database is almost empty. Overriding it.");
                saveToDB();
                return false;
            }
        } else {
            console.debug("No Calendar in database for user. Creating it.");
            saveToDB();
            return null;
        }
    }).catch((error) => {
        console.debug("Error getting document:", error);
        return null;
    });
    return CalendarData;
}





//#3 Αποθήκευση σε βάση δεδομένων

let debounceTimeout = null;
let dataSavedΤοDB = true;

async function saveToDB() {
    if (AppUser.id==0) { return }
    console.debug("Saving calendar to database...");
    const calendarRef = db.collection('Calendars').doc(AppUser.id);
    const calendarData = {
        days: Calendar.days,
        // lastUpdade: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdade: Calendar.lastUpdate,
        options: Options,
    };
    await calendarRef.set(calendarData, { merge: false }).then(() => {
        console.debug("Calendar saved to database");
        dataSavedΤοDB = true;
        return true;
    }).catch((error) => {
        console.error("Error saving calendar to database:", error);
        return false;
    });
}

document.addEventListener("calendarUpdated", (e) => {
  clearTimeout(debounceTimeout);        // Throttle hanlder
  dataSavedΤοDB = false;
  debounceTimeout = setTimeout(() => {
    saveToDB();
  }, 2000); // εκτελείται μόνο αν περάσει κάποιος χρόνος χωρίς νέο event
});

// Σε περίπτωση που ο χρήστης κλείσει βιαστικά το παράθυρο και δεν προλάβει να αποθηκευτεί το Calendar στη βάση
window.addEventListener("beforeunload", (e) => {
    if (!dataSavedΤοDB) { saveToDB(); }
});