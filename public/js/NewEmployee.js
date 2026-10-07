const form = document.getElementById("employeeForm");
    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        
        const employee = {
            first_name: document.getElementById("first_name").value,
            last_name: document.getElementById("last_name").value,
            birth_date: document.getElementById("birth_date").value,
            nationality: document.getElementById("nationality").value,
            email: document.getElementById("email").value,
            ss_num: document.getElementById("ss_num").value,
            phone: document.getElementById("Phone").value,
            iban: document.getElementById("IBAN").value,
            contract_hours: parseInt(
                document.getElementById("contract_hours").value
            ),
            initial_date: document.getElementById("initial_date").value,
            sector: document.getElementById("sector").value
        };

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/employee_data",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(employee)
                }
            );

            const result = await response.json();

            if (response.ok) {
                alert("Employee saved successfully! ID: " + result.employee_id);
                form.reset();
            } else {
                alert("Error: " + (result.detail || "Could not save employee."));
            }

        } catch (error) {
            console.error(error);
            alert("Could not connect to the server.");
        }
    });

