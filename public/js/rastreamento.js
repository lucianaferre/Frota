async function loadRastreamento() {
  const pageContent = document.getElementById('pageContent');
  pageContent.innerHTML = '<div class="skeleton-loading">Carregando mapa...</div>';
  
  try {
    const viaturas = await apiCall('/viaturas');
    
    pageContent.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Rastreamento em Tempo Real</h1>
      </div>
      
      <div class="map-container">
        <div id="fullMap"></div>
        <div class="map-sidebar">
          <h3 style="margin-bottom: 15px;">Viaturas</h3>
          <div id="vehiclesList"></div>
        </div>
      </div>
      
      <div class="card" style="margin-top: 20px;">
        <div class="card-header">
          <h3 class="card-title">Legenda</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
          <div>
            <span class="color-dot color-green"></span>Em Patrulhamento
          </div>
          <div>
            <span class="color-dot color-red"></span>Parada
          </div>
          <div>
            <span class="color-dot color-yellow"></span>Em Deslocamento
          </div>
          <div>
            <span class="color-dot" style="background-color: #3498db;"></span>Na Oficina
          </div>
        </div>
      </div>
    `;
    
    setTimeout(() => {
      initTrackingMap(viaturas);
      displayVehiclesList(viaturas);
    }, 100);
    
  } catch (error) {
    pageContent.innerHTML = '<h1>Erro ao carregar rastreamento</h1>';
  }
}

function initTrackingMap(viaturas) {
  const mapElement = document.getElementById('fullMap');
  if (!mapElement) return;
  
  const map = L.map('fullMap').setView([-26.9124, -48.7600], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  const markers = {};
  
  viaturas.forEach(v => {
    const color = getMarkerColor(v.status);
    const marker = L.circleMarker([v.localizacao.lat, v.localizacao.lng], {
      radius: 12,
      fillColor: color,
      color: color,
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);
    
    const popupContent = `
      <div style="font-size: 12px;">
        <strong>${v.numero}</strong><br>
        Placa: ${v.placa}<br>
        Status: ${v.status}<br>
        Velocidade: ${v.localizacao.velocidade} km/h<br>
        Motor: ${v.localizacao.motor ? 'Ligado' : 'Desligado'}<br>
        Km: ${v.quilometragem.toLocaleString('pt-BR')}<br>
        <button style="margin-top: 5px; padding: 4px 8px; background: #1B4F72; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="highlightVehicle('${v.id}')">Centralizar</button>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    markers[v.id] = { marker, map };
  });
  
  window.trackingMap = map;
  window.trackingMarkers = markers;
  window.trackingViaturas = viaturas;
}

function displayVehiclesList(viaturas) {
  const container = document.getElementById('vehiclesList');
  
  container.innerHTML = viaturas.map(v => `
    <div class="vehicle-item" onclick="highlightVehicle('${v.id}'); event.stopPropagation();" id="vehicle-${v.id}">
      <img src="${v.foto}" alt="${v.numero}" class="vehicle-photo">
      <div class="vehicle-info">
        <strong>${v.numero}</strong><br>
        ${v.placa}<br>
        <span style="font-size: 11px;">
          ${getStatusIcon(v.status)} ${v.status}<br>
          ⚡ ${v.localizacao.velocidade} km/h
        </span>
      </div>
    </div>
  `).join('');
}

function highlightVehicle(viaturaId) {
  const viatura = window.trackingViaturas.find(v => v.id === viaturaId);
  if (!viatura || !window.trackingMap) return;
  
  window.trackingMap.setView([viatura.localizacao.lat, viatura.localizacao.lng], 15);
  
  if (window.trackingMarkers[viaturaId]) {
    window.trackingMarkers[viaturaId].marker.openPopup();
  }
  
  document.querySelectorAll('.vehicle-item').forEach(item => item.classList.remove('active'));
  document.getElementById(`vehicle-${viaturaId}`).classList.add('active');
}

function getMarkerColor(status) {
  if (status === 'Em operação') return '#2ECC71';
  if (status === 'Em manutenção') return '#F39C12';
  if (status === 'Indisponível') return '#E74C3C';
  return '#95a5a6';
}

// Simulate GPS updates every 5 seconds
setInterval(() => {
  if (window.trackingViaturas && window.trackingMap) {
    window.trackingViaturas.forEach(v => {
      // Simulate movement
      v.localizacao.lat += (Math.random() - 0.5) * 0.001;
      v.localizacao.lng += (Math.random() - 0.5) * 0.001;
      v.localizacao.velocidade = Math.max(0, v.localizacao.velocidade + (Math.random() - 0.5) * 10);
      
      if (window.trackingMarkers[v.id]) {
        window.trackingMarkers[v.id].marker.setLatLng([v.localizacao.lat, v.localizacao.lng]);
      }
    });
  }
}, 5000);