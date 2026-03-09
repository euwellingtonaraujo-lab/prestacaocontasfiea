export type ProjectStatus = 'em_andamento' | 'em_atraso' | 'prazo_proximo';

export type ApprovalStatus = 'em_elaboracao' | 'submetida' | 'ajustes_solicitados' | 'aprovada';

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  em_elaboracao: 'Em elaboração',
  submetida: 'Submetida para aprovação',
  ajustes_solicitados: 'Ajustes solicitados',
  aprovada: 'Aprovada',
};

export const approvalStatusColors: Record<ApprovalStatus, string> = {
  em_elaboracao: 'bg-muted text-muted-foreground',
  submetida: 'bg-info/15 text-info',
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
  // NF specific
  nfNumber?: string;
  provisionDate?: string;
  nfDate?: string;
  nfValue?: number;
  usedValue?: number;
  usedValueEdited?: boolean;
  // Non-presentable flag
  nonPresentable?: boolean;
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
  workHours: number;
  value: number;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  workHours: number;
  monthlySalary: number;
}

export interface ExpenseDiscount {
  id: string;
  expenseId: string;
  codigoComprovante: string;
  account: string;
  value: number;
  description: string;
}

export type PCStageStatus = 'nao_iniciada' | 'em_elaboracao' | 'submetida' | 'ajustes_solicitados' | 'aprovada';

export const pcStageStatusLabels: Record<PCStageStatus, string> = {
  nao_iniciada: 'Não iniciada',
  em_elaboracao: 'Em elaboração',
  submetida: 'Submetida para aprovação',
  ajustes_solicitados: 'Ajustes solicitados',
  aprovada: 'Aprovada',
};

export interface PCScheduleStage {
  id: string;
  projectId: string;
  name: string;
  status: PCStageStatus;
  forecastValue: number;
  selectedExpenseIds: string[];
  selectedTravelDeclIds: string[];
  selectedPersonnelDeclIds: string[];
}

export const collaborators: Collaborator[] = [
  { id: 'col1', name: 'Carlos Ferreira', role: 'Coordenador de Projeto', workHours: 40, monthlySalary: 15000.00 },
  { id: 'col2', name: 'Ana Costa', role: 'Analista de Inovação', workHours: 40, monthlySalary: 10000.00 },
  { id: 'col3', name: 'Roberto Lima', role: 'Assistente Técnico', workHours: 30, monthlySalary: 8000.00 },
  { id: 'col4', name: 'Fernanda Souza', role: 'Engenheira de Software', workHours: 40, monthlySalary: 12000.00 },
  { id: 'col5', name: 'Marcos Oliveira', role: 'Técnico em Automação', workHours: 20, monthlySalary: 6000.00 },
  { id: 'col6', name: 'Juliana Mendes', role: 'Analista Financeiro', workHours: 40, monthlySalary: 9500.00 },
];

export const expenseDiscounts: ExpenseDiscount[] = [
  { id: 'disc1', expenseId: 'e1', codigoComprovante: 'NF-001', account: '41010503001 - Descontos Obtidos', value: -12.73, description: 'Desconto comercial referente NF 001 - Dell Computadores do Brasil Ltda' },
  { id: 'disc2', expenseId: 'e10', codigoComprovante: 'NF-005', account: '41010503001 - Descontos Obtidos', value: -250.00, description: 'Desconto por pagamento antecipado NF 005 - NetConnect Soluções em TI Ltda' },
  { id: 'disc3', expenseId: 'e10', codigoComprovante: 'NF-005', account: '41010503002 - Abatimentos', value: -100.00, description: 'Abatimento contratual NF 005 - NetConnect Soluções em TI Ltda' },
];

export const projects: Project[] = [
  { id: '1', code: 'PRJ-2024-001', name: 'Modernização Tecnológica — Unidade Benedito', entity: 'Sesi', portfolio: 'Carteira 1', status: 'em_andamento', approvalStatus: 'em_elaboracao', deadline: '2025-04-15', approvalHistory: [] },
  { id: '2', code: 'PRJ-2024-002', name: 'Capacitação Profissional em Soldagem', entity: 'Senai', portfolio: 'Carteira 2', status: 'em_atraso', approvalStatus: 'em_elaboracao', deadline: '2025-03-01', approvalHistory: [] },
  { id: '3', code: 'PRJ-2024-003', name: 'Infraestrutura de Conectividade Industrial', entity: 'Senai', portfolio: 'Carteira 1', status: 'prazo_proximo', approvalStatus: 'submetida', deadline: '2025-03-10', approvalHistory: [{ id: 'ah3', date: '2025-03-05 09:00', user: 'Carlos Lima', fromStatus: 'em_elaboracao', toStatus: 'submetida', comment: 'PC1 finalizada para revisão' }] },
  { id: '4', code: 'PRJ-2024-004', name: 'Programa de Saúde e Segurança do Trabalho', entity: 'Sesi', portfolio: 'Carteira 2', status: 'em_andamento', approvalStatus: 'ajustes_solicitados', deadline: '2025-06-30', approvalHistory: [{ id: 'ah2', date: '2025-02-20 14:00', user: 'Ana Costa', fromStatus: 'submetida', toStatus: 'ajustes_solicitados', comment: 'Faltam comprovantes de 3 despesas' }] },
  { id: '5', code: 'PRJ-2024-005', name: 'Laboratório de Automação e Robótica', entity: 'Senai', portfolio: 'Carteira 1', status: 'em_andamento', approvalStatus: 'aprovada', deadline: '2025-06-30', approvalHistory: [{ id: 'ah5', date: '2025-02-15 16:00', user: 'Ana Costa', fromStatus: 'submetida', toStatus: 'aprovada', comment: 'Tudo em ordem' }] },
  { id: '6', code: 'PRJ-2024-006', name: 'Centro de Inovação Digital', entity: 'Corporativo', portfolio: 'Carteira 2', status: 'prazo_proximo', approvalStatus: 'em_elaboracao', deadline: '2025-03-15', approvalHistory: [] },
];

export const expenses: Expense[] = [
  { id: 'e1', projectId: '1', type: 'nf', item: 'Computador Dell Latitude 5540', justification: 'Substituição de equipamento obsoleto para laboratório de informática da unidade', rubric: 'Equipamentos', counterpart: 'Financiador', supplierCnpj: '72.381.189/0001-10', supplierName: 'Dell Computadores do Brasil Ltda', acquisitionDate: '2025-01-15', value: 8500.00, nfNumber: 'NF-001', provisionDate: '2025-01-15', nfDate: '2025-01-15', nfValue: 8500.00, usedValue: 8500.00, documentUrl: '#', lastEditedAt: '2025-02-20 14:30', lastEditedBy: 'Maria Silva' },
  { id: 'e2', projectId: '1', type: 'nf', item: 'Monitor LG UltraWide 29"', justification: 'Monitores para estações de trabalho do laboratório', rubric: 'Equipamentos', counterpart: 'Financiador', supplierCnpj: '01.166.372/0001-55', supplierName: 'LG Electronics do Brasil Ltda', acquisitionDate: '2025-01-18', value: 1890.00, nfNumber: 'NF-002', provisionDate: '2025-01-18', nfDate: '2025-01-18', nfValue: 1890.00, usedValue: 1890.00, documentUrl: '#', lastEditedAt: '2025-02-18 09:15', lastEditedBy: 'João Santos', funderComment: 'Verificar quantidade adquirida vs. aprovada' },
  { id: 'e3', projectId: '1', type: 'nf', item: 'Mouse Logitech MX Master 3S (10 un.)', justification: 'Periféricos para as novas estações de trabalho', rubric: 'Equipamentos', counterpart: 'DR', supplierCnpj: '49.327.095/0001-20', supplierName: 'Logitech Brasil Ltda', acquisitionDate: '2025-01-20', value: 4500.00, nfNumber: 'NF-003', provisionDate: '2025-01-20', nfDate: '2025-01-20', nfValue: 4500.00, usedValue: 4500.00, lastEditedAt: '2025-02-19 11:00', lastEditedBy: 'Maria Silva' },
  { id: 'e10', projectId: '1', type: 'nf', item: 'Serviço de instalação de rede estruturada', justification: 'Cabeamento e instalação de pontos de rede no laboratório renovado', rubric: 'Serviços de Terceiros', counterpart: 'Financiador', supplierCnpj: '33.456.789/0001-01', supplierName: 'NetConnect Soluções em TI Ltda', acquisitionDate: '2025-02-05', value: 12000.00, nfNumber: 'NF-005', provisionDate: '2025-02-05', nfDate: '2025-02-05', nfValue: 12000.00, usedValue: 12000.00, documentUrl: '#', lastEditedAt: '2025-02-22 10:00', lastEditedBy: 'João Santos' },
  { id: 'e11', projectId: '1', type: 'nf', item: 'Serviço de internet dedicada (12 meses)', justification: 'Link dedicado de 500 Mbps para suportar as novas operações do laboratório', rubric: 'Serviços de Terceiros', counterpart: 'Financiador', supplierCnpj: '04.180.345/0001-90', supplierName: 'Vivo Empresas S.A.', acquisitionDate: '2025-02-10', value: 18000.00, nfNumber: 'NF-006', provisionDate: '2025-02-10', nfDate: '2025-02-10', nfValue: 18000.00, usedValue: 18000.00, lastEditedAt: '2025-02-22 15:30', lastEditedBy: 'Maria Silva' },
  { id: 'e12', projectId: '1', type: 'nf', item: 'Teclado mecânico Redragon (10 un.)', justification: 'Periféricos ergonômicos para as estações do laboratório', rubric: 'Equipamentos', counterpart: 'DR', supplierCnpj: '22.198.745/0001-88', supplierName: 'TechShop Distribuidora Ltda', acquisitionDate: '2025-01-22', value: 2500.00, nfNumber: 'NF-004', provisionDate: '2025-01-22', nfDate: '2025-01-22', nfValue: 2500.00, usedValue: 2500.00, documentUrl: '#', lastEditedAt: '2025-02-20 09:45', lastEditedBy: 'João Santos' },
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
    { id: 'tm1', name: 'Carlos Ferreira', role: 'Coordenador de Projeto', workHours: 40, value: 15000.00 },
    { id: 'tm2', name: 'Ana Costa', role: 'Analista de Inovação', workHours: 40, value: 10000.00 },
    { id: 'tm3', name: 'Roberto Lima', role: 'Assistente Técnico', workHours: 30, value: 8000.00 },
  ], attachments: ['folha_jan2025.pdf'], lastEditedAt: '2025-02-15 14:00', lastEditedBy: 'RH' },
];

export const pcScheduleStages: PCScheduleStage[] = [
  { id: 'pc1', projectId: '1', name: 'PC1 — 1º Trimestre', status: 'aprovada', forecastValue: 35000.00, selectedExpenseIds: ['e1', 'e2', 'e3'], selectedTravelDeclIds: [], selectedPersonnelDeclIds: [] },
  { id: 'pc2', projectId: '1', name: 'PC2 — 2º Trimestre', status: 'em_elaboracao', forecastValue: 80000.00, selectedExpenseIds: ['e10'], selectedTravelDeclIds: [], selectedPersonnelDeclIds: [] },
  { id: 'pc3', projectId: '2', name: 'PC1 — 1º Trimestre', status: 'nao_iniciada', forecastValue: 50000.00, selectedExpenseIds: [], selectedTravelDeclIds: [], selectedPersonnelDeclIds: [] },
  { id: 'pc4', projectId: '3', name: 'PC1 — 1º Trimestre', status: 'submetida', forecastValue: 40000.00, selectedExpenseIds: [], selectedTravelDeclIds: [], selectedPersonnelDeclIds: [] },
  { id: 'pc5', projectId: '4', name: 'PC1 — 1º Trimestre', status: 'ajustes_solicitados', forecastValue: 60000.00, selectedExpenseIds: [], selectedTravelDeclIds: [], selectedPersonnelDeclIds: [] },
  { id: 'pc6', projectId: '5', name: 'PC1 — 1º Trimestre', status: 'aprovada', forecastValue: 45000.00, selectedExpenseIds: [], selectedTravelDeclIds: [], selectedPersonnelDeclIds: [] },
  { id: 'pc7', projectId: '6', name: 'PC1 — 1º Trimestre', status: 'nao_iniciada', forecastValue: 70000.00, selectedExpenseIds: [], selectedTravelDeclIds: [], selectedPersonnelDeclIds: [] },
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
