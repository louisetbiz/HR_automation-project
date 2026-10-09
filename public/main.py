from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://louisetbiz.github.io"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Employee(BaseModel):
    first_name: str
    last_name: str
    birth_date: str
    nationality: str
    email: str
    ss_num: str
    phone: str
    iban: str
    contract_hours: int
    initial_date: str
    sector: str


@app.get("/")
def home():
    return {"message": "HR Project API is working!"}


@app.get("/test-db")
def test_database():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
       user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    connection.close()

    return {"message": "MySQL connection works!"}


@app.post("/api/employee_data")
def create_employee(employee_data: Employee):
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor()

    sql = """
        INSERT INTO employee_data (
            first_name,
            last_name,
            birth_date,
            nationality,
            email,
            ss_num,
            phone,
            iban,
            contract_hours,
            initial_date,
            sector
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        employee_data.first_name,
        employee_data.last_name,
        employee_data.birth_date,
        employee_data.nationality,
        employee_data.email,
        employee_data.ss_num,
        employee_data.phone,
        employee_data.iban,
        employee_data.contract_hours,
        employee_data.initial_date,
        employee_data.sector
    )

    cursor.execute(sql, values)
    connection.commit()

    employee_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "message": "Employee saved successfully",
        "employee_id": employee_id
    }


@app.get("/api/employee_data")
def get_employees():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM employee_data")

    employees = cursor.fetchall()

    cursor.close()
    connection.close()

    return employees

@app.get("/api/schedule_employees")
def get_schedule_employees():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            first_name,
            last_name,
            sector
        FROM employee_data
        ORDER BY first_name, last_name
    """)

    rows = cursor.fetchall()

    cursor.close()
    connection.close()

    employees = []

    for row in rows:
        employees.append({
            "id": row["id"],
            "name": f'{row["first_name"]} {row["last_name"]}',
            "sector": row["sector"]
        })

    return employees

@app.get("/api/shift_types")
def get_shift_types():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            name,
            TIME_FORMAT(start_time, '%H:%i') AS start_time,
            TIME_FORMAT(end_time, '%H:%i') AS end_time,
            sector
        FROM shift_types
        ORDER BY sector, start_time
    """)

    shifts = cursor.fetchall()

    cursor.close()
    connection.close()

    return shifts

@app.get("/api/employee_schedule")
def get_employee_schedule():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            es.id,
            es.employee_id,
            es.work_date,
            es.assignment_type,
            es.shift_id,
            st.start_time,
            st.end_time
        FROM employee_schedule es
        LEFT JOIN shift_types st
            ON es.shift_id = st.id
        ORDER BY es.work_date, es.employee_id
    """)

    schedule = cursor.fetchall()

    cursor.close()
    connection.close()

    for row in schedule:
        if row["work_date"]:
            row["work_date"] = row["work_date"].isoformat()

        if row["start_time"]:
            row["start_time"] = str(row["start_time"]).split(":")
            row["start_time"] = f"{int(row['start_time'][0]):02d}:{row['start_time'][1]}"

        if row["end_time"]:
            row["end_time"] = str(row["end_time"])[:5]

    return schedule


@app.post("/api/employee_schedule")
def save_employee_schedule(data: dict):
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor()

    work_date = data["work_date"]
    assignments = data["assignments"]

    for assignment in assignments:

        employee_id = assignment["employee_id"]
        assignment_type = assignment["assignment_type"]
        shift_id = assignment.get("shift_id")

        # Check whether the employee has an approved absence
        cursor.execute("""
            SELECT id
            FROM employee_absences
            WHERE employee_id = %s
              AND start_date <= %s
              AND end_date >= %s
        """, (
            employee_id,
            work_date,
            work_date
        ))

        absence = cursor.fetchone()

        if absence and assignment_type == "SHIFT":
            connection.rollback()

            cursor.close()
            connection.close()

            raise HTTPException(
                status_code=400,
                detail="Employee has an approved absence on this date."
            )

        cursor.execute("""
            INSERT INTO employee_schedule
                (employee_id, work_date, assignment_type, shift_id)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                assignment_type = VALUES(assignment_type),
                shift_id = VALUES(shift_id)
        """, (
            employee_id,
            work_date,
            assignment_type,
            shift_id
        ))

    connection.commit()

    cursor.close()
    connection.close()

    return {"message": "Schedule saved successfully"}

@app.post("/api/vacation_requests")
def create_vacation_request(data: dict):

    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor()

    try:

        start_date = data["start_date"]
        end_date = data["end_date"]

        # ------------------------------------------------
        # VALIDATE DATES
        # ------------------------------------------------

        from datetime import date

        today = date.today()

        if start_date < today.isoformat():
            raise HTTPException(
                status_code=400,
                detail="Vacation cannot start before today."
            )

        if end_date < start_date:
            raise HTTPException(
                status_code=400,
                detail="End date cannot be before start date."
            )


        # ------------------------------------------------
        # CREATE VACATION REQUEST
        # ------------------------------------------------

        cursor.execute("""
            INSERT INTO vacation_requests
                (employee_id, start_date, end_date)
            VALUES (%s, %s, %s)
        """, (
            data["employee_id"],
            start_date,
            end_date
        ))

        connection.commit()

        return {
            "message": "Vacation request submitted successfully"
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception:
        connection.rollback()
        raise

    finally:

        cursor.close()
        connection.close()
    
    
    # VACATION REQUEST 

#VACATION REQUEST    
@app.get("/api/vacation_requests")
def get_vacation_requests():

    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
            SELECT
                vr.id,
                vr.employee_id,
                CONCAT(
                    ed.first_name,
                    ' ',
                    ed.last_name
                ) AS employee_name,
                vr.start_date,
                vr.end_date,
                vr.status,
                vr.request_date,
                vr.reviewed_date
            FROM vacation_requests vr
            INNER JOIN employee_data ed
                ON vr.employee_id = ed.id
            WHERE vr.status = 'PENDING'
            ORDER BY vr.request_date DESC
        """)

    requests = cursor.fetchall()

    cursor.close()
    connection.close()

    for request in requests:

        if request["start_date"]:
            request["start_date"] = request["start_date"].isoformat()

        if request["end_date"]:
            request["end_date"] = request["end_date"].isoformat()

        if request["request_date"]:
            request["request_date"] = request["request_date"].isoformat()

        if request["reviewed_date"]:
            request["reviewed_date"] = request["reviewed_date"].isoformat()

    return requests

# VACATION APPROVAL
@app.put("/api/vacation_requests/{request_id}")
def update_vacation_request(request_id: int, data: dict):

    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor(dictionary=True)

    try:

        # Get the specific vacation request
        cursor.execute("""
            SELECT
                id,
                employee_id,
                start_date,
                end_date,
                status
            FROM vacation_requests
            WHERE id = %s
        """, (request_id,))

        request = cursor.fetchone()

        if not request:
            raise HTTPException(
                status_code=404,
                detail="Vacation request not found"
            )


        # ------------------------------------------------
        # EDIT VACATION DATES
        # ------------------------------------------------

        if "start_date" in data and "end_date" in data:

            if request["status"] != "PENDING":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending vacation requests can be edited."
                )

            new_start_date = data["start_date"]
            new_end_date = data["end_date"]

            if new_end_date < new_start_date:
                raise HTTPException(
                    status_code=400,
                    detail="End date cannot be before start date."
                )

            cursor.execute("""
                UPDATE vacation_requests
                SET
                    start_date = %s,
                    end_date = %s
                WHERE id = %s
            """, (
                new_start_date,
                new_end_date,
                request_id
            ))

            connection.commit()

            return {
                "message": "Vacation dates updated successfully"
            }


        # ------------------------------------------------
        # APPROVE / REJECT
        # ------------------------------------------------

        if "status" in data:

            status = data["status"]

            if status not in ["APPROVED", "REJECTED"]:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid vacation request status"
                )

            if request["status"] != "PENDING":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending vacation requests can be approved or rejected."
                )


            cursor.execute("""
                UPDATE vacation_requests
                SET
                    status = %s,
                    reviewed_date = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (
                status,
                request_id
            ))


            # If approved, create the actual absence
            if status == "APPROVED":

                cursor.execute("""
                    INSERT INTO employee_absences
                        (
                            employee_id,
                            absence_type,
                            start_date,
                            end_date,
                            vacation_request_id
                        )
                    VALUES
                        (%s, 'VACATION', %s, %s, %s)
                """, (
                    request["employee_id"],
                    request["start_date"],
                    request["end_date"],
                    request_id
                ))


            connection.commit()

            return {
                "message": "Vacation request updated successfully"
            }


        raise HTTPException(
            status_code=400,
            detail="No valid update data provided."
        )


    except HTTPException:
        connection.rollback()
        raise

    except Exception:
        connection.rollback()
        raise

    finally:

        cursor.close()
        connection.close()

# VACATION SENT TO CALENDAR
@app.get("/api/employee_absences")
def get_employee_absences():

    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            ea.id,
            ea.employee_id,
            CONCAT(
                ed.first_name,
                ' ',
                ed.last_name
            ) AS employee_name,
            ea.absence_type,
            ea.start_date,
            ea.end_date
        FROM employee_absences ea
        INNER JOIN employee_data ed
            ON ea.employee_id = ed.id
        ORDER BY ea.start_date, ea.employee_id
    """)

    absences = cursor.fetchall()

    cursor.close()
    connection.close()

    for absence in absences:

        if absence["start_date"]:
            absence["start_date"] = (
                absence["start_date"].isoformat()
            )

        if absence["end_date"]:
            absence["end_date"] = (
                absence["end_date"].isoformat()
            )

    return absences

# MEDICAL ABSENCES
@app.post("/api/medical_absences")
def create_medical_absence(data: dict):

    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    cursor = connection.cursor()

    try:

        cursor.execute("""
            INSERT INTO employee_absences
                (
                    employee_id,
                    absence_type,
                    start_date,
                    end_date
                )
            VALUES
                (%s, 'MEDICAL_ABSENCE', %s, %s)
        """, (
            data["employee_id"],
            data["start_date"],
            data["end_date"]
        ))

        connection.commit()

        return {
            "message": "Medical absence saved successfully"
        }

    except Exception:

        connection.rollback()
        raise

    finally:

        cursor.close()
        connection.close()