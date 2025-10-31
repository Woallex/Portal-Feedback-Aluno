document.getElementById("btnSair").addEventListener("click", function () {
  localStorage.removeItem("userEmail");
  window.location.href = "entrada.html";
});

document.getElementById("btnVoltar").addEventListener("click", function () {
  window.location.href = "home.html";
});

const container = document.getElementById("favoritosContainer");
const publicacoes = JSON.parse(localStorage.getItem("publicacoes")) || [];
const favoritos = publicacoes.filter(p => p.favorito);

if (favoritos.length === 0) {
  container.innerHTML = "<p class='text-center mt-4'>Nenhuma publicação favoritada.</p>";
} else {
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
    descricao.textContent = pub.descricao;

    const categoriaInfo = document.createElement("div");
    categoriaInfo.classList.add("meta");
    categoriaInfo.textContent = `Categoria: ${pub.categoria}`;

    const autor = document.createElement("div");
    autor.classList.add("meta");
    autor.textContent = `Publicado por: ${localStorage.getItem("userEmail") || "Usuário"}`;

    const data = document.createElement("div");
    data.classList.add("meta");
    data.textContent = `Data: ${pub.data}`;

    const estrela = document.createElement("span");
    estrela.classList.add("estrela", "favorito");
    estrela.textContent = "★";

    estrela.addEventListener("click", () => {
      const posicaoReal = publicacoes.findIndex(p =>
        p.titulo === pub.titulo &&
        p.descricao === pub.descricao &&
        p.categoria === pub.categoria &&
        p.data === pub.data
      );

      if (posicaoReal !== -1) {
        publicacoes[posicaoReal].favorito = false;
        localStorage.setItem("publicacoes", JSON.stringify(publicacoes));
        card.remove();
        if (scrollContainer.children.length === 0) {
          container.innerHTML = "<p class='text-center mt-4'>Nenhuma publicação favoritada.</p>";
        }
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
