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

document.getElementById("formPublicacao").addEventListener("submit", async function (event) {
  event.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const corpo = document.getElementById("descricao").value.trim();
  const categoria = document.getElementById("categoria").value;
  const token = localStorage.getItem("token") || "";

  if (titulo.length > 0 && corpo.length >= 10 && categoria) {
    try {
      const response = await fetch("http://127.0.0.1:5000/reclamacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, corpo, categoria })
      });

      const result = await response.json();
      if (!result.ok) throw new Error("Erro ao criar publicação");

      const novaPublicacao = result.data;

      if (favorito) {
        await fetch(`http://127.0.0.1:5000/favoritos/${novaPublicacao.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
      }

      alert("Publicação realizada com sucesso!");
      window.location.href = "home.html";

    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Não foi possível publicar.");
    }

  } else {
    alert("Preencha todos os campos corretamente.");
  }
});
