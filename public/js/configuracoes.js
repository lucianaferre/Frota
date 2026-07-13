function loadConfiguracoes() {
  const pageContent = document.getElementById('pageContent');
  
  pageContent.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Configurações</h1>
    </div>
    
    <div class="grid grid-2">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Preferências Gerais</h3>
        </div>
        <div style="padding: 20px;">
          <div class="form-group">
            <label><input type="checkbox" checked> Notificações por Email</label>
          </div>
          <div class="form-group">
            <label><input type="checkbox" checked> Alertas de Manutenção Vencida</label>
          </div>
          <div class="form-group">
            <label><input type="checkbox"> Modo Escuro</label>
          </div>
          <button class="btn btn-primary" style="margin-top: 15px;">Salvar</button>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Informações do Sistema</h3>
        </div>
        <div style="padding: 20px;">
          <p><strong>Versão:</strong> 1.0.0</p>
          <p><strong>Última Atualização:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          <p><strong>Banco de Dados:</strong> Local</p>
          <p><strong>Servidor:</strong> Node.js + Express</p>
          <p style="margin-top: 15px; color: #7F8C8D; font-size: 12px;">Sistema de Gestão da Frota - PM Blumenau</p>
        </div>
      </div>
    </div>
    
    <div class="card" style="margin-top: 20px;">
      <div class="card-header">
        <h3 class="card-title">Backup e Manutenção</h3>
      </div>
      <div style="padding: 20px;">
        <p style="margin-bottom: 15px;">Realiza backup automático dos dados do sistema.</p>
        <button class="btn btn-secondary" onclick="realizarBackup()">
          <i class="fas fa-download"></i> Baixar Backup
        </button>
        <button class="btn btn-secondary" style="margin-left: 10px;" onclick="limparCache()">
          <i class="fas fa-broom"></i> Limpar Cache
        </button>
      </div>
    </div>
  `;
}

function realizarBackup() {
  showToast('Backup iniciado. Este processo pode levar alguns minutos...', 'warning');
  setTimeout(() => {
    showToast('Backup concluído com sucesso!');
  }, 2000);
}

function limparCache() {
  localStorage.clear();
  showToast('Cache limpo com sucesso!');
  location.reload();
}