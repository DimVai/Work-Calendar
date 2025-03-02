/** Είδη ημερών */
let dayTypes = [
    {   // 0
        name: "Προεπιλογή",
        color: null,
    },
    {   // 1
        name: "Εργάσιμη",
        color: "white",
    },
    {   // 2
        name: "Ρεπό",
        color: "PaleGreen",
    },
    {   // 3
        name: "Αργία",
        color: "DeepSkyBlue",
    },
    {   // 4
        name: "Άδεια",
        color: "LimeGreen",
    },
    {   // 5
        name: "Απεργία",
        color: "red",
    },
    {   // 6
        name: "Ασθένεια",
        color: "SandyBrown",
    },
    {   // 7
        name: "Γιορτή",
        color: "purple",
    },
    {   // 8
        name: "Μισθοδοσία",
        color: "Violet",    
    }
];

// Χρώμα ημέρών με βάση τον τύπο τους
dayTypes.forEach((dayType,index) => {
    Q.setCssVariable(`--type-${index}`, dayType.color);
});

function showEditOptions() {
    let dayTypeSelectOptionsHTML = dayTypes.map((dayType, index) => `<option value="${index}">${dayType.name}</option>`).join("");
    Q("#edit-select").element.innerHTML = dayTypeSelectOptionsHTML;
}
showEditOptions();

/** Μετατρέπει μια ημερομηνία στη μορφή που χρησιμοποιείται από την Εφαρμογή */
let propper = date => date.toISOString().split('T')[0];



// Σημερινή ημέρα
function showToday(){
    const today = new Date();
    if (!Q(`#day-${propper(today)}`)) {return}
    Q(`#day-${propper(today)}`).classList.add("today");
    Q(`#day-${propper(today)}`).element.setAttribute("data-note", "Σήμερα");
}
showToday();




////// Επίσημες αργίες στην Ελλάδα

const fixedholidays = new Map([
    ["01-01", "Πρωτοχρονιά"],
    ["01-06", "Θεοφάνεια"],
    ["03-25", "Ευαγγελισμός της Θεοτόκου"],
    ["05-01", "Εργατική Πρωτομαγιά"],
    ["08-15", "Κοίμηση της Θεοτόκου"],
    ["10-28", "Ημέρα του Όχι"],
    ["12-25", "Χριστούγεννα"],
    ["12-26", "Σύναξη της Θεοτόκου"],
]);

let easter = new Map([
    [2025, "04-20"],
    [2026, "04-10"],
    [2027, "05-02"],
    [2028, "04-16"],
    [2029, "04-08"],
    [2030, "04-28"],
    [2031, "04-13"],
    [2032, "05-02"],
    [2033, "04-24"],
]);

const movingHolidays = new Map([
    ["-48", "Καθαρά Δευτέρα"],
    ["-2", "Μεγάλη Παρασκευή"],
    ["0", "Κυριακή του Πάσχα"],
    ["1", "Δευτέρα του Πάσχα"],
    ["49", "Πεντηκοστή"],
    ["50", "Αγίου Πνεύματος"],
]);

function getMovingHolidays(year) {
    let easterDate = new Date(`${year}-${easter.get(year)}`);       // Ημερομηνία του Πάσχα σε propper format
    let movingHolidaysDates = new Map();
    movingHolidays.forEach((holiday, offset) => {
        let holidayDate = new Date(easterDate);
        holidayDate.setDate(holidayDate.getDate() + Number(offset));        // Number() μετατροπή σε αριθμό γιατί το offset είναι string
        let holidayDateString = propper(holidayDate);
        movingHolidaysDates.set(holidayDateString, holiday);
    });
    return movingHolidaysDates;
}

/** Επιστρέφει τις επίσης αργίες στην Ελλάδα στη μορφή ΕΕΕΕ-ΜΜ-ΗΗ */
let holidays = year => {
    let propperFixedHolidays = new Map();
    fixedholidays.forEach((holiday, date) => {
        propperFixedHolidays.set(propper(new Date(`${year}-${date}`)), holiday);
    });
    let holidays = new Map([...propperFixedHolidays, ...getMovingHolidays(year)]);
    return holidays;
}     // Σε μορφή ΜΜ-ΗΗ (κι όχι ΕΕΕΕ-ΜΜ-ΗΗ)

// Εμφάνιση αργιών στο ημερολόγιο
function showHolidays() {
    holidays(currentYear).forEach((holiday, date) => {
        Q(`#day-${date}`).element.setAttribute("data-type", 3);
        Q(`#day-${date}`).element.setAttribute("data-note", holiday);
    });
}
showHolidays();



////// Ημέρες πληρωμής μισθού στην Ελλάδα

function getPaydays(year) {

    //* Βήμα 1: Τελευταίες μέρες κάθε μήνα σε μορφή ΕΕΕΕ-ΜΜ-ΗΗ
    let lastDays = [];
    for (let month = 0; month < 12; month++) {
        lastDays.push(year + '-' + (month+1).toString().padStart(2, "0") + '-' + new Date(year, month + 1, 0).getDate());
    }
    // console.log({lastDays});

    //* Βήμα 2: Υπολογισμός των extra μερών πληρωμής
    let extraPaydays = new Map([
        [`${year}-12-21`, "Δώρο Χριστουγέννων"],
        [`${year}-08-10`, "Επίδομα Άδειας"],
    ]);
    // Υπολογισμός ημερομηνίας πληρωμής Δώρου Πάσχα (μπορεί να είναι προηγούμενος μήνας)
    let easterDate = new Date(`${year}-${easter.get(year)}`);
    easterDate.setDate(easterDate.getDate() - 4);
    let easterGiftDate = propper(easterDate);
    extraPaydays.set(easterGiftDate, "Δώρο Πάσχα");
    
    //* Βήμα 3: Συνδυασμός των extra μερών πληρωμής με τις τελευταίες μέρες του μήνα
    let paydays = new Map([...extraPaydays]);
    lastDays.forEach((day) => {
        paydays.set(day, "Μισθοδοσία");
    });
    // console.log({paydays});

    //* Βήμα 4: Προσαρμογή των paydays σε περίπτωση που συμπίπτουν με αργίες
    // για όλα τα paydays, όσο συμπίπτουν με αργίες ή Σαββατοκύριακο, μείωση κάτα 1 ημέρα μέχρι να μην συμπίπτουν
    let holidayDates = [...holidays(year).keys()];
    // console.log({holidayDates});
    paydays.forEach((paydayDescription, date) => {
        // console.log(paydayDescription, date);
        while (holidayDates.includes(date) || new Date(date).getDay() === 0 || new Date(date).getDay() === 6) {
            // console.log(date + " is a holiday or weekend");
            let newDate = new Date(date);
            newDate.setDate(newDate.getDate() - 1);
            // replace the old date with the new one in paydays
            paydays.delete(date);
            date = propper(newDate);
            paydays.set(date, paydayDescription);
        }
    });

    return paydays;
}

// Εμφάνιση ημερών πληρωμής στο ημερολόγιο
function showPaydays() {
    getPaydays(currentYear).forEach((paydayDescription, date) => {
        Q(`#day-${date}`).element.setAttribute("data-type", 8);
        Q(`#day-${date}`).element.setAttribute("data-note", paydayDescription);
    });
}
showPaydays();



///////    Απαραίτητες ενέργειες κατά την αλλαγή ημερολογίου (έτους)
document.addEventListener("calendarGenerated", function(event) {
    // console.log(`Calendar for ${event.detail.year} has been generated!`);
    showToday();
    showHolidays();
    showPaydays();
    showUserDays();
    calculateStatistics();
});