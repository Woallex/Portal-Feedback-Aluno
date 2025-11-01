document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");

  if (!token) {
    window.location.href = "entrada.html";
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/reclamacoes", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (!result.ok) throw new Error("Erro ao buscar publicações");

    renderizarPublicacoes(result.data, userEmail);

  } catch (error) {
    console.error("Erro ao carregar publicações:", error);
    alert("Erro ao carregar publicações.");
  }
});


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

function renderizarPublicacoes(publicacoes, userEmail) {
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
      .sort((a, b) => (b.favorito || 0) - (a.favorito || 0));

    filtradas.forEach(pub => {
      const card = document.createElement("div");
      card.classList.add("card-publicacao");

      const tituloPub = document.createElement("h6");
      tituloPub.textContent = pub.titulo;

      const descricao = document.createElement("div");
      descricao.classList.add("descricao");
      descricao.textContent = pub.corpo;

      const categoriaInfo = document.createElement("div");
      categoriaInfo.classList.add("categoria-info");
      categoriaInfo.textContent = `Categoria: ${pub.categoria}`;

      const autor = document.createElement("div");
      autor.classList.add("autor-info");
      autor.textContent = `Publicado por: ${userEmail.split("@")[0]}`;

      const data = document.createElement("div");
      data.classList.add("data-info");
      data.textContent = `Data: ${pub.data}`;

      const estrela = document.createElement("span");
      estrela.classList.add("estrela");
      estrela.setAttribute("data-id", pub.id);
      estrela.textContent = pub.favorito ? "★" : "☆";

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