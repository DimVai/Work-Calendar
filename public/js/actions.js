/** The user's Calendar */
let Calendar = {
    days: [],
    lastUpdate: localStorage.getItem("calendarUpdate") 
        ? new Date(localStorage.getItem("calendarUpdate")) 
        : new Date(),
    add: function({date, type, note}) {
        this.days.push({date, type, note});
        Q(`#day-${date}`).element.setAttribute("data-type", type);
        Q(`#day-${date}`).element.setAttribute("data-note", note);
        this.endAction();
    },
    remove: function(date) {
        this.days = this.days.filter(day => day.date !== date);
        Q(`#day-${date}`).element.removeAttribute("data-type");
        Q(`#day-${date}`).element.removeAttribute("data-note");
        this.endAction();
    },
    empty: function() {
        this.days = [];
        this.endAction();
    },
    endAction: function() {
        localStorage.setItem("days", JSON.stringify(this.days));
        calculateStatistics(currentYear);
        this.lastUpdate = new Date();
        localStorage.setItem("calendarUpdate", new Date().toISOString());
        const event = new CustomEvent("calendarUpdated", {detail: {days: this.days}});
        document.dispatchEvent(event);      // event on document or on window
        return this.days;
    },
    get size() {
        return this.days.length;
    }
};

//# Βήμα 4: Ημέρες χρήστη

// Σημείωση: Το showUserDays δεν αποχρωματίζει τις "παλιές" ημέρες αν πχ το Calendar φορτώθηκε από τη βάση. Να γίνει χρήση του refreshCalendar() για αυτό.
function showUserDays() {       
    Calendar.days.forEach(day => {
        if (!Q(`#day-${day.date}`)) {return}
        Q(`#day-${day.date}`).element.setAttribute("data-type", day.type);
        Q(`#day-${day.date}`).element.setAttribute("data-note", day.note);
    });
}

if (localStorage.getItem("days")) {
    Calendar.days = JSON.parse(localStorage.getItem("days"));
    showUserDays();
} else {
    localStorage.setItem("days", JSON.stringify(Calendar.days));
}

function calculateStatistics(year=currentYear) {
    let statistics = {
        total: 0,
        types: {},
        notes: {},
    };
    Calendar.days.forEach(day => {
        if (new Date(day.date).getFullYear() !== year) {return}
        statistics.total++;
        statistics.types[day.type] = statistics.types[day.type] ? statistics.types[day.type] + 1 : 1;
    });
    Q("~Έτος").set(currentYear);
    Q("~Άδειες").set(statistics.types[4] || 0);
    Q("~Ασθένειες").set(statistics.types[6] || 0);
    Q("~Απεργίες").set(statistics.types[5] || 0);
    return statistics;
}
calculateStatistics(currentYear);



//# Κλικ σε κάποια μέρα

function enableOrDisableNoteField() {
    if (Q("#edit-select").value === '0') {
        Q("#edit-note").element.setAttribute("disabled", true);
    } else {
        Q("#edit-note").element.removeAttribute("disabled");
    }
}

Q(".day").on("click", function() {
    // console.log(this.id);
    //* 1. Εμφάνιση του modal και συμπλήρωση των στοιχείων
    Q("#edit").classList.add("active");
    let dateInGreek = new Date(this.id).toLocaleDateString('el-GR',{dateStyle: 'full'});  // Δουλεύει!
    Q("~edit-date").set(dateInGreek);
    Q("#edit-note").value = this.getAttribute("data-note")??'';
    Q("#edit-select").value = this.getAttribute("data-type")??'0';

    //* 2. Αν είναι ενεργοποιημένη η αυτόματη άδεια
    if (Options.autoLeave) {       
        if (Q("#edit-select").value === '0') {      // Αν είναι στην προεπιλογή, κάντο άδεια
            Q("#edit-select").value = '4';
            Q("#edit-note").value = '';
        } else if (Q("#edit-select").value === '4') {   // Αν είναι ήδη άδεια, κάντο προεπιλογή
            Q("#edit-select").value = '0';
        }
        // handleDayChange(), αλλά το this μεταφέρεται (είναι το στοιχείο .day που κλικάραμε)
        handleDayChange.bind(this)();       
    }

    //* 3. Ενεργοποίηση/Απενεργοποίηση του πεδίου σημειώσεων
    enableOrDisableNoteField();
});

// click outside the edit offcanvas to hide it
document.addEventListener('click', function(event) {
    if (Q("#edit") && !event.target.classList.contains("day") && !event.target.closest("#edit")) {
        Q("#edit").classList.remove('active');
    }
});



//# Αλλαγές στις ημέρες από το χρήστη (auto save)
function handleDayChange() {
    
    let userDay = {
        date: (Q(".day.selected")[0].id).substr(4),
        type: Q("#edit-select").value,
        note: Q("#edit-note").value,
    }
    Calendar.remove(userDay.date);   // Διαγραφή παλιάς μέρας
    
    if (userDay.type === '0') {     // Ο χρήστης επέλεξε "Προεπιλογή"
        Q("#edit-note").value = '';

        // Χρήση του getDefaultDays για συμπλήρωση του data-type και data-note
        let defaultDays = getDefaultDays(currentYear);
        let defaultDay = defaultDays.find(day => day.date === userDay.date);
        
        if (defaultDay) {
            Q(`#day-${userDay.date}`).element.setAttribute("data-type", defaultDay.type);
            Q(`#day-${userDay.date}`).element.setAttribute("data-note", defaultDay.note);
            Q("#edit-select").value = defaultDay.type;
            Q("#edit-note").value = defaultDay.note;
        }
    } else {    // Ο χρήστης επέλεξε κάτι άλλο εκτός από "Προεπιλογή"
        if (userDay.note == dayDescriptions.today){  // Αν η σημείωση είναι "Σήμερα", τότε την αφαιρούμε
            Q("#edit-note").value = userDay.note = '';  
        } else if (userDay.note == dayDescriptions[8] && userDay.type != '8') {  // Αν η σημείωση είναι "Μισθοδοσία" αλλά δεν επιλέχθηκε Μισθοδοσία
            Q("#edit-note").value = userDay.note = '';  
        }
        console.log(userDay);
        Calendar.add(userDay);
    }
    enableOrDisableNoteField();
}
Q(".edit-auto-save").on("input", handleDayChange);      // (το this μεταφέρεται στο handleDayChange) 


//# Σκρολλάρισμα της σελίδας στον τρέχοντα μήνα
function scrollToCurrentMonth() {
    if (sessionStorage.getItem("alreadyScrolledToCurrentMonth") || window.innerWidth > 1200) {return}
    const currentMonth = new Date().getMonth() + 1;
    const targetElement = document.getElementById(`month-${currentYear}-${currentMonth}`);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", /*block: "center"*/ });
        sessionStorage.setItem("alreadyScrolledToCurrentMonth","true");
    }
}
scrollToCurrentMonth();
// setTimeout(scrollToCurrentMonth,100);


//# Copyright 
{let b=2025,y=new Date().getFullYear();document.getElementById('copy-years').textContent=(y>b)?`${b}-${y}`:b}