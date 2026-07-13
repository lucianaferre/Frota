import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// In-memory database
let viaturas = [
  {
    id: uuidv4(),
    numero: '001',
    placa: 'PM-0001',
    modelo: 'Ford Transit',
    ano: 2022,
    quilometragem: 15000,
    unidade: 'Patrulha Centro',
    status: 'Em operação',
    ultimaRevisao: '2024-01-15',
    proximaRevisao: '2024-03-15',
    localizacao: { lat: -26.9124, lng: -48.7600, velocidade: 45, motor: true },
    foto: 'https://via.placeholder.com/300x200?text=Viatura+001'
  },
  {
    id: uuidv4(),
    numero: '002',
    placa: 'PM-0002',
    modelo: 'Chevrolet S10',
    ano: 2021,
    quilometragem: 28000,
    unidade: 'Patrulha Sul',
    status: 'Em manutenção',
    ultimaRevisao: '2023-11-20',
    proximaRevisao: '2024-02-20',
    localizacao: { lat: -26.9250, lng: -48.7750, velocidade: 0, motor: false },
    foto: 'https://via.placeholder.com/300x200?text=Viatura+002'
  },
  {
    id: uuidv4(),
    numero: '003',
    placa: 'PM-0003',
    modelo: 'Honda CB500',
    ano: 2023,
    quilometragem: 5000,
    unidade: 'Patrulha Norte',
    status: 'Em operação',
    ultimaRevisao: '2024-02-01',
    proximaRevisao: '2024-04-01',
    localizacao: { lat: -26.8900, lng: -48.7500, velocidade: 60, motor: true },
    foto: 'https://via.placeholder.com/300x200?text=Viatura+003'
  },
  {
    id: uuidv4(),
    numero: '004',
    placa: 'PM-0004',
    modelo: 'Ford Ranger',
    ano: 2020,
    quilometragem: 42000,
    unidade: 'Patrulha Leste',
    status: 'Indisponível',
    ultimaRevisao: '2023-09-10',
    proximaRevisao: '2024-01-10',
    localizacao: { lat: -26.9400, lng: -48.7400, velocidade: 0, motor: false },
    foto: 'https://via.placeholder.com/300x200?text=Viatura+004'
  }
];

let ordensDe Serviço = [
  {
    id: uuidv4(),
    numero: 'OS-001',
    data: '2024-02-10',
    viaturaId: viaturas[0].id,
    problema: 'Troca de óleo',
    servicoExecutado: 'Troca de óleo motor 5W30',
    responsavel: 'João Silva',
    pecas: ['Óleo Motor 5W30', 'Filtro Óleo'],
    custo: 150.00,
    tempoParada: 1,
    status: 'Finalizada'
  },
  {
    id: uuidv4(),
    numero: 'OS-002',
    data: '2024-02-12',
    viaturaId: viaturas[1].id,
    problema: 'Revisão geral',
    servicoExecutado: 'Revisão completa de sistema de freios',
    responsavel: 'Maria Santos',
    pecas: ['Pastilhas de freio', 'Disco de freio'],
    custo: 450.00,
    tempoParada: 3,
    status: 'Em andamento'
  }
];

let manutencaoPreventiva = [
  {
    id: uuidv4(),
    item: 'Troca de óleo',
    frequencia: '10000 km',
    kmIntervalo: 10000,
    diasIntervalo: 90
  },
  {
    id: uuidv4(),
    item: 'Revisão dos freios',
    frequencia: '20000 km',
    kmIntervalo: 20000,
    diasIntervalo: 180
  },
  {
    id: uuidv4(),
    item: 'Alinhamento e balanceamento',
    frequencia: '15000 km',
    kmIntervalo: 15000,
    diasIntervalo: 150
  },
  {
    id: uuidv4(),
    item: 'Revisão elétrica',
    frequencia: '6 meses',
    kmIntervalo: 0,
    diasIntervalo: 180
  }
];

let usuarios = [
  {
    id: uuidv4(),
    nome: 'Admin Sistema',
    cargo: 'Administrador',
    nivel: 'admin',
    email: 'admin@pm.gov.br',
    ultimoAcesso: new Date().toISOString(),
    foto: 'https://via.placeholder.com/150?text=Admin'
  },
  {
    id: uuidv4(),
    nome: 'Carlos Gestor',
    cargo: 'Gestor de Frota',
    nivel: 'gestor',
    email: 'gestor@pm.gov.br',
    ultimoAcesso: new Date().toISOString(),
    foto: 'https://via.placeholder.com/150?text=Gestor'
  },
  {
    id: uuidv4(),
    nome: 'João Mecânico',
    cargo: 'Mecânico',
    nivel: 'mecanico',
    email: 'mecanico@pm.gov.br',
    ultimoAcesso: new Date().toISOString(),
    foto: 'https://via.placeholder.com/150?text=Mecanico'
  }
];

// VIATURAS ROUTES
app.get('/api/viaturas', (req, res) => {
  res.json(viaturas);
});

app.get('/api/viaturas/:id', (req, res) => {
  const viatura = viaturas.find(v => v.id === req.params.id);
  if (!viatura) return res.status(404).json({ erro: 'Viatura não encontrada' });
  res.json(viatura);
});

app.post('/api/viaturas', (req, res) => {
  const novaViatura = {
    id: uuidv4(),
    ...req.body,
    localizacao: req.body.localizacao || { lat: -26.9124, lng: -48.7600, velocidade: 0, motor: false }
  };
  viaturas.push(novaViatura);
  res.status(201).json(novaViatura);
});

app.put('/api/viaturas/:id', (req, res) => {
  const viatura = viaturas.find(v => v.id === req.params.id);
  if (!viatura) return res.status(404).json({ erro: 'Viatura não encontrada' });
  Object.assign(viatura, req.body);
  res.json(viatura);
});

app.delete('/api/viaturas/:id', (req, res) => {
  viaturas = viaturas.filter(v => v.id !== req.params.id);
  res.json({ mensagem: 'Viatura deletada' });
});

// ORDENS DE SERVIÇO ROUTES
app.get('/api/ordens', (req, res) => {
  res.json(ordensDe Serviço);
});

app.post('/api/ordens', (req, res) => {
  const novaOrdem = {
    id: uuidv4(),
    numero: `OS-${String(ordensDe Serviço.length + 1).padStart(3, '0')}`,
    data: new Date().toISOString().split('T')[0],
    status: 'Aberta',
    ...req.body
  };
  ordensDe Serviço.push(novaOrdem);
  res.status(201).json(novaOrdem);
});

app.put('/api/ordens/:id', (req, res) => {
  const ordem = ordensDe Serviço.find(o => o.id === req.params.id);
  if (!ordem) return res.status(404).json({ erro: 'Ordem não encontrada' });
  Object.assign(ordem, req.body);
  res.json(ordem);
});

// MANUTENÇÃO PREVENTIVA ROUTES
app.get('/api/manutencao-preventiva', (req, res) => {
  res.json(manutencaoPreventiva);
});

app.post('/api/manutencao-preventiva', (req, res) => {
  const novaManutencao = {
    id: uuidv4(),
    ...req.body
  };
  manutencaoPreventiva.push(novaManutencao);
  res.status(201).json(novaManutencao);
});

// USUÁRIOS ROUTES
app.get('/api/usuarios', (req, res) => {
  res.json(usuarios);
});

app.post('/api/usuarios', (req, res) => {
  const novoUsuario = {
    id: uuidv4(),
    ultimoAcesso: new Date().toISOString(),
    ...req.body
  };
  usuarios.push(novoUsuario);
  res.status(201).json(novoUsuario);
});

app.put('/api/usuarios/:id', (req, res) => {
  const usuario = usuarios.find(u => u.id === req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  Object.assign(usuario, req.body);
  res.json(usuario);
});

// KPIs ROUTE
app.get('/api/kpis', (req, res) => {
  const totalViaturas = viaturas.length;
  const emOperacao = viaturas.filter(v => v.status === 'Em operação').length;
  const disponibilidade = ((emOperacao / totalViaturas) * 100).toFixed(2);
  
  const ordensConcluidas = ordensDe Serviço.filter(o => o.status === 'Finalizada');
  const tempoMedioReparo = ordensConcluidas.length > 0 
    ? (ordensConcluidas.reduce((acc, o) => acc + o.tempoParada, 0) / ordensConcluidas.length).toFixed(2)
    : 0;
  
  const custoPorViatura = ordensDe Serviço.length > 0
    ? (ordensDe Serviço.reduce((acc, o) => acc + o.custo, 0) / totalViaturas).toFixed(2)
    : 0;

  res.json({
    disponibilidade,
    tempoMedioReparo,
    custoPorViatura,
    totalViaturas,
    emOperacao,
    emManutenção: viaturas.filter(v => v.status === 'Em manutenção').length,
    indisponível: viaturas.filter(v => v.status === 'Indisponível').length
  });
});

// ATUALIZAR LOCALIZAÇÃO (simula GPS)
app.put('/api/viaturas/:id/localizacao', (req, res) => {
  const viatura = viaturas.find(v => v.id === req.params.id);
  if (!viatura) return res.status(404).json({ erro: 'Viatura não encontrada' });
  viatura.localizacao = req.body;
  res.json(viatura);
});

// RELATÓRIOS
app.get('/api/relatorios/disponibilidade', (req, res) => {
  const total = viaturas.length;
  const disponivel = viaturas.filter(v => v.status === 'Em operação').length;
  res.json({
    total,
    disponivel,
    manutencao: viaturas.filter(v => v.status === 'Em manutenção').length,
    indisponivel: viaturas.filter(v => v.status === 'Indisponível').length,
    percentual: ((disponivel / total) * 100).toFixed(2)
  });
});

app.get('/api/relatorios/custos', (req, res) => {
  const custoTotal = ordensDe Serviço.reduce((acc, o) => acc + o.custo, 0);
  const custoPorViatura = viaturas.map(v => ({
    viatura: v.numero,
    custo: ordensDe Serviço.filter(o => o.viaturaId === v.id).reduce((acc, o) => acc + o.custo, 0)
  }));
  res.json({ custoTotal, custoPorViatura });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});