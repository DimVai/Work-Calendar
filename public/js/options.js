
/** User Options */
let Options = {
    autoLeave: false,
    hidePaydays: false,
    customTypeName: "Γιορτή",
    eligible: 0,
};


//# 1 Load options from local storage
if (localStorage.getItem("options")) {
    Options = JSON.parse(localStorage.getItem("options"));
    Options.customTypeName = Options.customTypeName || "Γιορτή";
    Options.eligible = Options.eligible || 0;
} else {
    localStorage.setItem("options", JSON.stringify(Options));
}

// Show options modal
Q("#options-btn").on("click", function() {
    Q("#options-modal").showModal();
});


//# 2 Show Options in the UI */
Q("#hide-paydays").checked = Options.hidePaydays;
Q("#auto-leave").checked = Options.autoLeave;
Q("#custom-type-name").value = Options.customTypeName;
Q("#eligible").value = Options.eligible || '';


//# 3 Save Options on change (auto-save) */
Q(".options-auto-save").on("change", function() {
    Options[this.name] = this.type === "checkbox" ? this.checked : this.value;    // name, not id
    localStorage.setItem("options", JSON.stringify(Options));
    generateCalendar(selectedYear);
    // console.log(Options);
});
Q("#options-save").on("click", function(){
    Options.customTypeName = Options.customTypeName?.length>0 ? Options.customTypeName : "Γιορτή";
    Options.eligible = parseInt(Q("#eligible").value) || 0;
    dayTypes[7].name = Options.customTypeName;
    fillEditOptions();  // Update the select dropdown options
    saveToDB();
});


//# 4 Refresh Options UI when loading from DB */
function refreshOptions(options) {  
    Q("#hide-paydays").checked = options.hidePaydays;
    Q("#auto-leave").checked = options.autoLeave;
    Q("#eligible").value = options.eligible || '';
    Q("#custom-type-name").value = options.customTypeName;
    Q("#options-modal").close();
    Options.customTypeName = options.customTypeName || "Γιορτή";
    Options.eligible = options.eligible || 0;
    dayTypes[7].name = options.customTypeName;
    fillEditOptions();
}
