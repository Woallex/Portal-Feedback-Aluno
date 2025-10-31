document.getElementById("cadastroForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email && password) {

    alert("Cadastro realizado com sucesso!");
    window.location.href = "index.html";
  } else {
    alert("Preencha todos os campos!");
  }
});
