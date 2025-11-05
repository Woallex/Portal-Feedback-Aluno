(function() {
  const API_BASE = 'http://127.0.0.1:5000';
  const container = document.getElementById('resultadosContainer');

  function getParametro(nome) {
    const params = new URLSearchParams(window.location.search);
    return params.get(nome);
  }

  const termo = getParametro('nome');
  if (!termo) {
    container.innerHTML = '<p>Nenhum termo de busca informado.</p>';
    return;
  }

  fetch(`${API_BASE}/buscarreclamacao?nome=${encodeURIComponent(termo)}`)
    .then(r => r.json())
    .then(resp => {
      if (!resp.ok) {
        container.innerHTML = `<p>Erro: ${resp.error?.message || 'Erro desconhecido'}</p>`;
        return;
      }
      const dados = resp.data;
      if (!dados || dados.length === 0) {
        container.innerHTML = `<p>Nenhuma reclamação encontrada para "<strong>${termo}</strong>".</p>`;
        return;
      }

      const html = dados.map(c => `
        <div class="card-publicacao mb-3 p-3 shadow-sm rounded">
          <h6>${c.titulo}</h6>
          <p>${c.corpo}</p>
          <p class="categoria-info"><strong>Categoria:</strong> ${c.categoria}</p>
          <p class="autor-info"><strong>Autor:</strong> ${c.autor}</p>
          <p class="data-info">${c.data}</p>
        </div>
      `).join('');
      container.innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = '<p>Erro ao buscar reclamações. Verifique se o servidor está ativo.</p>';
    });
})();
