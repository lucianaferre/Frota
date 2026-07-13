async function loadRelatorios() {
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = '<div class="skeleton-loading">Carregando...</div>';
  
  try {
    const [viaturas, ordens] = await Promise.all([
      apiCall('/viaturas'),
      apiCall('/ordens')
    ]);
    
    pageContent.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Relatórios</h1>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Gerar Relatório</h3>
        </div>
        <form id="relatorioForm" style="padding: 20px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div class="form-group">
              <label>Data Inicial</label>
              <input type="date" id="dataInicial" value="${new Date(Date.now() - 90*24*60*60*1000).toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label>Data Final</label>
              <input type="date" id="dataFinal" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label>Tipo de Relatório</label>
              <select id="tipoRelatorio">
                <option value="disponibilidade">Disponibilidade da Frota</option>
                <option value="custos">Custos de Manutenção</option>
                <option value="viaturas">Histórico por Viatura</option>
                <option value="manutencao">Manutenções Vencidas</option>
                <option value="completo">Relatório Completo</option>
              </select>
            </div>
            <div class="form-group">
              <label>&nbsp;</label>
              <button type="button" class="btn btn-primary" onclick="gerarRelatorio()">
                <i class="fas fa-file-pdf"></i> Gerar
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <div id="relatorioContainer"></div>
    `;
    
    window.relatorioViaturas = viaturas;
    window.relatorioOrdens = ordens;
    
  } catch (error) {
    pageContent.innerHTML = '<h1>Erro ao carregar relatórios</h1>';
  }
}

async function gerarRelatorio() {
  const tipo = document.getElementById('tipoRelatorio').value;
  const dataInicial = document.getElementById('dataInicial').value;
  const dataFinal = document.getElementById('dataFinal').value;
  const container = document.getElementById('relatorioContainer');
  
  let conteudo = '';
  
  switch(tipo) {
    case 'disponibilidade':
      conteudo = gerarRelatorioDisponibilidade();
      break;
    case 'custos':
      conteudo = gerarRelatorioCustos();
      break;
    case 'viaturas':
      conteudo = gerarRelatorioViaturas();
      break;
    case 'manutencao':
      conteudo = gerarRelatorioManutencaoVencida();
      break;
    case 'completo':
      conteudo = gerarRelatorioCompleto();
      break;
  }
  
  container.innerHTML = `
    <div class="card" style="margin-top: 20px;">
      <div class="card-header">
        <h3 class="card-title">Resultado do Relatório</h3>
        <div>
          <button class="btn btn-sm btn-primary" onclick="exportarPDF('${tipo}')">
            <i class="fas fa-download"></i> PDF
          </button>
          <button class="btn btn-sm btn-secondary" onclick="exportarExcel('${tipo}')">
            <i class="fas fa-file-excel"></i> Excel
          </button>
          <button class="btn btn-sm btn-secondary" onclick="window.print()">
            <i class="fas fa-print"></i> Imprimir
          </button>
        </div>
      </div>
      <div style="padding: 20px;">
        ${conteudo}
      </div>
    </div>
  `;
}

function gerarRelatorioDisponibilidade() {
  const viaturas = window.relatorioViaturas;
  const total = viaturas.length;
  const disponivel = viaturas.filter(v => v.status === 'Em operação').length;
  const manutencao = viaturas.filter(v => v.status === 'Em manutenção').length;
  const indisponivel = viaturas.filter(v => v.status === 'Indisponível').length;
  const percentual = ((disponivel / total) * 100).toFixed(2);
  
  return `
    <h4>Relatório de Disponibilidade da Frota</h4>
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr style="background-color: #f8f9fa;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Quantidade</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Percentual</th>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 10px;">Em Operação</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${disponivel}</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${((disponivel/total)*100).toFixed(2)}%</td>
      </tr>
      <tr style="background-color: #f8f9fa;">
        <td style="border: 1px solid #ddd; padding: 10px;">Em Manutenção</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${manutencao}</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${((manutencao/total)*100).toFixed(2)}%</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 10px;">Indisponível</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${indisponivel}</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${((indisponivel/total)*100).toFixed(2)}%</td>
      </tr>
      <tr style="background-color: #e8f4f8; font-weight: bold;">
        <td style="border: 1px solid #ddd; padding: 10px;">Total</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${total}</td>
        <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">100%</td>
      </tr>
    </table>
    
    <p style="margin-top: 20px;"><strong>Disponibilidade Geral:</strong> ${percentual}%</p>
  `;
}

function gerarRelatorioCustos() {
  const ordens = window.relatorioOrdens;
  const custoTotal = ordens.reduce((acc, o) => acc + o.custo, 0);
  const media = ordens.length > 0 ? (custoTotal / ordens.length).toFixed(2) : 0;
  
  return `
    <h4>Relatório de Custos de Manutenção</h4>
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
      <div style="padding: 15px; background-color: #e8f4f8; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: #1B4F72;">${formatCurrency(custoTotal)}</div>
        <div>Custo Total</div>
      </div>
      <div style="padding: 15px; background-color: #f0f8e8; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: #2ECC71;">${formatCurrency(media)}</div>
        <div>Custo Médio por OS</div>
      </div>
      <div style="padding: 15px; background-color: #f8f0e8; border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: #F39C12;">${ordens.length}</div>
        <div>Total de Ordens</div>
      </div>
    </div>
    
    <h5 style="margin-top: 30px;">Detalhamento por Viatura:</h5>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tr style="background-color: #f8f9fa;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Viatura</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Ordens</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Custo Total</th>
      </tr>
      ${window.relatorioViaturas.map(v => {
        const ordensViatura = ordens.filter(o => o.viaturaId === v.id);
        const custoViatura = ordensViatura.reduce((acc, o) => acc + o.custo, 0);
        return `
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">${v.numero}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${ordensViatura.length}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(custoViatura)}</td>
          </tr>
        `;
      }).join('')}
    </table>
  `;
}

function gerarRelatorioViaturas() {
  const viaturas = window.relatorioViaturas;
  
  return `
    <h4>Relatório Detalhado de Viaturas</h4>
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr style="background-color: #f8f9fa;">
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Viatura</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Placa</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Status</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Km</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Próxima Revisão</th>
      </tr>
      ${viaturas.map(v => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">${v.numero}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${v.placa}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">
            <span class="status-badge ${getStatusColor(v.status)}">${v.status}</span>
          </td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${v.quilometragem.toLocaleString('pt-BR')}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${formatDate(v.proximaRevisao)}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function gerarRelatorioManutencaoVencida() {
  const viaturas = window.relatorioViaturas;
  const hoje = new Date();
  const vencidas = viaturas.filter(v => new Date(v.proximaRevisao) < hoje);
  
  return `
    <h4>Relatório de Manutenções Vencidas</h4>
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    <p><strong>Total de Viaturas Vencidas:</strong> ${vencidas.length}</p>
    
    ${vencidas.length === 0 ? '<p style="color: #2ECC71; font-weight: bold;">✓ Nenhuma manutenção vencida!</p>' : `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background-color: #f8d7da;">
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Viatura</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Placa</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Dias Vencido</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Última Revisão</th>
        </tr>
        ${vencidas.map(v => {
          const proximaRevisao = new Date(v.proximaRevisao);
          const diasVencido = Math.floor((hoje - proximaRevisao) / (1000 * 60 * 60 * 24));
          return `
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px;">${v.numero}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${v.placa}</td>
              <td style="border: 1px solid #ddd; padding: 10px; text-align: center; color: #E74C3C; font-weight: bold;">${diasVencido} dias</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${formatDate(v.ultimaRevisao)}</td>
            </tr>
          `;
        }).join('')}
      </table>
    `}
  `;
}

function gerarRelatorioCompleto() {
  return gerarRelatorioDisponibilidade() + '<hr style="margin: 30px 0;">' + 
         gerarRelatorioCustos() + '<hr style="margin: 30px 0;">' + 
         gerarRelatorioViaturas();
}

function exportarPDF(tipo) {
  const conteudo = document.querySelector('.card:last-child div[style*="padding: 20px"]').innerHTML;
  const janela = window.open('', 'Relatório', 'width=800,height=600');
  janela.document.write(`
    <html>
    <head>
      <title>Relatório - ${tipo}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f8f9fa; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <h2>Relatório de Gestão da Frota</h2>
      <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
      ${conteudo}
      <script>window.print();</script>
    </body>
    </html>
  `);
  janela.document.close();
}

function exportarExcel(tipo) {
  showToast('Funcionalidade de exportação Excel em desenvolvimento', 'warning');
}