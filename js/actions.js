
/** The user's Calendar */
let Calendar = {
    days: [],
    add: function({date, type, note}) {
        this.days.push({date, type, note});
        localStorage.setItem("days", JSON.stringify(this.days));
        Q(`#day-${date}`).element.setAttribute("data-type", type);
        Q(`#day-${date}`).element.setAttribute("data-note", note);
        return this.days;
    },
    remove: function(date) {
        this.days = this.days.filter(day => day.date !== date);
        localStorage.setItem("days", JSON.stringify(this.days));
        Q(`#day-${date}`).element.removeAttribute("data-type");
        Q(`#day-${date}`).element.removeAttribute("data-note");
        return this.days;
    },
    empty: function() {
        this.days = [];
        localStorage.setItem("days", JSON.stringify(this.days));
        return this.days;
    },
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



Q(".day").on("click", function() {
    console.log(this.id);
    // this.setAttribute("data-type", 4);
});


// Copyright 
{let b=2025,y=new Date().getFullYear();document.getElementById('copy-years').textContent=(y>b)?`${b}-${y}`:b}