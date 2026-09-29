//simulator-login-client1-documents

// Check if login exists

// Function to read the value of a specific cookie
function getCookieValue1(cookieName) {
    const cookies = document.cookie.split("; "); // Split stored cookies
    for (let cookie of cookies) {
        const [name, value] = cookie.split("="); // Split the cookie name and value
        if (name === cookieName) {
            return value;
        }
    }
    return null; // Return null if the cookie is not found
}

// Helper function to get the value of a cookie by its name
function getCookieValue2(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to get a cookie value by name
function getCookieValue(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length)); // Use decodeURIComponent
        }
    }
    return null;
}

document.addEventListener("DOMContentLoaded", () => {
    const loanCookie = getCookieValue("loanData");

    if (loanCookie) {
        try {
            const data = JSON.parse(loanCookie); // Use JSON.parse to convert the JSON string into an object
            console.log("Cookie data:", data);
            console.log("Amount:", data.amount); // Updated from "value" to "amount"
            console.log("Duration:", data.duration);
            console.log("Installment:", data.installment);
            console.log("Interest Amount:", data.interestAmount);

        } catch (error) {
            console.error("Error parsing JSON cookie:", error);
        }
    } else {
        console.log("Cookie not found!");
    }
});

/*
// Executes when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Reads the "loan" cookie
    console.log("Available cookies:", document.cookie);
    const loanCookie = getCookieValue("loanData");

    if (loanCookie) {
        // Split the values in the "loan" cookie
        const values = loanCookie.split(","); // Split by value delimiters
        const data = {};

        // Iterate over key-value pairs
        values.forEach((item) => {
            const [key, value] = item.split("="); // Split key and value
            data[key] = value; // Store in the object
        });

        // Display the values in the console
        console.log("Value:", data.value); // E.g., 10000
        console.log("Duration:", data.duration); // E.g., 12
        console.log("Installment:", data.installment); // E.g., 900
        console.log("Interest Amount:", data.interestAmount); // E.g., 800

        // You can use these values to update the interface or logic
        //document.getElementById("valueLabel").textContent = `Value: ${data.value} €`;
        //document.getElementById("durationLabel").textContent = `Duration: ${data.duration} months`;
    } else {
        console.log("Cookie not found!");
    }
});

*/

//##############################################################################################
//##############################################################################################
//##############################################################################################

// Retrieve loanData cookie values from the simulator

// Retrieve login cookie values from login-client1

const income = document.getElementById("income");
const expenses = document.getElementById("expenses");

// Select the button by ID ---------------------------------------------------------
const btnMLR = document.getElementById("mlr");

// Add the click event for MLR -------------------------------------------------
btnMLR.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    console.log("MLR button clicked"); // Logger to check when button is clicked

    try {
        const data = {
            income: income.value,
            expenses: expenses.value,
        };

        // Check if required fields are filled
        if (!data.income || !data.expenses) {
            alert("Please fill in all required fields: income and expenses.");
            return;
        }
        
        const response = await fetch(document_url, { // Use the document_url variable
            method: 'POST',
            headers: {
                "Content-Type": "application/json",  // Envia como JSON
                'X-CSRFToken': getCookieValue('csrftoken') // Get the CSRF Token from the cookie
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const result = await response.json();
            console.log("Backend response:", result);
        } else {
            const text = await response.text();
            console.error("Unexpected response format:", text);
            alert("An unexpected response format was received from the server.");
        }
    } catch (error) {
        if (error instanceof TypeError) {
            console.error("Network error:", error);
            alert("A network error occurred. Please check your connection and try again.");
        } else {
            console.error("Error:", error);
            alert("An error occurred while sending data to the backend.");
        }
    }
});
