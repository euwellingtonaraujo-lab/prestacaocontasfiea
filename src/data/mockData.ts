export type ProjectStatus = 'em_andamento' | 'em_atraso' | 'prazo_proximo';

export type ApprovalStatus = 'em_elaboracao' | 'submetida' | 'em_analise' | 'ajustes_solicitados' | 'aprovada';

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  em_elaboracao: 'Em elaboração',
  submetida: 'Submetida para aprovação',
  em_analise: 'Em análise (PMO)',
  ajustes_solicitados: 'Ajustes solicitados',
  aprovada: 'Aprovada',
};

export const approvalStatusColors: Record<ApprovalStatus, string> = {
  em_elaboracao: 'bg-muted text-muted-foreground',
  submetida: 'bg-info/15 text-info',
  em_analise: 'bg-warning/15 text-warning-foreground',
  ajustes_solicitados: 'bg-destructive/15 text-destructive',
  aprovada: 'bg-success/15 text-success',
};

export interface ApprovalEvent {
  id: string;
  date: string;
  user: string;
  fromStatus: ApprovalStatus;
  toStatus: ApprovalStatus;
  comment?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  entity: string;
  portfolio: string;
  status: ProjectStatus;
  approvalStatus: ApprovalStatus;
  deadline: string;
  approvalHistory: ApprovalEvent[];
}

export interface Expense {
  id: string;
  projectId: string;
  type: 'nf' | 'viagem' | 'pessoal';
  item: string;
  justification: string;
  rubric: string;
  counterpart: string;
  supplierCnpj: string;
  supplierName: string;
  acquisitionDate: string;
  value: number;
  documentUrl?: string;
  lastEditedAt: string;
  lastEditedBy: string;
  funderComment?: string;
  adjustment?: string;
  // Travel specific
  travelCategory?: 'hospedagem' | 'passagens' | 'ajuda_custo';
  description?: string;
  // Personnel specific
  personnelCategory?: 'salarios' | 'fgts' | 'encargos' | 'inss';
  competence?: string;
}

export interface TravelDeclaration {
  id: string;
  projectId: string;
  name: string;
  traveler: string;
  periodStart: string;
  periodEnd: string;
  destination: string;
  event: string;
  status: 'rascunho' | 'pronta';
  expenseIds: string[];
  attachments: string[];
  observations?: string;
  lastEditedAt: string;
  lastEditedBy: string;
  travelers: Traveler[];
}

export interface Traveler {
  id: string;
  name: string;
  role: string;
  value: number;
}

export interface PersonnelDeclaration {
  id: string;
  projectId: string;
  name: string;
  reference: string;
  status: 'rascunho' | 'pronta';
  expenseIds: string[];
  team: TeamMember[];
  attachments: string[];
  lastEditedAt: string;
  lastEditedBy: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  value: number;
}

export const projects: Project[] = [
  { id: '1', code: 'PRJ-2024-001', name: 'Modernização Tecnológica — Unidade Benedito', entity: 'Sesi', portfolio: 'Carteira 1', status: 'em_andamento', approvalStatus: 'em_elaboracao', deadline: '2025-04-15', approvalHistory: [] },
  { id: '2', code: 'PRJ-2024-002', name: 'Capacitação Profissional em Soldagem', entity: 'Senai', portfolio: 'Carteira 2', status: 'em_atraso', approvalStatus: 'submetida', deadline: '2025-03-01', approvalHistory: [{ id: 'ah1', date: '2025-02-25 10:00', user: 'João Santos', fromStatus: 'em_elaboracao', toStatus: 'submetida', comment: 'PC finalizada para revisão do escritório' }] },
  { id: '3', code: 'PRJ-2024-003', name: 'Infraestrutura de Conectividade Industrial', entity: 'Senai', portfolio: 'Carteira 1', status: 'prazo_proximo', approvalStatus: 'em_analise', deadline: '2025-03-10', approvalHistory: [] },
  { id: '4', code: 'PRJ-2024-004', name: 'Programa de Saúde e Segurança do Trabalho', entity: 'Sesi', portfolio: 'Carteira 2', status: 'em_andamento', approvalStatus: 'ajustes_solicitados', deadline: '2025-06-30', approvalHistory: [{ id: 'ah2', date: '2025-02-20 14:00', user: 'Ana Costa', fromStatus: 'em_analise', toStatus: 'ajustes_solicitados', comment: 'Faltam comprovantes de 3 despesas' }] },
  { id: '5', code: 'PRJ-2024-005', name: 'Laboratório de Automação e Robótica', entity: 'Senai', portfolio: 'Carteira 1', status: 'em_atraso', approvalStatus: 'aprovada', deadline: '2025-02-28', approvalHistory: [] },
  { id: '6', code: 'PRJ-2024-006', name: 'Centro de Inovação Digital', entity: 'Corporativo', portfolio: 'Carteira 2', status: 'prazo_proximo', approvalStatus: 'em_elaboracao', deadline: '2025-03-15', approvalHistory: [] },
];

export const expenses: Expense[] = [
  { id: 'e1', projectId: '1', type: 'nf', item: 'Computador Dell Latitude 5540', justification: 'Substituição de equipamento obsoleto para laboratório de informática da unidade', rubric: 'Equipamentos', counterpart: 'Financiador', supplierCnpj: '72.381.189/0001-10', supplierName: 'Dell Computadores do Brasil Ltda', acquisitionDate: '2025-01-15', value: 8500.00, documentUrl: '#', lastEditedAt: '2025-02-20 14:30', lastEditedBy: 'Maria Silva' },
  { id: 'e2', projectId: '1', type: 'nf', item: 'Monitor LG UltraWide 29"', justification: 'Monitores para estações de trabalho do laboratório', rubric: 'Equipamentos', counterpart: 'Financiador', supplierCnpj: '01.166.372/0001-55', supplierName: 'LG Electronics do Brasil Ltda', acquisitionDate: '2025-01-18', value: 1890.00, documentUrl: '#', lastEditedAt: '2025-02-18 09:15', lastEditedBy: 'João Santos', funderComment: 'Verificar quantidade adquirida vs. aprovada' },
  { id: 'e3', projectId: '1', type: 'nf', item: 'Mouse Logitech MX Master 3S (10 un.)', justification: 'Periféricos para as novas estações de trabalho', rubric: 'Equipamentos', counterpart: 'DR', supplierCnpj: '49.327.095/0001-20', supplierName: 'Logitech Brasil Ltda', acquisitionDate: '2025-01-20', value: 4500.00, lastEditedAt: '2025-02-19 11:00', lastEditedBy: 'Maria Silva' },
  { id: 'e10', projectId: '1', type: 'nf', item: 'Serviço de instalação de rede estruturada', justification: 'Cabeamento e instalação de pontos de rede no laboratório renovado', rubric: 'Serviços de Terceiros', counterpart: 'Financiador', supplierCnpj: '33.456.789/0001-01', supplierName: 'NetConnect Soluções em TI Ltda', acquisitionDate: '2025-02-05', value: 12000.00, documentUrl: '#', lastEditedAt: '2025-02-22 10:00', lastEditedBy: 'João Santos' },
  { id: 'e11', projectId: '1', type: 'nf', item: 'Serviço de internet dedicada (12 meses)', justification: 'Link dedicado de 500 Mbps para suportar as novas operações do laboratório', rubric: 'Serviços de Terceiros', counterpart: 'Financiador', supplierCnpj: '04.180.345/0001-90', supplierName: 'Vivo Empresas S.A.', acquisitionDate: '2025-02-10', value: 18000.00, lastEditedAt: '2025-02-22 15:30', lastEditedBy: 'Maria Silva' },
  { id: 'e12', projectId: '1', type: 'nf', item: 'Teclado mecânico Redragon (10 un.)', justification: 'Periféricos ergonômicos para as estações do laboratório', rubric: 'Equipamentos', counterpart: 'DR', supplierCnpj: '22.198.745/0001-88', supplierName: 'TechShop Distribuidora Ltda', acquisitionDate: '2025-01-22', value: 2500.00, documentUrl: '#', lastEditedAt: '2025-02-20 09:45', lastEditedBy: 'João Santos' },
  { id: 'e4', projectId: '1', type: 'viagem', travelCategory: 'hospedagem', item: 'Hotel Brasília — Seminário Nacional', description: 'Hospedagem para participação no Seminário Nacional de Inovação', justification: '', rubric: 'Viagens', counterpart: 'Financiador', supplierCnpj: '00.000.000/0001-00', supplierName: 'Hotel Nacional Brasília', acquisitionDate: '2025-02-10', value: 1200.00, documentUrl: '#', lastEditedAt: '2025-02-15 16:00', lastEditedBy: 'Ana Costa' },
  { id: 'e5', projectId: '1', type: 'viagem', travelCategory: 'passagens', item: 'Passagem aérea SP → BSB', description: 'Ida e volta para Seminário Nacional de Inovação', justification: '', rubric: 'Viagens', counterpart: 'Financiador', supplierCnpj: '00.000.000/0002-00', supplierName: 'Latam Airlines', acquisitionDate: '2025-02-08', value: 1850.00, lastEditedAt: '2025-02-15 16:05', lastEditedBy: 'Ana Costa' },
  { id: 'e6', projectId: '1', type: 'viagem', travelCategory: 'ajuda_custo', item: 'Ajuda de custo — Seminário BSB', description: 'Ajuda de custo para alimentação durante evento', justification: '', rubric: 'Viagens', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '2025-02-10', value: 600.00, lastEditedAt: '2025-02-15 16:10', lastEditedBy: 'Ana Costa' },
  { id: 'e7', projectId: '1', type: 'pessoal', personnelCategory: 'salarios', item: 'Salários — Janeiro/2025', description: 'Folha de pagamento da equipe do projeto', justification: '', rubric: 'Pessoal', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '2025-01-31', value: 45000.00, competence: '01/2025', documentUrl: '#', lastEditedAt: '2025-02-10 10:00', lastEditedBy: 'RH' },
  { id: 'e8', projectId: '1', type: 'pessoal', personnelCategory: 'fgts', item: 'FGTS — Janeiro/2025', description: 'Recolhimento FGTS equipe', justification: '', rubric: 'Pessoal', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '2025-02-07', value: 3600.00, competence: '01/2025', lastEditedAt: '2025-02-10 10:05', lastEditedBy: 'RH' },
  { id: 'e9', projectId: '1', type: 'pessoal', personnelCategory: 'inss', item: 'INSS — Janeiro/2025', description: 'Contribuição previdenciária', justification: '', rubric: 'Pessoal', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '2025-02-20', value: 9000.00, competence: '01/2025', documentUrl: '#', lastEditedAt: '2025-02-10 10:10', lastEditedBy: 'RH' },
];

export const travelDeclarations: TravelDeclaration[] = [
  { id: 'td1', projectId: '1', name: 'Declaração de Viagem #1', traveler: 'Ana Costa', periodStart: '2025-02-09', periodEnd: '2025-02-12', destination: 'Brasília/DF', event: 'Seminário Nacional de Inovação do Agronegócio', status: 'pronta', expenseIds: ['e4', 'e5', 'e6'], attachments: ['comprovante_hospedagem.pdf', 'fatura_passagens.pdf'], lastEditedAt: '2025-02-20 09:00', lastEditedBy: 'Ana Costa', travelers: [
    { id: 'tv1', name: 'Ana Costa', role: 'Analista de Inovação', value: 2450.00 },
    { id: 'tv2', name: 'Carlos Ferreira', role: 'Coordenador de Projeto', value: 1200.00 },
  ] },
];

export const personnelDeclarations: PersonnelDeclaration[] = [
  { id: 'pd1', projectId: '1', name: 'Declaração de Pessoal — Jan/2025', reference: '01/2025', status: 'rascunho', expenseIds: ['e7', 'e8', 'e9'], team: [
    { id: 'tm1', name: 'Carlos Ferreira', role: 'Coordenador de Projeto', value: 15000.00 },
    { id: 'tm2', name: 'Ana Costa', role: 'Analista de Inovação', value: 10000.00 },
    { id: 'tm3', name: 'Roberto Lima', role: 'Assistente Técnico', value: 8000.00 },
  ], attachments: ['folha_jan2025.pdf'], lastEditedAt: '2025-02-15 14:00', lastEditedBy: 'RH' },
];

export const rubricOptions = ['Equipamentos', 'Software', 'Material de Consumo', 'Viagens', 'Pessoal', 'Consultoria', 'Serviços de Terceiros', 'Outros'];
export const counterpartOptions = ['Financiador', 'DR'];
export const portfolioOptions = ['Todas', 'Carteira 1', 'Carteira 2'];
export const entityOptions = ['Todas', 'Sesi', 'Senai', 'Corporativo'];

export const statusLabels: Record<ProjectStatus, string> = {
  em_andamento: 'Em andamento',
  em_atraso: 'Em atraso',
  prazo_proximo: 'Próximo do prazo',
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date + (date.length === 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('pt-BR');
};
