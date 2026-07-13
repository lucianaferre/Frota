const API_URL = 'http://localhost:3000/api';

// Global state
let currentPage = 'dashboard';
let userData = {
  id: 'user-1',
  nome: 'Luciana Ferre',
  cargo: 'Administrador',
  nivel: 'admin'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadPage('dashboard');
});

function setupEventListeners() {
  // Menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      loadPage(page);
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Menu toggle
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.querySelector('.sidebar').classList.toggle('hidden');
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
  }

  // Modal close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = btn.dataset.closeModal;
      closeModal(modalId);
    });
  });

  // Modals close on outside click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      // Search functionality will be implemented per page
    });
  }

  // Load theme preference
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
  }
}

function loadPage(page) {
  currentPage = page;
  const pageContent = document.getElementById('pageContent');
  
  switch(page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'viaturas':
      loadViaturas();
      break;
    case 'manutencao':
      loadManutencao();
      break;
    case 'ordens':
      loadOrdens();
      break;
    case 'historico':
      loadHistorico();
      break;
    case 'rastreamento':
      loadRastreamento();
      break;
    case 'indicadores':
      loadIndicadores();
      break;
    case 'relatorios':
      loadRelatorios();
      break;
    case 'usuarios':
      loadUsuarios();
      break;
    case 'configuracoes':
      loadConfiguracoes();
      break;
    default:
      pageContent.innerHTML = '<h1>Página não encontrada</h1>';
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    showToast('Erro ao comunicar com servidor', 'error');
    return null;
  }
}

// Utility functions
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatPercentage(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
}

function getStatusColor(status) {
  switch(status) {
    case 'Em operação': return 'status-operacao';
    case 'Em manutenção': return 'status-manutencao';
    case 'Indisponível': return 'status-indisponivel';
    case 'Aberta': return 'status-aberta';
    case 'Em andamento': return 'status-andamento';
    case 'Finalizada': return 'status-finalizada';
    default: return '';
  }
}

function getStatusIcon(status) {
  switch(status) {
    case 'Em operação': return '🟢';
    case 'Em manutenção': return '🟡';
    case 'Indisponível': return '🔴';
    default: return '⚪';
  }
}

function getColorDot(value) {
  if (value >= 80) return '<span class="color-dot color-green"></span>';
  if (value >= 50) return '<span class="color-dot color-yellow"></span>';
  return '<span class="color-dot color-red"></span>';
}

function formatTableDate(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}
