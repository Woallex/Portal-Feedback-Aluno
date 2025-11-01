document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // mantém sessão Flask
      body: JSON.stringify({ login: email, senha: password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert("Erro ao fazer login: " + errorText);
      return;
    }

    const data = await response.json();

    // salva o ID e o login do usuário no localStorage
    localStorage.setItem("userId", data.id);
    localStorage.setItem("userEmail", data.login);

    alert("Login realizado com sucesso!");
    window.location.href = "home.html";
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor.");
  }
});
