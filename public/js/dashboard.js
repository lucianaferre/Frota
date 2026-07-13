async function loadDashboard() {
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = '<div class="skeleton-loading">Carregando...</div>';
  
  try {
    const [viaturas, kpis, ordens] = await Promise.all([
      apiCall('/viaturas'),
      apiCall('/kpis'),
      apiCall('/ordens')
    ]);
    
    const emOperacao = viaturas.filter(v => v.status === 'Em operação').length;
    const emManutencao = viaturas.filter(v => v.status === 'Em manutenção').length;
    const indisponivel = viaturas.filter(v => v.status === 'Indisponível').length;
    
    const proximasRevisoes = viaturas.filter(v => {
      const proxima = new Date(v.proximaRevisao);
      const hoje = new Date();
      const dias = Math.floor((proxima - hoje) / (1000 * 60 * 60 * 24));
      return dias <= 30 && dias > 0;
    }).length;
    
    const manutencaoVencida = viaturas.filter(v => {
      const proxima = new Date(v.proximaRevisao);
      return proxima < new Date();
    }).length;
    
    pageContent.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
      </div>
      
      <!-- KPI Cards -->
      <div class="grid grid-4">
        <div class="kpi-card">
          <div class="kpi-icon">🚔</div>
          <div class="kpi-label">Total de Viaturas</div>
          <div class="kpi-value">${viaturas.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🟢</div>
          <div class="kpi-label">Em Operação</div>
          <div class="kpi-value">${emOperacao}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🟡</div>
          <div class="kpi-label">Em Manutenção</div>
          <div class="kpi-value">${emManutencao}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-label">Próximas Revisões</div>
          <div class="kpi-value">${proximasRevisoes}</div>
        </div>
      </div>
      
      <!-- Charts Row -->
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Disponibilidade da Frota</h3>
          </div>
          <div class="chart-container">
            <canvas id="chartDisponibilidade"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Custos de Manutenção</h3>
          </div>
          <div class="chart-container">
            <canvas id="chartCustos"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Map and Latest Maintenance -->
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Localização das Viaturas</h3>
          </div>
          <div id="map"></div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Últimas Manutenções</h3>
          </div>
          <div id="latestMaintenance"></div>
        </div>
      </div>
      
      <!-- Alerts Timeline -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Alertas Críticos</h3>
        </div>
        <div id="alertsTimeline"></div>
      </div>
    `;
    
    // Initialize map
    setTimeout(() => {
      initDashboardMap(viaturas);
      createCharts(viaturas, ordens, kpis);
      displayLatestMaintenance(ordens);
      displayAlerts(viaturas, ordens, manutencaoVencida);
    }, 100);
    
  } catch (error) {
    pageContent.innerHTML = '<h1>Erro ao carregar dashboard</h1>';
  }
}

function initDashboardMap(viaturas) {
  const mapElement = document.getElementById('map');
  if (!mapElement || window.dashboardMap) return;
  
  const map = L.map('map').setView([-26.9124, -48.7600], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  viaturas.forEach(v => {
    const color = v.status === 'Em operação' ? 'green' : v.status === 'Em manutenção' ? 'orange' : 'red';
    L.circleMarker([v.localizacao.lat, v.localizacao.lng], {
      radius: 8,
      fillColor: color,
      color: color,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup(`<b>${v.numero}</b><br>${v.status}<br>${v.placa}`).addTo(map);
  });
  
  window.dashboardMap = map;
}

function createCharts(viaturas, ordens, kpis) {
  // Availability Chart
  const ctxDisp = document.getElementById('chartDisponibilidade');
  if (ctxDisp && ctxDisp.getContext) {
    new Chart(ctxDisp, {
      type: 'doughnut',
      data: {
        labels: ['Em Operação', 'Em Manutenção', 'Indisponível'],
        datasets: [{
          data: [
            viaturas.filter(v => v.status === 'Em operação').length,
            viaturas.filter(v => v.status === 'Em manutenção').length,
            viaturas.filter(v => v.status === 'Indisponível').length
          ],
          backgroundColor: ['#2ECC71', '#F39C12', '#E74C3C']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
  
  // Costs Chart
  const ctxCustos = document.getElementById('chartCustos');
  if (ctxCustos && ctxCustos.getContext) {
    const custosPorViatura = viaturas.map(v => ({
      viatura: v.numero,
      custo: ordens.filter(o => o.viaturaId === v.id).reduce((acc, o) => acc + o.custo, 0)
    }));
    
    new Chart(ctxCustos, {
      type: 'bar',
      data: {
        labels: custosPorViatura.map(c => c.viatura),
        datasets: [{
          label: 'Custo (R$)',
          data: custosPorViatura.map(c => c.custo),
          backgroundColor: '#1B4F72'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function displayLatestMaintenance(ordens) {
  const container = document.getElementById('latestMaintenance');
  const ultimas = ordens.slice(-5);
  
  container.innerHTML = ultimas.map(o => `
    <div class="card" style="margin-bottom: 10px; margin-top: 10px;">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <strong>${o.numero}</strong><br>
          ${o.problema}
        </div>
        <div style="text-align: right;">
          <span class="status-badge ${getStatusColor(o.status)}">${o.status}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function displayAlerts(viaturas, ordens, manutencaoVencida) {
  const container = document.getElementById('alertsTimeline');
  const alerts = [];
  
  if (manutencaoVencida > 0) {
    alerts.push({ tipo: 'Manutenção Vencida', count: manutencaoVencida, severity: 'error' });
  }
  
  const ordensAbertas = ordens.filter(o => o.status === 'Aberta').length;
  if (ordensAbertas > 0) {
    alerts.push({ tipo: 'Ordens Abertas', count: ordensAbertas, severity: 'warning' });
  }
  
  const indisponivel = viaturas.filter(v => v.status === 'Indisponível').length;
  if (indisponivel > 0) {
    alerts.push({ tipo: 'Viaturas Indisponíveis', count: indisponivel, severity: 'error' });
  }
  
  container.innerHTML = alerts.map(a => `
    <div style="padding: 15px; border-left: 4px solid ${a.severity === 'error' ? '#E74C3C' : '#F39C12'}; background-color: ${a.severity === 'error' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(243, 156, 18, 0.1)'}; margin-bottom: 10px; border-radius: 4px;">
      <strong>${a.tipo}</strong>: ${a.count} evento(s)
    </div>
  `).join('');
}
