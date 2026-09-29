// Seleciona o formulário e o botão
const form = document.getElementById("login-agente");

form.addEventListener("click", (event) => {
    event.preventDefault();  // Previne o envio tradicional do formulário

    // Coleta os dados do formulário
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Cria um objeto com os dados do login
    const data = {
        username: username,
        password: password,
        csrfmiddlewaretoken: csrfToken,
    };
    console.log(data);
    // Envia a solicitação AJAX (usando fetch)
    fetch(loginUrl, {  // Use a variável `loginUrl` gerada pelo Django
        method: "POST",
        headers: {
            "Content-Type": "application/json",  // Envia como JSON
            "X-CSRFToken": csrfToken,  // Adiciona o CSRF token no cabeçalho
        },
        body: JSON.stringify(data),  // Transforma os dados em JSON
    })
    .then(response => {
        if (!response.ok) {
            // Caso o login falhe, exibe a mensagem de erro
            document.getElementById("error-message").style.display = "block";
            return Promise.reject("Login failed");
        }
        return response.json();  // Caso contrário, retorna a resposta JSON
    })
    .then(data => {
        if (data.token) {
            // Se o login for bem-sucedido, armazena o token no localStorage ou Cookie
            localStorage.setItem("authToken", data.token);

            // Redireciona para a próxima página
            window.location.href = "/dashboard-agent.html";  // Alterar para a URL desejada
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
