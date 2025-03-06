const months = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
const weekdays = ["Δ", "Τ", "Τ", "Π", "Π", "Σ", "Κ"];
const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

let selectedDayId = null;
let currentYear = 2025;

function generateCalendar(year) {
    selectedDayId = null; // Reset επιλογής ημέρας
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";
    
    months.forEach((month, index) => {
        const monthDiv = document.createElement("div");
        monthDiv.classList.add("month");
        
        const title = document.createElement("h3");
        monthDiv.classList.add("month");
        monthDiv.id = `month-${year}-${index + 1}`;
        title.textContent = `${month} ${year}`;
        monthDiv.appendChild(title);
        
        const grid = document.createElement("div");
        grid.classList.add("grid");
        
        // Header με τις ημέρες της εβδομάδας
        weekdays.forEach(day => {
            const weekdayDiv = document.createElement("div");
            weekdayDiv.classList.add("weekday");
            weekdayDiv.textContent = day;
            grid.appendChild(weekdayDiv);
        });
        
        const firstDay = getFirstDayOfMonth(year, index);
        const offset = firstDay === 0 ? 6 : firstDay - 1; // Μετατροπή ώστε η Δευτέρα να είναι πρώτη
        
        // Κενά πριν από την πρώτη μέρα του μήνα
        for (let i = 0; i < offset; i++) {
            const emptyDiv = document.createElement("div");
            grid.appendChild(emptyDiv);
        }
        
        for (let day = 1; day <= daysInMonth(year, index); day++) {
            const date = new Date(year, index, day);
            const weekdayClass = `day-${date.getDay()}`;
            
            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day", weekdayClass);
            dayDiv.id = `day-${year}-${String(index + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayDiv.textContent = day;
            
            dayDiv.addEventListener("click", () => selectDay(dayDiv.id));
            
            grid.appendChild(dayDiv);
        }
        
        monthDiv.appendChild(grid);
        calendar.appendChild(monthDiv);
    });

    // Δημιουργία και dispatch custom event
    const event = new CustomEvent("calendarGenerated", {
        detail: { year }
    });
    document.dispatchEvent(event);
}

function selectDay(dayId) {
    if (selectedDayId) {
        const prevSelected = document.getElementById(selectedDayId);
        if (prevSelected) {
            prevSelected.classList.remove("selected");
        }
    }
    selectedDayId = dayId;
    document.getElementById(dayId).classList.add("selected");
    // console.log("Selected day:", selectedDayId);
}

function setupYearSelector() {
    const baseYear = 2025;
    const finalYear = new Date().getFullYear() + 1;
    const yearSelect = document.getElementById("year-select");
    for (let year = baseYear; year <= finalYear; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
    yearSelect.addEventListener("change", (event) => {
        currentYear = parseInt(event.target.value);
        generateCalendar(currentYear);
    });
}

setupYearSelector();
generateCalendar(currentYear);