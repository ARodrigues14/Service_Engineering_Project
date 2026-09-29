// Function to read the value of a specific cookie
function getCookieValue(cookieName) {
    const cookies = document.cookie.split("; "); // Split stored cookies
    for (let cookie of cookies) {
        const [name, value] = cookie.split("="); // Split cookie name and value
        if (name === cookieName) {
            return decodeURIComponent(value); // Return decoded value
        }
    }
    return null; // Return null if cookie not found
}

// Executes when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Read the "loanData" cookie

    console.log("Available cookies:", document.cookie);

    const loanCookie = getCookieValue("loanData");
    
    if (loanCookie) {
        try {
            // Convert JSON string back to an object
            const data = JSON.parse(loanCookie);

            // Display values in the console
            console.log("Amount:", data.amount); // Ex.: 10000
            console.log("Duration:", data.duration); // Ex.: 12
            console.log("Installment:", data.installment); // Ex.: 900
            console.log("Interest Amount:", data.interestAmount); // Ex.: 800

            // Update page elements with cookie values
            document.getElementById("amount2").textContent = `Amount: ${data.amount} €`;
            document.getElementById("duration2").textContent = `Duration: ${data.duration} months`;
            document.getElementById("installment2").textContent = `Installment: ${data.installment} €`;
            document.getElementById("interest-amount2").textContent = `Interest Amount: ${data.interestAmount} €`;
        } catch (error) {
            console.error("Error processing the cookie:", error);
        }
    } else {
        console.log("Cookie not found!");
    }
});