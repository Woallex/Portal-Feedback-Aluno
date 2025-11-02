document.getElementById("btnSair").addEventListener("click", function () {
  localStorage.removeItem("userEmail");
  localStorage.removeItem("token");
  window.location.href = "entrada.html";
});

document.getElementById("btnVoltar").addEventListener("click", function () {
  window.location.href = "home.html";
});


const container = document.getElementById("favoritosContainer");
const userEmail = localStorage.getItem("userEmail");

async function carregarFavoritos() {
  try {
    const response = await fetch("http://127.0.0.1:5000/favoritos", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    const result = await response.json();
    if (!result.ok || result.data.length === 0) {
      container.innerHTML = "<p class='text-center mt-4'>Nenhuma publicação favoritada.</p>";
      return;
    }

    renderizarFavoritos(result.data, userEmail);
  } catch (error) {
    console.error("Erro ao carregar favoritos:", error);
    container.innerHTML = "<p class='text-center mt-4'>Erro ao carregar favoritos.</p>";
  }
}

function renderizarFavoritos(favoritos, userEmail) {
  const secao = document.createElement("div");
  secao.classList.add("categoria-section");

  const scrollContainer = document.createElement("div");
  scrollContainer.classList.add("card-scroll-container");

  favoritos.forEach(pub => {
    const card = document.createElement("div");
    card.classList.add("card-publicacao");

    const tituloPub = document.createElement("h6");
    tituloPub.textContent = pub.titulo;

    const descricao = document.createElement("div");
    descricao.classList.add("descricao");
    descricao.textContent = pub.corpo;

    const categoriaInfo = document.createElement("div");
    categoriaInfo.classList.add("meta");
    categoriaInfo.textContent = `Categoria: ${pub.categoria}`;

    const autor = document.createElement("div");
    autor.classList.add("meta");
    autor.textContent = `Publicado por: ${userEmail.split("@")[0]}`;

    const data = document.createElement("div");
    data.classList.add("meta");
    data.textContent = `Data: ${pub.data}`;

    const estrela = document.createElement("span");
    estrela.classList.add("estrela", "favorito");
    estrela.textContent = "★";
    estrela.style.cursor = "pointer";

    estrela.addEventListener("click", async () => {
      try {
        const desfav = await fetch(`http://127.0.0.1:5000/favoritos/${pub.id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });

        const resultado = await desfav.json();
        if (!resultado.ok) throw new Error("Erro ao desfavoritar");

        card.remove();
        if (scrollContainer.children.length === 0) {
          container.innerHTML = "<p class='text-center mt-4'>Nenhuma publicação favoritada.</p>";
        }
      } catch (error) {
        console.error("Erro ao desfavoritar:", error);
        alert("Não foi possível desfavoritar.");
      }
    });

    const header = document.createElement("div");
    header.classList.add("d-flex", "justify-content-between", "align-items-start", "mb-2");
    header.appendChild(tituloPub);
    header.appendChild(estrela);

    card.appendChild(header);
    card.appendChild(descricao);
    card.appendChild(categoriaInfo);
    card.appendChild(autor);
    card.appendChild(data);
    scrollContainer.appendChild(card);
  });

  secao.appendChild(scrollContainer);
  container.appendChild(secao);
}

carregarFavoritos();
