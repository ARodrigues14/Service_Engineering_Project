const dataEmp = document.getElementById("data");
const nome = document.getElementById("nome");
const valor = document.getElementById("valor");
const duracao = document.getElementById("duracao");
const prestacao = document.getElementById("prestacao");
const estado = document.getElementById("estado");
const entrevistaSelect = document.getElementById("entrevistaSelect");
const bME = document.getElementById("bME");
const interview_date = document.getElementById("interview-date");
const final_decision = document.getElementById("final-decision");
const bLogout = document.getElementById("logout");
var face_id;

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
    // Vai buscar cookie
    const loginCookie = getCookieValue("userData1");

    try {
        const data1 = JSON.parse(loginCookie); // Usar JSON.parse para converter a string JSON em objeto
        console.log("Dados do cookie:", loginCookie);
        console.log("Face ID:", data1.face_id); // Corrigido aqui
        console.log("userName:", data1.userInput);

        face_id = data1.face_id;
        nome.innerText = data1.userInput;
    } catch (error) {
        console.error("Erro ao analisar o cookie JSON:", error);
    }

    try {
        console.log("Iniciando busca de empréstimos...");
        console.log("Face ID recebido:", face_id);
    
        fetch(`/api/emprestimos/?face_id=${face_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                console.log("Resposta recebida do servidor:", response);
                if (!response.ok) {
                    console.error("Erro HTTP:", response.status, response.statusText);
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Dados retornados pela API:", data);
                if (Array.isArray(data) && data.length > 0) {
                    const loan = data[0];
                    console.log("Detalhes do empréstimo:", loan);
    
                    // Preenche os valores no DOM
                    dataEmp.innerText = formatDate(loan.loan_date);
                    valor.innerText = `${loan.initial_amount} €`;
                    duracao.innerText = loan.duration;
                    prestacao.innerText = `${loan.installment} €`;
                    estado.innerText = loan.status;
    
                    // Aplica a classe de status no elemento de status
                    const statusClass = getStatusClass(loan.status);
                    console.log("Classe CSS aplicada ao status:", statusClass);
                    estado.className = statusClass;
    
                    // Habilitar ou desabilitar o select com base no status
                    if (loan.status.toLowerCase() === "pending") {
                        console.log("Status é 'pending'. Habilitando select e botão.");
                        entrevistaSelect.disabled = false;
                        bME.disabled = false;
                    } else {
                        console.log("Status não é 'pending'. Desabilitando select e botão.");
                        entrevistaSelect.disabled = true;
                        bME.disabled = true;
                    }
                } else {
                    console.warn("Nenhum detalhe de empréstimo encontrado para este Face ID.");
                    document.getElementById("output").textContent = "No loan details found for this face ID.";
                }
            })
            .catch(error => {
                console.error("Erro durante o fetch:", error.message);
                document.getElementById("output").textContent = "An error occurred while fetching loan details.";
            });
    } catch (error) {
        console.error("Erro ao buscar empréstimos (bloco try-catch):", error.message);
    } 
});

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

// Função para formatar a data
function formatDate(dateString) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
