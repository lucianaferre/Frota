async function loadViaturas() {
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = '<div class="skeleton-loading">Carregando...</div>';
  
  try {
    const viaturas = await apiCall('/viaturas');
    
    pageContent.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Gestão de Viaturas</h1>
        <button class="btn btn-primary" onclick="openModal('viaturaModal')">
          <i class="fas fa-plus"></i> Nova Viatura
        </button>
      </div>
      
      <div class="filter-bar">
        <input type="text" class="filter-input" id="filterViaturas" placeholder="Buscar por número, placa ou modelo...">
        <select class="filter-input" id="filterStatus">
          <option value="">Todos os Status</option>
          <option value="Em operação">Em Operação</option>
          <option value="Em manutenção">Em Manutenção</option>
          <option value="Indisponível">Indisponível</option>
        </select>
      </div>
      
      <div class="grid grid-2" id="viaturasGrid"></div>
    `;
    
    displayViaturas(viaturas);
    setupViaturaFilters(viaturas);
    
  } catch (error) {
    pageContent.innerHTML = '<h1>Erro ao carregar viaturas</h1>';
  }
}

function displayViaturas(viaturas) {
  const grid = document.getElementById('viaturasGrid');
  
  grid.innerHTML = viaturas.map(v => `
    <div class="card" onclick="selectViatura('${v.id}')" style="cursor: pointer;">
      <img src="${v.foto}" alt="${v.numero}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
      <div>
        <h3>${v.numero} - ${v.placa}</h3>
        <p><strong>Modelo:</strong> ${v.modelo} (${v.ano})</p>
        <p><strong>Km:</strong> ${v.quilometragem.toLocaleString('pt-BR')}</p>
        <p><strong>Unidade:</strong> ${v.unidade}</p>
        <p>
          <strong>Status:</strong>
          <span class="status-badge ${getStatusColor(v.status)}">${v.status}</span>
        </p>
        <div style="margin-top: 15px; display: flex; gap: 10px;">
          <button class="btn btn-sm btn-primary" onclick="editViatura('${v.id}'); event.stopPropagation();">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteViatura('${v.id}'); event.stopPropagation();">
            <i class="fas fa-trash"></i> Deletar
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function setupViaturaFilters(viaturas) {
  const filterInput = document.getElementById('filterViaturas');
  const filterStatus = document.getElementById('filterStatus');
  
  const applyFilters = () => {
    const searchTerm = filterInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    
    const filtered = viaturas.filter(v => {
      const matchesSearch = v.numero.toLowerCase().includes(searchTerm) ||
                          v.placa.toLowerCase().includes(searchTerm) ||
                          v.modelo.toLowerCase().includes(searchTerm);
      const matchesStatus = !statusFilter || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    displayViaturas(filtered);
  };
  
  filterInput.addEventListener('input', applyFilters);
  filterStatus.addEventListener('change', applyFilters);
}

async function selectViatura(id) {
  localStorage.setItem('selectedViaturaId', id);
  loadPage('historico');
}

async function editViatura(id) {
  const viatura = await apiCall(`/viaturas/${id}`);
  if (!viatura) return;
  
  const form = document.getElementById('viaturaForm');
  form.numero.value = viatura.numero;
  form.placa.value = viatura.placa;
  form.modelo.value = viatura.modelo;
  form.ano.value = viatura.ano;
  form.quilometragem.value = viatura.quilometragem;
  form.unidade.value = viatura.unidade;
  form.status.value = viatura.status;
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const result = await apiCall(`/viaturas/${id}`, 'PUT', data);
    if (result) {
      showToast('Viatura atualizada com sucesso!');
      closeModal('viaturaModal');
      loadViaturas();
    }
  };
  
  document.getElementById('viaturaModalTitle').textContent = 'Editar Viatura';
  openModal('viaturaModal');
}

async function deleteViatura(id) {
  if (confirm('Tem certeza que deseja deletar esta viatura?')) {
    const result = await apiCall(`/viaturas/${id}`, 'DELETE');
    if (result) {
      showToast('Viatura deletada com sucesso!');
      loadViaturas();
    }
  }
}