
/** User Options */
let Options = {
    autoLeave: false,
    hidePaydays: false,
};
// Load options from local storage
if (localStorage.getItem("options")) {
    Options = JSON.parse(localStorage.getItem("options"));
} else {
    localStorage.setItem("options", JSON.stringify(Options));
}

// Show options modal
Q("#options-btn").on("click", function() {
    Q("#options-modal").element.showModal();
});

// Click outside the modal to close it
document.addEventListener("click", function(e) {
    if (e.target.id === "options-modal") {
        Q("#options-modal").element.close();
    }
});

// Options behavior in the modal
Q("#hide-paydays").checked = Options.hidePaydays;
Q("#auto-leave").checked = Options.autoLeave;
Q(".options-auto-save").on("change", function() {
    Options[this.name] = this.checked;      // name, not id
    // console.log(Options);
    localStorage.setItem("options", JSON.stringify(Options));
    generateCalendar(currentYear);
});

