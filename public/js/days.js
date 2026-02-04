/** Είδη ημερών */
let dayTypes = [
    {   // 0
        name: "Προεπιλογή",
        order: 0,
        color: null,
    },
    {   // 1
        name: "Εργάσιμη",
        order: 1,
        color: "GhostWhite",
    },
    {   // 2
        name: "Ρεπό",
        order: 2,
        color: "LightBlue",
        // color: "hsl(195, 53%, 83%)",
    },
    {   // 3
        name: "Αργία",
        order: 3,
        color: "DeepSkyBlue",
    },
    {   // 4, Άδεια
        name: "Άδεια",
        order: 4,
        color: "LimeGreen",
    },
    {   // 5
        name: "Απεργία",
        order: 5,
        color: "Red",
    },
    {   // 6
        name: "Ασθένεια",
        order: 6,
        color: "hsl(28, 81%, 64%)",
        // color: "SandyBrown",
    },
    {   // 7, custom
        name: Options.customTypeName,       // Options gets initialized first
        order: 7,
        color: "DarkMagenta",
        // color: "Purple",
    },
    {   // 8
        name: "Μισθοδοσία",
        order: 8,
        // color: "Violet",
        color: "hsl(276, 100%, 85%)",
        // color: "hsl(270, 100%, 86%)",
    },
    {   // 9
        name: "Σημείωση",
        order: 9,
        color: "Gold",
    }
];

// Χρώμα ημέρων με βάση τον τύπο τους
dayTypes.forEach((dayType,index) => {
    if (dayType.color) {Q.setCssVariable(`--type-${index}`, dayType.color)};
});

function fillEditOptions() {
    let editSelect = Q("#edit-select");
    editSelect.innerHTML = ""; // Άδειασμα των options
    // Sort dayTypes by their 'order' property before mapping to options
    let sortedDayTypes = dayTypes
        .map((dt, idx) => ({...dt, _index: idx}))
        .sort((a, b) => a.order - b.order);
    let dayTypeSelectOptionsHTML = sortedDayTypes
        .map(dayType => `<option value="${dayType._index}">${dayType.name}</option>`)
        .join("");
    editSelect.innerHTML = dayTypeSelectOptionsHTML;
}
fillEditOptions();

/** Μετατρέπει μια ημερομηνία στη μορφή που χρησιμοποιείται από την Εφαρμογή */
let propper = date => {
    return date.toLocaleDateString('el-GR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .split('/').reverse().join('-');
};


/** Περιγραφές συγκεκριμένων ημερών  */
let dayDescriptions = {
    today: "(Σήμερα)",
    8: "Μισθοδοσία",
};


//# Βήμα 1: Σημερινή ημέρα
function showToday(){
    const today = new Date();
    // change today for testing purposes
    // today.setDate(today.getDate() + 2);
    if (!Q(`#day-${propper(today)}`)) {return}
    Q(`#day-${propper(today)}`).classList.add("today");
    Q(`#day-${propper(today)}`).setAttribute("data-note", dayDescriptions["today"]);
}
showToday();



//# Βήμα 2: Επίσημες αργίες στην Ελλάδα

const fixedholidays = new Map([
    ["01-01", "Πρωτοχρονιά"],
    ["01-06", "Θεοφάνεια"],
    ["03-25", "Επέτειος της Ελληνικής Επανάστασης"],        // Επέτειος της Ελληνικής Επανάστασης
    ["05-01", "Εργατική Πρωτομαγιά"],
    ["08-15", "Κοίμηση της Θεοτόκου"],
    ["10-28", "Επέτειος του Όχι"],
    ["12-25", "Χριστούγεννα"],
    ["12-26", "Σύναξη της Θεοτόκου"],
]);

let easter = new Map([
    [2025, "04-20"],
    [2026, "04-12"],
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
    if (!year) {return new Map()}
    let easterDate = new Date(`${year}-${easter.get(year)}`);       // Ημερομηνία του Πάσχα
    let movingHolidaysDates = new Map();
    movingHolidays.forEach((holiday, offset) => {
        let holidayDate = new Date(easterDate);
        holidayDate.setDate(holidayDate.getDate() + Number(offset));        // Number() μετατροπή σε αριθμό γιατί το offset είναι string
        let holidayDateString = propper(holidayDate);
        movingHolidaysDates.set(holidayDateString, holiday);
    });
    return movingHolidaysDates;
}

/** Επιστρέφει τις αργίες στην Ελλάδα στη μορφή ΕΕΕΕ-ΜΜ-ΗΗ */
function getHolidays(year) {
    if (!year) {return new Map()}
    let propperFixedHolidays = new Map();
    fixedholidays.forEach((holiday, date) => {
        propperFixedHolidays.set(propper(new Date(`${year}-${date}`)), holiday);
    });
    let holidays = new Map([...propperFixedHolidays, ...getMovingHolidays(year)]);
    return holidays;
}

// Εμφάνιση αργιών στο ημερολόγιο
function showHolidays() {
    getHolidays(selectedYear).forEach((holiday, date) => {
        Q(`#day-${date}`).setAttribute("data-type", 3);
        Q(`#day-${date}`).setAttribute("data-note", holiday);
    });
}
showHolidays();



//# Βήμα 3: Μισθοδοσία μισθωτών

function getPaydays(year) {

    if (!year || Options.hidePaydays ) {return new Map()}

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
        paydays.set(day, dayDescriptions[8]);
    });
    // console.log({paydays});

    //* Βήμα 4: Προσαρμογή των paydays σε περίπτωση που συμπίπτουν με αργίες
    // για όλα τα paydays, όσο συμπίπτουν με αργίες ή Σαββατοκύριακο, μείωση κάτα 1 ημέρα μέχρι να μην συμπίπτουν
    let holidayDates = [...getHolidays(year).keys()];
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
    getPaydays(selectedYear).forEach((paydayDescription, date) => {
        Q(`#day-${date}`).setAttribute("data-type", 8);
        Q(`#day-${date}`).setAttribute("data-note", paydayDescription);
    });
}
showPaydays();

/** Union of getHolidays and getPayDays in the format {date, type, note} */
function getDefaultDays (year) {
    let defaultDays = [];
    getHolidays(year).forEach((holiday, date) => {
        defaultDays.push({date, type: 3, note: holiday});
    });
    getPaydays(year).forEach((paydayDescription, date) => {
        defaultDays.push({date, type: 8, note: paydayDescription});
    });
    return defaultDays;
}



///////    Απαραίτητες ενέργειες κατά την αλλαγή ημερολογίου (έτους)

function refreshCalendar() {
    showToday();
    showHolidays();
    showPaydays();
    showUserDays();
    calculateStatistics();
}

document.addEventListener("calendarGenerated", function(event) {
    // console.log(`Calendar for ${event.detail.year} has been generated!`);
    refreshCalendar();
});