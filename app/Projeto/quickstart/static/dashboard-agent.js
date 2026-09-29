const code = document.getElementById("code");
const loan_date = document.getElementById("loan_date");
const clientName = document.getElementById("clientName");
const valor = document.getElementById("valor");
const duration = document.getElementById("duration");
const payment = document.getElementById("payment");

const checkbox1 = document.getElementById("checkbox1");
const checkbox2 = document.getElementById("checkbox2");

const checkbox11 = document.getElementById("checkbox11");
const checkbox12 = document.getElementById("checkbox12");
const checkbox13 = document.getElementById("checkbox13");

const checkbox31 = document.getElementById("checkbox31");
const checkbox32 = document.getElementById("checkbox32");

const btnCalculate = document.getElementById("btnCalculate");
const date_interview = document.getElementById("date_interview");

const btnOK = document.getElementById("btnOK");
const btnCancel = document.getElementById("btnCancel");
const btnEnviar = document.getElementById("btnEnviar");


const tableDiv = document.getElementById("tabela");
var agent;

//---------------------------------------   cookies -------------------------------------------------------------
function getCookieValue(nome) {
    const nomeEQ = nome + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nomeEQ) === 0) {
            return decodeURIComponent(cookie.substring(nomeEQ.length, cookie.length)); // Usar decodeURIComponent
        }
    }
    return null;
}



//----------------------------------------- Load da página ------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    //vai buscar cookie
    const loginCookie = getCookieValue("dadosAgente");
    try {
        const data1 = JSON.parse(loginCookie); // Usar JSON.parse para converter a string JSON em objeto
        console.log("Dados do cookie:", data1);
        console.log("Face ID:", data1.face_id);  

        agent=data1.userInput;

    } catch (error) {
        console.error("Erro ao analisar o cookie JSON:", error);
    }

    //faz tabela

    //porque so ha o agent com cod=1
    const idAgent=1;
    //chama a funcao buidTable
    buildTable(1);

    fetch('/loan-requests/')
        .then(response => response.json())
        .then(data => {
            const tableDiv = document.getElementById("tabela");
            tableDiv.innerHTML = `
                <div class="table-header">
                    <div class="col col-checkbox">Check</div>
                    <div class="col col-name">Code</div>
                    <div class="col col-date">Date</div>
                    <div class="col col-status">Status</div>
                    <div class="col col-action">Actions</div>
                </div>
            `;
            data.forEach(item => {
                const row = document.createElement("div");
                row.classList.add("table-row");
                row.innerHTML = `
                    <div class="col col-checkbox"><input type="checkbox" data-id="${item.id}" data-code="${item.id}"></div>
                    <div class="col col-name">${item.id}</div>
                    <div class="col col-date">${new Date(item.loan_date).toLocaleDateString()}</div>
                    <div class="col col-status"><span class="badge ${getStatusClass(item.status)}">${item.status}</span></div>
                    <div class="col col-action"><button class="btn btn-sm btn-primary" onclick="editLoanRequest(${item.id})">Edit</button></div>
                `;
                tableDiv.appendChild(row);
            });

            // Add event listeners to checkboxes
            const checkboxes = tableDiv.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener("click", (event) => {
                    const selectedIds = getSelectedCheckboxes();
                    // Realize uma ação com os IDs selecionados, como enviar para a API
                    console.log("Enviar IDs:", selectedIds);
                });
            });
        })
        .catch(error => console.error('Error fetching loan requests:', error));

});

function getSelectedCheckboxes() {
    const selectedIds = [];
    const checkedCheckboxes = tableDiv.querySelectorAll('input[type="checkbox"]:checked');
    checkedCheckboxes.forEach(checkbox => {
        selectedIds.push(checkbox.getAttribute("data-id"));
    });
    console.log("Selected IDs:", selectedIds);
    return selectedIds;
}

document.addEventListener("DOMContentLoaded", () => {
    // Function to track selected radio button status
    const trackSelectedStatus = () => {
        const radios = document.querySelectorAll('input[name="status"]');

        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                // Get the ID of the selected radio button
                const selectedStatus = radio.id;
                console.log('Selected status:', selectedStatus);

                // Here you can update your application state or perform other actions based on the selected status
            });
        });
    };

    // Call the function to initialize the event listeners
    trackSelectedStatus();
});

//----------------------------------------- construir tabela ------------------------------------------------------
// Função para buscar dados da API e construir a tabela
const checkboxState = {}; // Object to keep track of checkbox states

// When building the table
async function buildTable(idAgent) {
    try {
        fetch('loan-requests')  
            .then(response => response.json())
            .then(data => {
                tableDiv.innerHTML = `
                    <div class="table-header">
                        <div class="col col-checkbox">Check</div>
                        <div class="col col-name">Code</div>
                        <div class="col col-date">Date</div>
                        <div class="col col-status">Status</div>
                        <div class="col col-action">Actions</div>
                    </div>
                `;

                data.forEach(item => {
                    const row = document.createElement("div");
                    row.classList.add("table-row");

                    const isChecked = checkboxState[item.id] || false;

                    row.innerHTML = `
                        <div class="col col-checkbox">
                            <input type="checkbox" data-id="${item.id}" data-code="${item.id}" ${isChecked ? 'checked' : ''}>
                        </div>
                        <div class="col col-name">${item.id}</div>
                        <div class="col col-date">${new Date(item.loan_date).toLocaleDateString()}</div>
                        <div class="col col-status">
                            <span class="badge ${getStatusClass(item.status)}">${item.status}</span>
                        </div>
                        <div class="col col-action">
                            <button class="btn btn-sm btn-primary" data-id="${item.id}">Edit</button>
                        </div>
                    `;

                    tableDiv.appendChild(row);

                    // Attach event listener to checkbox
                    const checkbox = row.querySelector('input[type="checkbox"]');
                    checkbox.addEventListener("click", (event) => {
                        checkboxState[item.id] = checkbox.checked; // Update state
                        const selectedIds = getSelectedCheckboxes();
                        console.log("Enviar IDs:", selectedIds);
                    });

                    // Attach event listener to the Edit button
                    const editButton = row.querySelector('.btn.btn-sm.btn-primary');
                    editButton.addEventListener('click', () => {
                        editLoanRequest(item.id); // Call the edit function with the item's ID
                    });
                });
            })
            .catch(error => console.error("Erro ao carregar os dados:", error));
    } catch (error) {
        console.error("Error building table:", error);
    }
}

// Função para obter a classe CSS de status
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case "approved":
            return "bg-success";
        case "rejected":
            return "bg-warning text-dark";
        case "pending":
            return "bg-danger text-dark";
        default:
            return "bg-secondary";
    }
}

function editLoanRequest(id) {
    fetch(`/loan-requests/?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const loan = data[0]; // Access the first element of the array
                console.log("Loan request details:", loan);

                document.getElementById("loan-details").style.display = "block";
                document.getElementById("code").textContent = loan.id;
                document.getElementById("loan_date").textContent = new Date(loan.loan_date).toLocaleDateString();
                document.getElementById("clientName").textContent = loan.face_id;
                document.getElementById("valor").textContent = `${loan.initial_amount} €`;
                document.getElementById("duration").textContent = loan.duration;
                document.getElementById("payment").textContent = `${loan.installment} €`;
                document.getElementById("date_interview").textContent = loan.interview_datetime
                    ? new Date(loan.interview_datetime).toLocaleDateString()
                    : "N/A";

                // Update status checkboxes
                const pending= document.getElementById("Pending");//checked = loan.status === "pending";
                const solved= document.getElementById("Solved");//checked = loan.status === "solved";

                const check11= document.getElementById("checkbox11");
                const check12= document.getElementById("checkbox12");
                const check13= document.getElementById("checkbox13");


                check11.checked=false;
                check12.checked=false;
                check13.checked=false;
                pending.checked=false;
                solved.checked=false;



                if (loan.status === "Approved") {
                    check11.checked = true;
                    solved.checked = true;
                } else if (loan.status === "Interview Requested") {
                    check12.checked = true;
                    solved.checked = false;
                } else if (loan.status === "Rejected") {
                    check13.checked = true;
                    solved.checked = true;
                }

                check11.disabled=true;
                check12.disabled=true;
                check13.disabled=true;
                pending.disabled=true;
                solved.disabled=true;


            } else {
                console.error("No loan request found with the specified ID.");
            }
        })
        .catch(error => console.error('Error fetching loan request details:', error));
}

// Função para formatar a data
function formatDate(dateString) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
}




//-------------------------------------------------------------------------------------------------
// ----------------------------   btn CALCULAR -------------------------
document.addEventListener("DOMContentLoaded", () => {
    const dateDisplayDiv = document.getElementById("dateDisplay");
    const btnCalculate = document.getElementById("btnCalculate");
    const dateModal = new bootstrap.Modal(document.getElementById("dateModal"));
    const modalDateList = document.getElementById("modalDateList");

    btnCalculate.addEventListener("click", async (event) => {
        // Clear previous dates
        modalDateList.innerHTML = '';

        // Generate dates
        const today = new Date();
        const datesToDisplay = [
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),  // Tomorrow
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),  // In 7 days
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)  // In 30 days
        ];

        // Display the dates in the modal
        datesToDisplay.forEach((date, index) => {
            const dateElement = document.createElement("button");
            dateElement.textContent = `Date ${index + 1}: ${date.toLocaleDateString()}`;
            dateElement.classList.add("btn", "btn-outline-primary", "d-block", "w-100", "mt-2");
            dateElement.onclick = () => {
                // Update the date_interview label with the selected date
                document.getElementById("date_interview").textContent = date.toLocaleDateString("pt-BR"); // Use pt-BR format
                dateModal.hide(); // Close the modal
            };
            modalDateList.appendChild(dateElement);
        });

        // Show the modal
        dateModal.show();
    });
});


// ----------------------------   btn OK-------------------------
btnOK.addEventListener("click", async (event) => {


});


// ----------------------------   btn Enviar-------------------------
btnEnviar.addEventListener("click", async (event) => {


});
