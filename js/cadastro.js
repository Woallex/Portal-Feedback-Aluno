document.getElementById("cadastroForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: email, senha: password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert("Erro ao cadastrar: " + errorText);
      return;
    }

    const data = await response.json();
    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor.");
  }
});
