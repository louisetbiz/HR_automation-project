let employees = [];
let shifts = [];
let schedule = {};
let absences = [];


let currentDate = new Date(2026, 9, 1);


// ------------------------------------
// ------------------------------------

async function loadEmployees() {

    try {

        const response = await fetch(
            `${API_URL}/api/schedule_employees`
        );

        if (!response.ok) {
            throw new Error("Could not load employees");
        }

        employees = await response.json();

    } catch (error) {

        console.error("Error loading employees:", error);

        alert("Could not load employees from the server.");
    }
}


// ------------------------------------
// LOAD SHIFTS
// ------------------------------------

async function loadShifts() {

    try {

        const response = await fetch(
            `${API_URL}api/shift_types`
        );

        if (!response.ok) {
            throw new Error("Could not load shifts");
        }

        shifts = await response.json();

    } catch (error) {

        console.error("Error loading shifts:", error);

        alert("Could not load shifts from the server.");
    }
}

async function loadSchedule() {
    try {
        const response = await fetch(`${API_URL}/api/employee_schedule`);

        if (!response.ok) {
            throw new Error("Could not load schedule");
        }

        const data = await response.json();

        schedule = {};

        data.forEach(row => {
            if (!schedule[row.work_date]) {
                schedule[row.work_date] = {};
            }

            if (row.assignment_type === "OFF") {
                schedule[row.work_date][row.employee_id] = "OFF";
            } else {
                schedule[row.work_date][row.employee_id] = row.shift_id;
            }
        });

    } catch (error) {
        console.error("Error loading schedule:", error);
        alert("Could not load schedule from the server.");
    }
}


// ------------------------------------
// LOAD ALL DATA
// ------------------------------------

async function loadScheduleData() {

    await loadEmployees();
    await loadShifts();
    await loadSchedule();
    await loadAbsences();
    renderCalendar();
}


// ------------------------------------
// CALENDAR
// ------------------------------------
function getEmployeeAbsence(employeeId, dateString) {

    return absences.find(absence => {

        return (
            absence.employee_id === employeeId &&
            dateString >= absence.start_date &&
            dateString <= absence.end_date
        );

    });
}
function renderCalendar() {

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();


    const monthName =
        currentDate.toLocaleString("default", {
            month: "long"
        });


    document.getElementById("monthTitle").textContent =
        `${monthName} ${year}`;


    const calendarDays =
        document.getElementById("calendarDays");

    calendarDays.innerHTML = "";


    let firstDay =
        new Date(year, month, 1).getDay();


    // Convert Sunday=0 to Monday-based calendar
    firstDay =
        firstDay === 0 ? 6 : firstDay - 1;


    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {

        const emptyCell =
            document.createElement("div");

        emptyCell.className =
            "day empty";

        calendarDays.appendChild(emptyCell);
    }


    // Days
    for (let day = 1; day <= daysInMonth; day++) {

        const cell =
            document.createElement("div");

        cell.className = "day";


        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const dateNumber =
            document.createElement("div");

        dateNumber.className =
            "date-number";

        dateNumber.textContent =
            day;

        cell.appendChild(dateNumber);


        const assignments =
            schedule[dateString] || {};


        employees.forEach(employee => {

    const absence =
        getEmployeeAbsence(
            employee.id,
            dateString
        );

    if (absence) {

        const assignmentElement =
            document.createElement("div");

        assignmentElement.classList.add(
            "assignment",
            "absence"
        );

        assignmentElement.textContent =
            `${employee.name} — ${absence.absence_type}`;

        cell.appendChild(assignmentElement);

        return;
    }

    const assignment = assignments[employee.id];


            const assignmentElement =
                document.createElement("div");

            assignmentElement.className =
                "assignment";
            assignmentElement.classList.add(
            employee.sector.toLowerCase()
            );


            if (assignment === "OFF") {

                assignmentElement.classList.add("off");

                assignmentElement.textContent =
                    `${employee.name} — OFF`;

            } else {

                const shift =
                    shifts.find(
                        s => s.id === assignment
                    );


                if (!shift) {
                    return;
                }


                assignmentElement.textContent =
                    `${employee.name} ${shift.start_time}–${shift.end_time}`;
            }


            cell.appendChild(assignmentElement);
        });


        cell.addEventListener("click", () => {

            openModal(
                dateString,
                day,
                monthName,
                year
            );

        });


        calendarDays.appendChild(cell);
    }
}


// ------------------------------------
// MODAL
// ------------------------------------

function openModal(
    dateString,
    day,
    monthName,
    year
) {

    const modal =
        document.getElementById("scheduleModal");


    const modalDate =
        document.getElementById("modalDate");


    modalDate.textContent =
        `${monthName} ${day}, ${year}`;


    const container =
        document.getElementById("employeeAssignments");

    container.innerHTML = "";


    const assignments =
        schedule[dateString] || {};


    employees.forEach(employee => {

        const row =
            document.createElement("div");

        row.className =
            "employee-row";


        const name =
            document.createElement("div");

        name.className =
            "employee-name";


        name.innerHTML = `
            <strong>${employee.name}</strong>
            <span>${employee.sector}</span>
        `;


        const select =
            document.createElement("select");
        select.id = `shift-${employee.id}`;

        // OFF
        const offOption =
            document.createElement("option");

        offOption.value = "OFF";

        offOption.textContent = "OFF";

        select.appendChild(offOption);


        // Only shifts belonging to employee's sector
        shifts
            .filter(shift =>
                shift.sector === employee.sector
            )
            .forEach(shift => {

                const option =
                    document.createElement("option");

                option.value =
                    shift.id;

                option.textContent =
                    `${shift.start_time}–${shift.end_time}`;


                if (
                    assignments[employee.id] === shift.id
                ) {

                    option.selected = true;
                }


                select.appendChild(option);
            });


        if (
            assignments[employee.id] === "OFF"
        ) {

            select.value = "OFF";
        }


        row.appendChild(name);

        row.appendChild(select);

        container.appendChild(row);
    });


    modal.dataset.date =
        dateString;


    modal.classList.add("show");
}



// ------------------------------------
// SAVE
// ------------------------------------

document
    .getElementById("saveSchedule")
    .addEventListener("click", async () => {

        const modal =
            document.getElementById("scheduleModal");

        const workDate =
            modal.dataset.date;

        const assignments = [];


        employees.forEach(employee => {

            const select =
                document.getElementById(`shift-${employee.id}`);

            if (!select) {
                return;
            }


            const value =
                select.value;


            if (value === "OFF") {

                assignments.push({
                    employee_id: employee.id,
                    assignment_type: "OFF",
                    shift_id: null
                });

            } else {

                assignments.push({
                    employee_id: employee.id,
                    assignment_type: "SHIFT",
                    shift_id: Number(value)
                });
            }
        });


        try {

            const response =
                await fetch(
                    `${API_URL}/api/employee_schedule`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            work_date: workDate,
                            assignments: assignments
                        })
                    }
                );


            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(
                errorData.detail || "Could not save schedule."
                     );
                }


            await loadSchedule();

            renderCalendar();


            modal.classList.remove("show");


            alert("Schedule saved successfully.");

        } catch (error) {
            console.error("Error saving schedule:", error);

            alert(
                 error.message ||
                     "Could not save schedule."
                      );
            }

    });


// ------------------------------------
// CLOSE MODAL
// ------------------------------------

document
    .getElementById("closeModal")
    .addEventListener("click", () => {

        document
            .getElementById("scheduleModal")
            .classList.remove("show");
    });


document
    .getElementById("scheduleModal")
    .addEventListener("click", (event) => {

        if (event.target.id === "scheduleModal") {

            event.target.classList.remove("show");
        }
    });


// ------------------------------------
// PREVIOUS MONTH
// ------------------------------------

document
    .getElementById("prevMonth")
    .addEventListener("click", () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();
    });


// ------------------------------------
// NEXT MONTH
// ------------------------------------

document
    .getElementById("nextMonth")
    .addEventListener("click", () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();
    });


// ------------------------------------
// START APPLICATION
// ------------------------------------

loadScheduleData();

// LOAD ABSENCES

async function loadAbsences() {

    try {

        const response = await fetch(
            `${API_URL}/api/employee_absences`
        );

        if (!response.ok) {
            throw new Error("Could not load absences");
        }

        absences = await response.json();

    } catch (error) {

        console.error(
            "Error loading absences:",
            error
        );

        alert("Could not load employee absences.");
    }
}

