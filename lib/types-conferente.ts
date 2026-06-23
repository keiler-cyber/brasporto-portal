export type DocType = 'MBL' | 'HBL' | 'MAWB' | 'HAWB' | 'INVOICE' | 'PACKING_LIST' | 'DESCONHECIDO';
export type FieldStatus = 'OK' | 'DISCREPANTE' | 'NÃO LOCALIZADO' | 'DIVERGÊNCIA ESPERADA' | 'ILEGÍVEL';
export type OverallStatus = 'APROVADO' | 'APROVADO COM RESSALVAS' | 'REPROVADO';
export type ModalType = 'MARITIMO' | 'AEREO';

export interface DocumentInfo {
  type: DocType;
  reference: string;
  legibility: 'LEGÍVEL' | 'PARCIALMENTE LEGÍVEL' | 'ILEGÍVEL';
}

export interface FieldComparison {
  field: string;
  doc1Value: string;
  doc2Value: string;
  status: FieldStatus;
  observation: string;
}

export interface ComparisonPair {
  pair: string;
  fields: FieldComparison[];
}

export interface ConsolidationField {
  field: string;
  masterValue: string;
  housesTotal: string;
  status: 'OK' | 'DISCREPANTE' | 'NÃO LOCALIZADO';
  observation: string;
}

export interface ConferenteResult {
  modal: ModalType;
  documents: DocumentInfo[];
  comparisons: ComparisonPair[];
  consolidation?: {
    status: 'OK' | 'DISCREPANTE' | 'NÃO LOCALIZADO';
    fields: ConsolidationField[];
  };
  overallStatus: OverallStatus;
  summary: {
    totalFields: number;
    okCount: number;
    discrepantCount: number;
    notFoundCount: number;
    divergenceCount: number;
  };
}
