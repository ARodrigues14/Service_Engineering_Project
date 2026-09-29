// Select elements ---------------------------------------------------------
const btnLogin = document.getElementById("loginBtn");
const userInput = document.getElementById("usernameinput"); // Input for the username
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");

function createCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Strict"; // Added encodeURIComponent and SameSite
}

// Add an event to the file input
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Get the selected file
    
    if (file) {
        // Check if the file is an image
        if (file.type.startsWith('image/')) {
            // Create a temporary URL for the image and display it in the <img> element
            const fileReader = new FileReader();
            
            fileReader.onload = function (e) {
                preview.src = e.target.result; // Set the src of the image to the file content
            };
            
            fileReader.readAsDataURL(file); // Read the file as Data URL
        } else {
            alert('Please select a valid image file.');
        }
    } else {
        preview.src = '#'; // Clear the preview if no file is selected
    }
});

// Add the click event for Login -------------------------------------------------
btnLogin.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent the default button behavior
    
    const username = userInput.value.trim();
    const file = fileInput.files[0];
    
    if (!username || !file) {
        alert("Please, insert a username and select an image.");
        return;
    }

    // Create a FormData to send the data to the backend
    const formData = new FormData();
    formData.append("username", username);
    formData.append("file", file);

    try {
        // Make the request to the backend
        const response = await fetch('/login/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken') // Get the CSRF Token from the cookie
            }
        });

        // Add log to see the raw server response
        const responseText = await response.text(); // Capture the response as text
        console.log("Server Response:", responseText); // Check the response content in the console

        // Check if the response was successful (HTTP status 2xx)
        if (response.ok) {
            try {
                const data1 = JSON.parse(responseText); // Try to convert the response to JSON
                alert("Login successful!");
                console.log("Received Token:", data1.token);
                console.log("Received face ID:", data1.face_id);

                // Redirect or save the token as needed
                saveValuesInCookie(data1.token, userInput.value, data1.face_id);
                window.location.href = "documentos.html"; // Redirect to the documents page
            } catch (jsonError) {
                console.error("Error processing the response as JSON:", jsonError);
                alert("The server response is not in JSON format.");
            }
        } else {
            alert("Error trying to login: " + response.statusText);
        }
    } catch (error) {
        console.error("Request Error:", error);
        alert("Error trying to login.");
    }
});

// Function to get the CSRF Token from the cookie -----------------------------------------
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to save values in the cookie ---------------------------------------------
function saveValuesInCookie(token, userInput, face_id) {
    const data = {
        token,
        userInput,
        face_id,
    };
    createCookie("userData1", JSON.stringify(data), 1); // Expires in 1 day
    console.log("Cookie created:", document.cookie);
}