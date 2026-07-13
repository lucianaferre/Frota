async function loadIndicadores() {
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = '<div class="skeleton-loading">Carregando...</div>';
  
  try {
    const kpis = await apiCall('/kpis');
    
    pageContent.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Indicadores de Desempenho</h1>
      </div>
      
      <div class="grid grid-4" style="margin-bottom: 30px;">
        <div class="kpi-card">
          <div class="kpi-icon">📊</div>
          <div class="kpi-label">Disponibilidade</div>
          <div class="kpi-value">${kpis.disponibilidade}%</div>
          <div class="kpi-trend">Meta: 85%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⏱️</div>
          <div class="kpi-label">MTTR (Tempo Médio Reparo)</div>
          <div class="kpi-value">${kpis.tempoMedioReparo}h</div>
          <div class="kpi-trend">Meta: 8h</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">🔧</div>
          <div class="kpi-label">MTBF (Entre Falhas)</div>
          <div class="kpi-value">N/A</div>
          <div class="kpi-trend">Calculando...</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-label">Custo por Viatura</div>
          <div class="kpi-value">${formatCurrency(kpis.custoPorViatura)}</div>
          <div class="kpi-trend">Mês atual</div>
        </div>
      </div>
      
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Distribuição das Viaturas</h3>
          </div>
          <div class="chart-container">
            <canvas id="chartDistribuicao"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Custo Acumulado</h3>
          </div>
          <div class="chart-container">
            <canvas id="chartCustoAcumulado"></canvas>
          </div>
        </div>
      </div>
      
      <div class="card" style="margin-top: 20px;">
        <div class="card-header">
          <h3 class="card-title">Resumo de Status</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
          <div style="padding: 20px; background-color: #d4edda; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #155724;">${kpis.emOperacao}</div>
            <div style="color: #155724;">Em Operação</div>
          </div>
          <div style="padding: 20px; background-color: #fff3cd; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #856404;">${kpis.emManutenção}</div>
            <div style="color: #856404;">Em Manutenção</div>
          </div>
          <div style="padding: 20px; background-color: #f8d7da; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #721c24;">${kpis.indisponível}</div>
            <div style="color: #721c24;">Indisponível</div>
          </div>
          <div style="padding: 20px; background-color: #cce5ff; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #004085;">${kpis.totalViaturas}</div>
            <div style="color: #004085;">Total</div>
          </div>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      createIndicadorCharts(kpis);
    }, 100);
    
  } catch (error) {
    pageContent.innerHTML = '<h1>Erro ao carregar indicadores</h1>';
  }
}

function createIndicadorCharts(kpis) {
  // Distribution Chart
  const ctxDistribuicao = document.getElementById('chartDistribuicao');
  if (ctxDistribuicao && ctxDistribuicao.getContext) {
    new Chart(ctxDistribuicao, {
      type: 'doughnut',
      data: {
        labels: ['Em Operação', 'Em Manutenção', 'Indisponível'],
        datasets: [{
          data: [kpis.emOperacao, kpis.emManutenção, kpis.indisponível],
          backgroundColor: ['#2ECC71', '#F39C12', '#E74C3C'],
          borderColor: ['#27ae60', '#e67e22', '#c0392b'],
          borderWidth: 2
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Accumulated Cost Chart
  const ctxCustoAcumulado = document.getElementById('chartCustoAcumulado');
  if (ctxCustoAcumulado && ctxCustoAcumulado.getContext) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const custos = [1200, 1500, 1800, 1600, 2100, 1900];
    
    new Chart(ctxCustoAcumulado, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label: 'Custo Mensal (R$)',
          data: custos,
          borderColor: '#1B4F72',
          backgroundColor: 'rgba(27, 79, 114, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointBackgroundColor: '#1B4F72'
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }
}