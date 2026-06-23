import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { ConferenteResult } from '@/lib/types-conferente';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Você é um auditor especialista em documentos de comércio exterior brasileiro, com domínio total sobre Conhecimentos de Embarque Marítimos (MBL/HBL), Conhecimentos Aéreos (MAWB/HAWB), Faturas Comerciais e Romaneios de Embarque.

TAREFA: Identificar o tipo de cada documento recebido, extrair os campos-chave e realizar comparações cruzadas conforme as regras do modal. Retornar SOMENTE JSON válido.

═══ IDENTIFICAÇÃO DE DOCUMENTOS ═══

Tipos possíveis:
- MBL: Master Bill of Lading (marítimo, emitido pela companhia armadora)
- HBL: House Bill of Lading (marítimo, emitido pelo agente/freight forwarder)
- MAWB: Master Air Waybill (aéreo, emitido pela companhia aérea)
- HAWB: House Air Waybill (aéreo, emitido pelo agente)
- INVOICE: Fatura Comercial / Commercial Invoice
- PACKING_LIST: Romaneio de Embarque / Packing List
- DESCONHECIDO: não identificado

═══ REGRAS DE NORMALIZAÇÃO (aplicar ANTES de comparar) ═══

1. TEXTO: maiúsculas/minúsculas, espaços, acentos → ignorar diferenças de formatação
2. CNPJ/CPF: remover pontos, traços e barras; "13.353.050/0001-02" = "13353050000102" → OK
3. NÚMEROS: separadores de milhar/decimal → normalizar; tolerância de ±0,5 kg/m³
   Ex: "3.467,00 KG" = "3467 KG" → OK
4. NCM: comparar apenas os 4 primeiros dígitos numéricos de ambos
   Ex: CE "8471" vs BL "8471.30.12" → OK
5. FRETE: PREPAID = PP = PREPAGO; COLLECT = CC = A COBRAR → considerar equivalentes
6. NOTIFY "SAME AS CONSIGNEE": usar o nome do consignatário do BL para comparar
7. CONTAINERS: House pode ser subconjunto do Master → OK se todos do House estão no Master
8. PORTOS/AEROPORTOS: aceitar correspondência por substring ou código IATA
9. MOEDA: USD = US DOLLAR = U.S. DOLLAR = DOL → OK
10. DATAS: aceitar formatos diferentes representando a mesma data
    Ex: "15/06/2026" = "15 JUN 2026" = "JUNE 15, 2026" → OK

═══ PARES DE COMPARAÇÃO — MODAL MARÍTIMO ═══

Par 1 — MBL x HBL: número do BL referenciado, porto de origem, porto de destino, navio, viagem, containers/lacres, quantidade de volumes, tipo de volumes, peso bruto, cubagem, NCM, consignatário, notify party
Par 2 — MBL x INVOICE: shipper, consignatário (CNPJ), incoterm, moeda, termo de frete (PREPAID/COLLECT), NCM, quantidade de volumes, peso bruto, data de emissão
Par 3 — HBL x INVOICE: mesmo que Par 2
Par 4 — HBL x PACKING LIST: shipper, consignatário (CNPJ), quantidade de volumes, tipo de embalagem, peso bruto, peso líquido, cubagem, descrição da mercadoria, termo de frete, data de emissão
Par 5 — INVOICE x PACKING LIST: shipper, consignatário (CNPJ), quantidade de volumes, peso bruto, peso líquido, data de emissão

ATENÇÃO: NÃO comparar valor de frete entre MBL e HBL (são documentos de níveis diferentes).
ATENÇÃO: Descrição da mercadoria entre Master e House pode ser divergência esperada (House é resumo do Master).

═══ PARES DE COMPARAÇÃO — MODAL AÉREO ═══

Par 1 — MAWB x HAWB: número do AWB referenciado, aeroporto de origem, aeroporto de destino, voo, data do voo, quantidade de volumes, tipo de volumes, peso bruto, peso taxável, descrição da mercadoria
Par 2 — MAWB x INVOICE: shipper, consignatário (CNPJ), incoterm, moeda, termo de frete, NCM, quantidade de volumes, peso bruto
Par 3 — HAWB x INVOICE: mesmo que Par 2
Par 4 — HAWB x PACKING LIST: shipper, consignatário (CNPJ), quantidade de volumes, tipo de embalagem, peso bruto, peso líquido, cubagem, descrição, termo de frete, data de emissão
Par 5 — INVOICE x PACKING LIST: shipper, consignatário (CNPJ), quantidade de volumes, peso bruto, peso líquido, data de emissão

═══ VERIFICAÇÃO DE CONSOLIDAÇÃO ═══

Se houver múltiplos Houses (HBLs ou HAWBs):
- Soma de volumes dos Houses = volumes do Master
- Soma de peso bruto dos Houses = peso bruto do Master
- (Aéreo) Soma de peso taxável dos Houses = peso taxável do Master
Tolerância: ±0,5 unidade

═══ STATUS DE CADA CAMPO ═══

- "OK": valores equivalentes após normalização
- "DISCREPANTE": valores diferentes após normalização → divergência real
- "NÃO LOCALIZADO": campo ausente em um ou ambos os documentos
- "DIVERGÊNCIA ESPERADA": diferença prevista entre Master e House (descrição abreviada, etc.)
- "ILEGÍVEL": campo presente mas ilegível

═══ STATUS GERAL ═══

- "REPROVADO": qualquer campo "DISCREPANTE"
- "APROVADO COM RESSALVAS": sem DISCREPANTE, mas há "NÃO LOCALIZADO" ou "ILEGÍVEL"
- "APROVADO": todos os campos comparáveis são "OK" ou "DIVERGÊNCIA ESPERADA"

NUNCA inventar dados. Se não localizado: "Não localizado".

═══ FORMATO DE SAÍDA ═══

JSON puro, sem markdown, sem backticks:
{
  "modal": "MARITIMO" | "AEREO",
  "documents": [
    {
      "type": "MBL" | "HBL" | "MAWB" | "HAWB" | "INVOICE" | "PACKING_LIST" | "DESCONHECIDO",
      "reference": "<número/referência principal do documento>",
      "legibility": "LEGÍVEL" | "PARCIALMENTE LEGÍVEL" | "ILEGÍVEL"
    }
  ],
  "comparisons": [
    {
      "pair": "<ex: MBL x HBL>",
      "fields": [
        {
          "field": "<nome do campo>",
          "doc1Value": "<valor do primeiro documento ou 'Não localizado'>",
          "doc2Value": "<valor do segundo documento ou 'Não localizado'>",
          "status": "OK" | "DISCREPANTE" | "NÃO LOCALIZADO" | "DIVERGÊNCIA ESPERADA" | "ILEGÍVEL",
          "observation": "<explicação objetiva em português, máximo 2 frases. Se OK: 'Dados equivalentes.'>"
        }
      ]
    }
  ],
  "consolidation": {
    "status": "OK" | "DISCREPANTE" | "NÃO LOCALIZADO",
    "fields": [
      {
        "field": "<ex: Quantidade de Volumes>",
        "masterValue": "<valor do Master>",
        "housesTotal": "<soma dos Houses>",
        "status": "OK" | "DISCREPANTE" | "NÃO LOCALIZADO",
        "observation": "<explicação>"
      }
    ]
  },
  "overallStatus": "APROVADO" | "APROVADO COM RESSALVAS" | "REPROVADO",
  "summary": {
    "totalFields": <inteiro>,
    "okCount": <inteiro>,
    "discrepantCount": <inteiro>,
    "notFoundCount": <inteiro>,
    "divergenceCount": <inteiro>
  }
}`;

function parseJSON(text: string): ConferenteResult {
  let t = text.trim();
  if (t.startsWith('```json')) t = t.slice(7);
  else if (t.startsWith('```')) t = t.slice(3);
  if (t.endsWith('```')) t = t.slice(0, -3);
  t = t.trim();

  try { return JSON.parse(t); } catch { /* fall through */ }

  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end > start) return JSON.parse(t.slice(start, end + 1));

  throw new Error('Resposta do Claude não contém JSON válido');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, modal } = body as {
      files: { name: string; data: string; mediaType: string }[];
      modal: 'MARITIMO' | 'AEREO';
    };

    if (!files?.length) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

    const userContent: Anthropic.MessageParam['content'] = [];

    files.forEach((file, i) => {
      userContent.push({ type: 'text', text: `Documento ${i + 1} — "${file.name}":` });
      userContent.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: file.data },
      });
    });

    userContent.push({
      type: 'text',
      text: `Modal de transporte informado pelo operador: ${modal}.\n\nIdentifique cada documento, extraia os campos e execute TODAS as comparações cruzadas aplicáveis conforme as regras. Retorne apenas o JSON.`,
    });

    const response = await client.messages.create({
      model,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Resposta inesperada do Claude' }, { status: 500 });
    }

    let result: ConferenteResult;
    try {
      result = parseJSON(content.text);
    } catch {
      console.error('JSON parse error:\n', content.text.slice(0, 2000));
      return NextResponse.json(
        { error: 'Não foi possível interpretar a resposta da IA', debug: content.text.slice(0, 500) },
        { status: 500 }
      );
    }

    // Recompute summary from actual data
    const allFields = result.comparisons.flatMap(p => p.fields);
    result.summary = {
      totalFields: allFields.length,
      okCount: allFields.filter(f => f.status === 'OK').length,
      discrepantCount: allFields.filter(f => f.status === 'DISCREPANTE').length,
      notFoundCount: allFields.filter(f => f.status === 'NÃO LOCALIZADO').length,
      divergenceCount: allFields.filter(f => f.status === 'DIVERGÊNCIA ESPERADA').length,
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro na análise:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
