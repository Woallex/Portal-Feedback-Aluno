document.getElementById("btnSair").addEventListener("click", function () {
  localStorage.removeItem("userEmail");
  window.location.href = "entrada.html";
});

const toggleBtn = document.getElementById("toggleMenu");
const menuAcoes = document.getElementById("menuAcoes");

toggleBtn.addEventListener("click", () => {
  menuAcoes.classList.toggle("hidden");
});

function criarPublicacao() {
  window.location.href = "criar-publicacao.html";
}


function verFavoritos() {
  window.location.href = "favoritos.html";
}

function renderizarPublicacoes() {
  const categorias = [
  "Infraestrutura",
  "Alimentação",
  "Transporte",
  "Limpeza",
  "TI/Portais",
  "Acadêmico",
  "Eventos/Calendário",
  "Segurança"
];
  const publicacoes = JSON.parse(localStorage.getItem("publicacoes")) || [];

  const container = document.createElement("div");
  container.classList.add("container", "mt-4");

  categorias.forEach(categoria => {
    const secao = document.createElement("div");
    secao.classList.add("categoria-section");

    const titulo = document.createElement("h5");
    titulo.textContent = categoria;
    titulo.classList.add("categoria-title");
    secao.appendChild(titulo);

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const scrollContainer = document.createElement("div");
    scrollContainer.classList.add("card-scroll-container");

    const filtradas = publicacoes
      .filter(p => p.categoria === categoria)
      .sort((a, b) => b.favorito - a.favorito);

    filtradas.forEach(pub => {
      const card = document.createElement("div");
      card.classList.add("card-publicacao");

      const tituloPub = document.createElement("h6");
      tituloPub.textContent = pub.titulo;

      const descricao = document.createElement("div");
      descricao.classList.add("descricao");
      descricao.textContent = pub.descricao;

      const categoriaInfo = document.createElement("div");
      categoriaInfo.classList.add("categoria-info");
      categoriaInfo.textContent = `Categoria: ${pub.categoria}`;

      const autor = document.createElement("div");
      autor.classList.add("autor-info");
      autor.textContent = `Publicado por: ${localStorage.getItem("userEmail") || "Usuário"}`;

      const data = document.createElement("div");
      data.classList.add("data-info");
      data.textContent = `Data: ${pub.data}`;


      const estrela = document.createElement("span");
      estrela.classList.add("estrela");
      if (pub.favorito) estrela.classList.add("favorito");
      estrela.textContent = pub.favorito ? "★" : "☆";

      estrela.addEventListener("click", () => {
        const posicaoReal = publicacoes.findIndex(p =>
          p.titulo === pub.titulo &&
          p.descricao === pub.descricao &&
          p.categoria === pub.categoria &&
          p.data === pub.data
        );

        if (posicaoReal !== -1) {
          publicacoes[posicaoReal].favorito = !publicacoes[posicaoReal].favorito;
          localStorage.setItem("publicacoes", JSON.stringify(publicacoes));
          location.reload();
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

    const btnDireita = document.createElement("button");
    btnDireita.classList.add("seta-navegacao", "seta-direita");
    btnDireita.innerHTML = "›";

    const btnEsquerda = document.createElement("button");
    btnEsquerda.classList.add("seta-navegacao", "seta-esquerda");
    btnEsquerda.innerHTML = "‹";

    btnDireita.onclick = () => {
      scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
    };

    btnEsquerda.onclick = () => {
      scrollContainer.scrollBy({ left: -300, behavior: "smooth" });
    };

    scrollContainer.addEventListener("scroll", () => {
      btnEsquerda.style.display = scrollContainer.scrollLeft > 0 ? "block" : "none";
    });


    setTimeout(() => {
      const temOverflow = scrollContainer.scrollWidth > scrollContainer.clientWidth;
      if (temOverflow) {
        wrapper.appendChild(btnDireita);
        wrapper.appendChild(btnEsquerda);
      }
    }, 100);

    wrapper.appendChild(scrollContainer);
    secao.appendChild(wrapper);
    container.appendChild(secao);
  });

  document.body.appendChild(container);
}

renderizarPublicacoes();