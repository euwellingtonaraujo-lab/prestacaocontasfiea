export type ProjectStatus = 'em_andamento' | 'em_atraso' | 'prazo_proximo';

export interface Project {
  id: string;
  code: string;
  name: string;
  entity: string;
  portfolio: string;
  status: ProjectStatus;
  deadline: string;
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
  { id: '1', code: 'PRJ-2024-001', name: 'Modernização do Agronegócio Digital', entity: 'CNA', portfolio: 'Inovação', status: 'em_andamento', deadline: '2025-04-15' },
  { id: '2', code: 'PRJ-2024-002', name: 'Capacitação Rural Sustentável', entity: 'CNA', portfolio: 'Educação', status: 'em_atraso', deadline: '2025-03-01' },
  { id: '3', code: 'PRJ-2024-003', name: 'Infraestrutura de Conectividade', entity: 'SENAR', portfolio: 'Tecnologia', status: 'prazo_proximo', deadline: '2025-03-10' },
  { id: '4', code: 'PRJ-2024-004', name: 'Programa de Sustentabilidade Hídrica', entity: 'CNA', portfolio: 'Sustentabilidade', status: 'em_andamento', deadline: '2025-06-30' },
  { id: '5', code: 'PRJ-2024-005', name: 'Assistência Técnica e Gerencial', entity: 'SENAR', portfolio: 'Educação', status: 'em_atraso', deadline: '2025-02-28' },
  { id: '6', code: 'PRJ-2024-006', name: 'Mercados Internacionais do Agro', entity: 'CNA', portfolio: 'Comércio Exterior', status: 'prazo_proximo', deadline: '2025-03-15' },
];

export const expenses: Expense[] = [
  { id: 'e1', projectId: '1', type: 'nf', item: 'Computador Dell Latitude 5540', justification: 'Substituição de equipamento obsoleto para equipe técnica do projeto', rubric: 'Equipamentos', counterpart: 'Financiador', supplierCnpj: '72.381.189/0001-10', supplierName: 'Dell Computadores do Brasil Ltda', acquisitionDate: '2025-01-15', value: 8500.00, documentUrl: '#', lastEditedAt: '2025-02-20 14:30', lastEditedBy: 'Maria Silva' },
  { id: 'e2', projectId: '1', type: 'nf', item: 'Licença Adobe Creative Suite', justification: 'Licenciamento para produção de material de comunicação', rubric: 'Software', counterpart: 'DR', supplierCnpj: '03.438.990/0001-35', supplierName: 'Adobe Systems Inc.', acquisitionDate: '2025-01-20', value: 3200.00, lastEditedAt: '2025-02-18 09:15', lastEditedBy: 'João Santos', funderComment: 'Verificar se a licença é anual ou mensal' },
  { id: 'e3', projectId: '1', type: 'nf', item: 'Material de escritório', justification: 'Materiais de consumo para operação do escritório do projeto', rubric: 'Material de Consumo', counterpart: 'Financiador', supplierCnpj: '47.960.950/0001-21', supplierName: 'Kalunga S.A.', acquisitionDate: '2025-02-01', value: 1850.00, documentUrl: '#', lastEditedAt: '2025-02-22 11:00', lastEditedBy: 'Maria Silva' },
  { id: 'e4', projectId: '1', type: 'viagem', travelCategory: 'hospedagem', item: 'Hotel Brasília — Seminário Nacional', description: 'Hospedagem para participação no Seminário Nacional de Inovação', justification: '', rubric: 'Viagens', counterpart: 'Financiador', supplierCnpj: '00.000.000/0001-00', supplierName: 'Hotel Nacional Brasília', acquisitionDate: '2025-02-10', value: 1200.00, documentUrl: '#', lastEditedAt: '2025-02-15 16:00', lastEditedBy: 'Ana Costa' },
  { id: 'e5', projectId: '1', type: 'viagem', travelCategory: 'passagens', item: 'Passagem aérea SP → BSB', description: 'Ida e volta para Seminário Nacional de Inovação', justification: '', rubric: 'Viagens', counterpart: 'Financiador', supplierCnpj: '00.000.000/0002-00', supplierName: 'Latam Airlines', acquisitionDate: '2025-02-08', value: 1850.00, lastEditedAt: '2025-02-15 16:05', lastEditedBy: 'Ana Costa' },
  { id: 'e6', projectId: '1', type: 'viagem', travelCategory: 'ajuda_custo', item: 'Ajuda de custo — Seminário BSB', description: 'Ajuda de custo para alimentação durante evento', justification: '', rubric: 'Viagens', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '2025-02-10', value: 600.00, lastEditedAt: '2025-02-15 16:10', lastEditedBy: 'Ana Costa' },
  { id: 'e7', projectId: '1', type: 'pessoal', personnelCategory: 'salarios', item: 'Salários — Janeiro/2025', description: 'Folha de pagamento da equipe do projeto', justification: '', rubric: 'Pessoal', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '2025-01-31', value: 45000.00, competence: '01/2025', documentUrl: '#', lastEditedAt: '2025-02-10 10:00', lastEditedBy: 'RH' },
  { id: 'e8', projectId: '1', type: 'pessoal', personnelCategory: 'fgts', item: 'FGTS — Janeiro/2025', description: 'Recolhimento FGTS equipe', justification: '', rubric: 'Pessoal', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '2025-02-07', value: 3600.00, competence: '01/2025', lastEditedAt: '2025-02-10 10:05', lastEditedBy: 'RH' },
  { id: 'e9', projectId: '1', type: 'pessoal', personnelCategory: 'inss', item: 'INSS — Janeiro/2025', description: 'Contribuição previdenciária', justification: '', rubric: 'Pessoal', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '2025-02-20', value: 9000.00, competence: '01/2025', documentUrl: '#', lastEditedAt: '2025-02-10 10:10', lastEditedBy: 'RH' },
];

export const travelDeclarations: TravelDeclaration[] = [
  { id: 'td1', projectId: '1', name: 'Declaração de Viagem #1', traveler: 'Ana Costa', periodStart: '2025-02-09', periodEnd: '2025-02-12', destination: 'Brasília/DF', event: 'Seminário Nacional de Inovação do Agronegócio', status: 'pronta', expenseIds: ['e4', 'e5', 'e6'], attachments: ['comprovante_hospedagem.pdf', 'fatura_passagens.pdf'], lastEditedAt: '2025-02-20 09:00', lastEditedBy: 'Ana Costa' },
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
export const portfolioOptions = ['Todas', 'Inovação', 'Educação', 'Tecnologia', 'Sustentabilidade', 'Comércio Exterior'];
export const entityOptions = ['Todas', 'CNA', 'SENAR'];

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
