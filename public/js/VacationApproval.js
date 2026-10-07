async function loadVacationRequests() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/vacation_requests"
        );

        if (!response.ok) {
            throw new Error(
                "Could not load vacation requests"
            );
        }

        const requests = await response.json();

        const container =
            document.getElementById("requestsContainer");

        container.innerHTML = "";

        if (requests.length === 0) {

            container.textContent =
                "No vacation requests.";

            return;
        }

        requests.forEach(request => {

            const requestElement =
                document.createElement("div");

            requestElement.className =
                "vacation-request";

            requestElement.innerHTML = `
                <strong>${request.employee_name}</strong>

                <div>
                    ${request.start_date}
                    →
                    ${request.end_date}
                </div>

                <div>
                    Status: ${request.status}
                </div>

                ${
                    request.status === "PENDING"
                    ? `
                        <div class="vacation-actions">

                            <button
                                class="edit-button"
                                onclick="editRequest(
                                    ${request.id},
                                    '${request.start_date}',
                                    '${request.end_date}'
                                )">
                                Edit
                            </button>

                            <button
                                class="approve-button"
                                onclick="updateRequest(
                                    ${request.id},
                                    'APPROVED'
                                )">
                                Approve
                            </button>

                            <button
                                class="reject-button"
                                onclick="updateRequest(
                                    ${request.id},
                                    'REJECTED'
                                )">
                                Reject
                            </button>

                        </div>
                    `
                    : ""
                }
            `;

            container.appendChild(requestElement);
        });

    } catch (error) {

        console.error(
            "Error loading vacation requests:",
            error
        );

        document.getElementById(
            "requestsContainer"
        ).textContent =
            "Could not load vacation requests.";
    }
}


async function updateRequest(requestId, status) {

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/api/vacation_requests/${requestId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );

        if (!response.ok) {

            const errorData =
                await response.json();

            throw new Error(
                errorData.detail ||
                "Could not update vacation request."
            );
        }

        const result =
            await response.json();

        alert(result.message);

        await loadVacationRequests();

    } catch (error) {

        console.error(
            "Error updating vacation request:",
            error
        );

        alert(error.message);
    }
}


function editRequest(
    requestId,
    startDate,
    endDate
) {

    const newStartDate =
        prompt(
            "Enter the new start date (YYYY-MM-DD):",
            startDate
        );

    if (newStartDate === null) {
        return;
    }

    const newEndDate =
        prompt(
            "Enter the new end date (YYYY-MM-DD):",
            endDate
        );

    if (newEndDate === null) {
        return;
    }

    if (newEndDate < newStartDate) {

        alert(
            "End date cannot be before start date."
        );

        return;
    }

    updateVacationDates(
        requestId,
        newStartDate,
        newEndDate
    );
}


async function updateVacationDates(
    requestId,
    startDate,
    endDate
) {

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/api/vacation_requests/${requestId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
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
                "Could not update vacation dates."
            );
        }

        const result =
            await response.json();

        alert(result.message);

        await loadVacationRequests();

    } catch (error) {

        console.error(
            "Error updating vacation dates:",
            error
        );

        alert(error.message);
    }
}


loadVacationRequests();