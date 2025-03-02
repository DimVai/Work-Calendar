
/** The user's Calendar */
let Calendar = {
    days: [],
    add: function({date, type, note}) {
        this.days.push({date, type, note});
        localStorage.setItem("days", JSON.stringify(this.days));
        Q(`#day-${date}`).element.setAttribute("data-type", type);
        Q(`#day-${date}`).element.setAttribute("data-note", note);
        this.endAction();
    },
    remove: function(date) {
        this.days = this.days.filter(day => day.date !== date);
        localStorage.setItem("days", JSON.stringify(this.days));
        Q(`#day-${date}`).element.removeAttribute("data-type");
        Q(`#day-${date}`).element.removeAttribute("data-note");
        this.endAction();
    },
    empty: function() {
        this.days = [];
        localStorage.setItem("days", JSON.stringify(this.days));
        this.endAction();
    },
    endAction: function() {
        calculateStatistics(currentYear);
        return this.days;
    }
};

function showUserDays() {
    Calendar.days.forEach(day => {
        if (!Q(`#day-${day.date}`)) {return}
        Q(`#day-${day.date}`).element.setAttribute("data-type", day.type);
        Q(`#day-${day.date}`).element.setAttribute("data-note", day.note);
    });
}
showUserDays();

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

function enableOrDisableNoteField() {
    if (Q("#edit-select").value === '0') {
        Q("#edit-note").element.setAttribute("disabled", true);
    } else {
        Q("#edit-note").element.removeAttribute("disabled");
    }
}

// Κλικ σε κάποια μέρα
Q(".day").on("click", function() {
    // console.log(this.id);
    // this.setAttribute("data-type", 4);
    Q("#edit").classList.add("active");
    let dateInGreek = new Date(this.id).toLocaleDateString('el-GR',{dateStyle: 'full'});  // Δουλεύει!
    Q("~edit-date").set(dateInGreek);
    Q("#edit-note").value = this.getAttribute("data-note")??'';
    Q("#edit-select").value = this.getAttribute("data-type")??'0';
    enableOrDisableNoteField();
});

// hide edit on click outside
document.addEventListener('click', function(event) {
    if (Q("#edit") && !event.target.classList.contains("day") && !event.target.closest("#edit")) {
        Q("#edit").classList.remove('active');
    }
});

// Αλλαγή τιμής στο edit (auto save)
Q(".edit-auto-save").on("input", function() {
    enableOrDisableNoteField();
    let userDay = {
        date: (Q(".day.selected")[0].id).substr(4),
        type: Q("#edit-select").value,
        note: Q("#edit-note").value,
    }
    Calendar.remove(userDay.date);   // Διαγραφή παλιάς μέρας
    // console.log(userDay);
    if (userDay.type === '0') {
        Q("#edit-note").value = '';
        return;
    }
    Calendar.add(userDay);
});






// Copyright 
{let b=2025,y=new Date().getFullYear();document.getElementById('copy-years').textContent=(y>b)?`${b}-${y}`:b}