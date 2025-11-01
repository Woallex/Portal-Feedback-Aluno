document.getElementById("loginForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ login: email, senha: password })
    });

    const result = await response.json();

    if (!result.ok) {
      alert(`Erro ao fazer login: ${JSON.stringify(result, null, 2)}`);
      return;
    }

    localStorage.setItem("userEmail", result.data.login);
    localStorage.setItem("userId", result.data.id);

    window.location.href = "home.html";
  } catch (error) {
    alert("Erro ao conectar com o servidor.");
  }
});
