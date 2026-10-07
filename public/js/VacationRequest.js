async function loadEmployees() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/schedule_employees"
        );

        if (!response.ok) {
            throw new Error("Could not load employees");
        }

        const employees = await response.json();

        const employeeSelect =
            document.getElementById("employee");

        employees.forEach(employee => {

            const option =
                document.createElement("option");

            option.value = employee.id;
            option.textContent = employee.name;

            employeeSelect.appendChild(option);
        });

    } catch (error) {

        console.error(
            "Error loading employees:",
            error
        );

        alert("Could not load employees.");
    }
}


document
    .getElementById("vacationForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();

        const employeeId =
            document.getElementById("employee").value;

        const startDate =
            document.getElementById("startDate").value;

        const endDate =
            document.getElementById("endDate").value;


        if (endDate < startDate) {

            alert(
                "End date cannot be before start date."
            );

            return;
        }


        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/vacation_requests",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        employee_id: Number(employeeId),
                        start_date: startDate,
                        end_date: endDate
                    })
                }
            );


            if (!response.ok) {
                throw new Error(
                    "Could not submit vacation request"
                );
            }


            const result =
                await response.json();


            alert(result.message);

            document
                .getElementById("vacationForm")
                .reset();


        } catch (error) {

            console.error(
                "Error submitting vacation request:",
                error
            );

            alert(
                "Could not submit vacation request."
            );
        }
    });


function setMinimumVacationDate() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    document
        .getElementById("startDate")
        .min = today;

    document
        .getElementById("endDate")
        .min = today;
}

document
    .getElementById("startDate")
    .addEventListener("change", function () {

        document
            .getElementById("endDate")
            .min = this.value;
    });
setMinimumVacationDate();
loadEmployees();