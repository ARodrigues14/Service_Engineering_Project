const dataEmp = document.getElementById("data");
const nome= document.getElementById("nome");
const valor = document.getElementById("valor");
const duracao = document.getElementById("duracao");
const prestacao = document.getElementById("prestacao");
const estado = document.getElementById("estado");   
const entrevistaSelect = document.getElementById("entrevistaSelect");  
const bME = document.getElementById("bME");                                  
const interview_date= document.getElementById("interview-date");     
const final_decision= document.getElementById("final-decision");  
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


    //vai buscar cookie
    const loginCookie = getCookieValue("dadosUser1");

    try {
        const data1 = JSON.parse(loginCookie); // Usar JSON.parse para converter a string JSON em objeto
        console.log("Dados do cookie:", data1);
        console.log("Face ID:", data1.face_id);  
        console.log("userName:", data1.userInput);

        face_id=data1.face_id;
        nome.innerText=data1.userInput;

    } catch (error) {
        console.error("Erro ao analisar o cookie JSON:", error);
    }


    //vaibuscarback
    //const apiUrl = "http://localhost:8000/api/loans/"; // URL da API
    
    const apiUrl = "";    //falta aqui--------------------------------------------  por no html????
    
    fetch(`${apiUrl}${faceId}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        //poe valores nas boxes
        dataEmp.innerText = data.dataEmp;
        valor.innerText = data.valorInicial;
        duracao.innerText = data.duracao;
        prestacao.innerText = data.prestacao;
        estado.innerText = data.status;

        //habilitar ou desabilitar o select
        if (data.status === "pending") {
            entrevistaSelect.disabled = false; // Desabilita se o status for "pending"
            bME.disabled=false;
        } else {
            entrevistaSelect.disabled = true; // Habilita para outros valores
            bME.disabled=true;
            // Popula o <select> com as opções
            populateSelect();
        }


      })
      .catch(error => {
        console.error("Fetch error:", error);
        document.getElementById("output").textContent = "User not found or an error occurred.";
      });




});


//---------------------------------------   click no btn marcar entrevista ------------------------------

bME.addEventListener("click", async (event) => {

    //por a escolha do select no label da entrevista
    // Obtém o valor selecionado no <select>
    const selectedDate = entrevistaSelect.value;
     // Atualiza o texto do <label> com o valor selecionado
    interview_date.textContent = `Selected Date: ${selectedDate}`;

    

    //update da BD com data da entrevista
    fetch(`/update-interview/${face_id}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken, // Adicione o token CSRF se necessário
        },
        body: JSON.stringify({ interview_date: selectedDate }),
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Failed to update interview date");
    })
    .then((data) => {
        alert(data.message); // Exibe mensagem de sucesso
    })
    .catch((error) => {
        console.error(error);
        alert("An error occurred: " + error.message);
    });


});



// -------------------------------------   click no btn logout --------------------------------------------
bLogout.addEventListener("click", async (event) => {

    // Apagar o cookie "dadosUser1"
    deleteCookie("dadosUser1");


    //redirecionar para a pagina index
    window.location.href = "/index";


});

//---------------------------------------- apagar cookie --------------------------------------------------
function deleteCookie(cookieName) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

//---------------------------------------------------Select   ---------------------------------------------
//para por as datas no select
// Função para formatar a data no formato DD-MM-YYYY:HH:mm
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year}:${hours}:${minutes}h`;
}

// Função para adicionar opções ao <select>
function populateSelect() {
    // Obtém a data atual
    const now = new Date();

    // Opção 1: Hoje às 9:00 (se ainda for antes das 9:00, senão pula)
    const today9AM = new Date();
    today9AM.setHours(9, 0, 0, 0);

    if (now < today9AM) {
        const option1 = document.createElement('option');
        option1.value = today9AM.toISOString(); // Mantém o valor em ISO para uso no backend
        option1.textContent = formatDate(today9AM);
        entrevistaSelect.appendChild(option1);
    }

    // Opção 2: Amanhã às 10:00
    const tomorrow10AM = new Date();
    tomorrow10AM.setDate(now.getDate() + 1);
    tomorrow10AM.setHours(10, 0, 0, 0);

    const option2 = document.createElement('option');
    option2.value = tomorrow10AM.toISOString();
    option2.textContent = formatDate(tomorrow10AM);
    entrevistaSelect.appendChild(option2);

    // Opção 3: Dia seguinte do seguinte às 11:00
    const dayAfterTomorrow11AM = new Date();
    dayAfterTomorrow11AM.setDate(now.getDate() + 2);
    dayAfterTomorrow11AM.setHours(11, 0, 0, 0);

    const option3 = document.createElement('option');
    option3.value = dayAfterTomorrow11AM.toISOString();
    option3.textContent = formatDate(dayAfterTomorrow11AM);
    entrevistaSelect.appendChild(option3);
}



