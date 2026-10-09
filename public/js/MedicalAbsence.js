async function loadEmployees() {

    try {

        const response = await fetch(
            `${API_URL}/api/schedule_employees`
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
    .getElementById("medicalAbsenceForm")
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

            const response =
                await fetch(
                    `${API_URL}/api/medical_absences`,
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

                const errorData =
                    await response.json();

                throw new Error(
                    errorData.detail ||
                    "Could not save medical absence."
                );
            }


            const result =
                await response.json();

            alert(result.message);


            document
                .getElementById("medicalAbsenceForm")
                .reset();


        } catch (error) {

            console.error(
                "Error saving medical absence:",
                error
            );

            alert(error.message);
        }

    });


loadEmployees();