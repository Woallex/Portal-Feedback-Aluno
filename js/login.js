document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (email && password) {
    localStorage.setItem("userEmail", email);
    window.location.href = "home.html";
  } else {
    alert("Preencha todos os campos!");
  }
});
