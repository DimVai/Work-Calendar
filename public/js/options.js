
/** User Options */
let Options = {
    autoLeave: false,
    hidePaydays: false,
    customTypeName: "Γιορτή",
};
// Load options from local storage
if (localStorage.getItem("options")) {
    Options = JSON.parse(localStorage.getItem("options"));
    Options.customTypeName = Options.customTypeName || "Γιορτή";
} else {
    localStorage.setItem("options", JSON.stringify(Options));
}

// Show options modal
Q("#options-btn").on("click", function() {
    Q("#options-modal").element.showModal();
});


// Options behavior in the modal
Q("#hide-paydays").checked = Options.hidePaydays;
Q("#auto-leave").checked = Options.autoLeave;
Q("#custom-type-name").value = Options.customTypeName;
Q(".options-auto-save").on("change", function() {
    Options[this.name] = this.type === "checkbox" ? this.checked : this.value;    // name, not id
    localStorage.setItem("options", JSON.stringify(Options));
    generateCalendar(currentYear);
    // console.log(Options);
});
Q("#options-save").on("click", function(){
    Options.customTypeName = Options.customTypeName?.length>0 ? Options.customTypeName : "Γιορτή";
    dayTypes[7].name = Options.customTypeName;
    fillEditOptions();  // Update the select dropdown options
    saveToDB();
});

function refreshOptions(options) {  // used when loading from DB
    Q("#hide-paydays").checked = options.hidePaydays;
    Q("#auto-leave").checked = options.autoLeave;
    Q("#custom-type-name").value = options.customTypeName;
    Q("#options-modal").element.close();
    Options.customTypeName = options.customTypeName || "Γιορτή";
    dayTypes[7].name = options.customTypeName;
    fillEditOptions();
}
