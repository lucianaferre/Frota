async function loadOrdens() {
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = '<div class="skeleton-loading">Carregando...</div>';
  
  try {
    const [ordens, viaturas] = await Promise.all([
      apiCall('/ordens'),
      apiCall('/viaturas')
    ]);
    
    const viaturaSelect = document.getElementById('viaturaSelect');
    if (viaturaSelect) {
      viaturaSelect.innerHTML = viaturas.map(v => 
        `<option value="${v.id}">${v.numero} - ${v.placa}</option>`
      ).join('');
    }
    
    pageContent.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Ordens de Serviço</h1>
        <button class="btn btn-primary" onclick="openModal('ordemModal')">
          <i class="fas fa-plus"></i> Nova Ordem
        </button>
      </div>
      
      <div class="filter-bar">
        <input type="text" class="filter-input" id="filterOrdens" placeholder="Buscar por número ou viatura...">
        <select class="filter-input" id="filterStatusOrdem">
          <option value="">Todos os Status</option>
          <option value="Aberta">Aberta</option>
          <option value="Em andamento">Em Andamento</option>
          <option value="Finalizada">Finalizada</option>
        </select>
      </div>
      
      <div class="table-container">
        <table id="ordensTable">
          <thead>
            <tr>
              <th>Número OS</th>
              <th>Data</th>
              <th>Viatura</th>
              <th>Problema</th>
              <th>Status</th>
              <th>Custo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="ordensBody"></tbody>
        </table>
      </div>
    `;
    
    displayOrdens(ordens, viaturas);
    setupOrdenFilters(ordens, viaturas);
    
  } catch (error) {
    pageContent.innerHTML = '<h1>Erro ao carregar ordens</h1>';
  }
}

function displayOrdens(ordens, viaturas) {
  const tbody = document.getElementById('ordensBody');
  
  tbody.innerHTML = ordens.map(o => {
    const viatura = viaturas.find(v => v.id === o.viaturaId);
    return `
      <tr>
        <td><strong>${o.numero}</strong></td>
        <td>${formatTableDate(o.data)}</td>
        <td>${viatura ? viatura.numero : 'N/A'}</td>
        <td>${o.problema}</td>
        <td><span class="status-badge ${getStatusColor(o.status)}">${o.status}</span></td>
        <td>${formatCurrency(o.custo)}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="viewOrdem('${o.id}'); event.stopPropagation();">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="editOrdem('${o.id}'); event.stopPropagation();">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function setupOrdenFilters(ordens, viaturas) {
  const filterInput = document.getElementById('filterOrdens');
  const filterStatus = document.getElementById('filterStatusOrdem');
  
  const applyFilters = () => {
    const searchTerm = filterInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    
    const filtered = ordens.filter(o => {
      const viatura = viaturas.find(v => v.id === o.viaturaId);
      const matchesSearch = o.numero.toLowerCase().includes(searchTerm) ||
                          (viatura && viatura.numero.toLowerCase().includes(searchTerm));
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    displayOrdens(filtered, viaturas);
  };
  
  filterInput.addEventListener('input', applyFilters);
  filterStatus.addEventListener('change', applyFilters);
}

async function viewOrdem(id) {
  const ordem = await apiCall(`/ordens/${id}`);
  if (!ordem) return;
  
  alert(`Ordem: ${ordem.numero}\nProblema: ${ordem.problema}\nCusto: ${formatCurrency(ordem.custo)}\nStatus: ${ordem.status}`);
}

async function editOrdem(id) {
  const ordem = await apiCall(`/ordens/${id}`);
  if (!ordem) return;
  
  const form = document.getElementById('ordemForm');
  form.viaturaId.value = ordem.viaturaId;
  form.problema.value = ordem.problema;
  form.servicoExecutado.value = ordem.servicoExecutado;
  form.responsavel.value = ordem.responsavel;
  form.pecas.value = Array.isArray(ordem.pecas) ? ordem.pecas.join(', ') : ordem.pecas;
  form.custo.value = ordem.custo;
  form.tempoParada.value = ordem.tempoParada;
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      viaturaId: formData.get('viaturaId'),
      problema: formData.get('problema'),
      servicoExecutado: formData.get('servicoExecutado'),
      responsavel: formData.get('responsavel'),
      pecas: formData.get('pecas').split(',').map(p => p.trim()),
      custo: parseFloat(formData.get('custo')),
      tempoParada: parseInt(formData.get('tempoParada')),
      status: 'Em andamento'
    };
    
    const result = await apiCall(`/ordens/${id}`, 'PUT', data);
    if (result) {
      showToast('Ordem atualizada com sucesso!');
      closeModal('ordemModal');
      loadOrdens();
    }
  };
  
  openModal('ordemModal');
}

document.addEventListener('DOMContentLoaded', () => {
  const ordemForm = document.getElementById('ordemForm');
  if (ordemForm) {
    ordemForm.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(ordemForm);
      const data = {
        viaturaId: formData.get('viaturaId'),
        problema: formData.get('problema'),
        servicoExecutado: formData.get('servicoExecutado'),
        responsavel: formData.get('responsavel'),
        pecas: formData.get('pecas').split(',').map(p => p.trim()),
        custo: parseFloat(formData.get('custo')),
        tempoParada: parseInt(formData.get('tempoParada')),
        status: 'Aberta'
      };
      
      const result = await apiCall('/ordens', 'POST', data);
      if (result) {
        showToast('Ordem de serviço criada com sucesso!');
        closeModal('ordemModal');
        ordemForm.reset();
        loadOrdens();
      }
    };
  }
});