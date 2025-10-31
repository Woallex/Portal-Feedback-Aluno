document.getElementById("dataAtual").value = new Date().toLocaleDateString("pt-BR");

const estrela = document.getElementById("estrela");
let favorito = false;

estrela.addEventListener("click", () => {
  favorito = !favorito;
  estrela.classList.toggle("favorito");
  estrela.textContent = favorito ? "★" : "☆";
});

document.getElementById("descartar").addEventListener("click", () => {
  document.getElementById("formPublicacao").reset();
  estrela.classList.remove("favorito");
  estrela.textContent = "☆";
  window.location.href = "home.html";
});


document.getElementById("formPublicacao").addEventListener("submit", function (event) {
  event.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const categoria = document.getElementById("categoria").value;
  const data = document.getElementById("dataAtual").value;

  if (titulo.length > 0 && descricao.length >= 10 && categoria) {
    const publicacao = {
      titulo,
      descricao,
      categoria,
      data,
      favorito
    };

    alert("Publicação realizada com sucesso!");
    window.location.href = "home.html";
  } else {
    alert("Preencha todos os campos corretamente.");
  }
});
