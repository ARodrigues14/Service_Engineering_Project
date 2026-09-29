document.addEventListener("DOMContentLoaded", () => {
    // Read label values -------------------------------------------------------------
    // Changed "value" to "amount" in the ID references

    // Select the button by ID ---------------------------------------------------------
    const btnRequestCredit = document.getElementById("requestCredit");

    // Add the click event
    btnRequestCredit.addEventListener("click", (event) => {
        const amountLabel = document.getElementById("amount"); // Updated from "value" to "amount"
        const durationLabel = document.getElementById("duration");
        const installmentLabel = document.getElementById("installment");
        const interestLabel = document.getElementById("amount-interest"); // Updated from "value-interest" to "amount-interest"

        if (amountLabel && durationLabel && installmentLabel && interestLabel) {
            // Save the values in a cookie
            saveValuesInCookie(
                parseFloat(amountLabel.innerText.replace(",", ".")), // Convert to number
                durationLabel.innerText.trim(), // Remove unnecessary spaces
                parseFloat(installmentLabel.innerText.replace(",", ".")),
                parseFloat(interestLabel.innerText.replace(",", "."))
            );
        } else {
            console.error("One or more elements not found");
        }
    });

    //--------------------------------------------------------------------------------------

    // Function to create a cookie
    function createCookie(name, amount, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + encodeURIComponent(amount) + expires + "; path=/; SameSite=Strict"; // Added encodeURIComponent and SameSite
    }

    // Function to save information in a cookie
    function saveValuesInCookie(amount, duration, installment, interestAmount) {
        const data = {
            amount: amount.toFixed(2).replace(".", ","), // Format as a string with two decimal places
            duration,
            installment: installment.toFixed(2).replace(".", ","),
            interestAmount: interestAmount.toFixed(2).replace(".", ","),
        };

        createCookie("loanData", JSON.stringify(data), 1); // Expires in 1 day
        console.log("Cookie created:", document.cookie);
    }
});
