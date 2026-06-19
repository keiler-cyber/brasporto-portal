import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import type { ExtractedFields } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EXTRACTION_SYSTEM_PROMPT = `Você é um especialista em documentos de comércio exterior e logística marítima da empresa Brasporto Assessoria Aduaneira.
Sua tarefa é extrair informações estruturadas de documentos de exportação brasileiros para preencher o Draft Bill of Lading (BL).

REGRAS CRÍTICAS:
1. NUNCA invente informações. Se não encontrar um campo, retorne null para ele.
2. Extraia apenas o que está explicitamente nos documentos.
3. Se encontrar divergências entre documentos, mencione nas aiNotes.
4. Retorne APENAS JSON válido, sem markdown, sem blocos de código, sem texto adicional.
5. Todos os valores de texto em MAIÚSCULAS, conforme padrão de BL internacional.

GUIA DE EXTRAÇÃO POR CAMPO:

shipperName: Razão social completa do exportador/remetente. Encontrado no cabeçalho da Commercial Invoice ou Packing List (empresa que emite o documento). Ex: "BEL EXPORT HIDRODINAMICA INDUSTRIA DE BOMBAS HIDRAULICAS LTDA"

shipperAddress: Logradouro e número do exportador. Ex: "RODOVIA LUIZ ROSSO, 4230"

shipperCity: Cidade e estado do exportador. Ex: "CRICIUMA - SC"

shipperCountry: País do exportador. Geralmente "BRAZIL".

shipperContact: Telefone, email ou nome de contato do exportador, se disponível.

consigneeName: Razão social completa do importador/destinatário (campo "Client:" ou "Consignee:" nos documentos). Ex: "FLINT HYDRAULIC INC"

consigneeAddress: Endereço completo do importador (rua e número). Ex: "BLVD B.F. GOODRICH BLVD, 4099"

consigneeCity: Cidade e estado/país do importador. Ex: "MEMPHIS - TN - US"

consigneeCountry: País do importador. Ex: "US"

consigneeContact: Nome do contato, telefone e email do importador. Inclua todos disponíveis. Ex: "CONTACT: KATIE FERRIS / PHONE: (901) 7944884 / EMAIL: SALES@HYBEL.COM.BR"

notifyName: Geralmente igual ao consignee em exportações diretas. Use o mesmo nome se não houver "Notify Party" separado.

notifyAddress: Endereço do notify party. Geralmente igual ao consignee.

notifyContact: Contato do notify party.

portOrigin: Porto de embarque. Busque em: "Port of Loading", "Local de Embarque" na DUE, "Porto de Santos" → use "SANTOS". Ex: "SANTOS"

portDestination: Porto de destino. Busque em "Destination:", "Port of Discharge". Ex: "MEMPHIS"

portTransshipment: Porto de transbordo, se houver. Geralmente null.

deliveryPlace: Local de entrega final, se diferente do porto de destino.

vessel: Nome do navio. Busque em "Vessel" ou "Navio". Ex: "MAERSK FORTALEZA"

voyage: Número da viagem. Busque em "Voyage" ou "Viagem". Ex: "625N"

bookingNumber: Número do booking. Busque por "Booking No", "SS0626...", etc. Ex: "SS0626SP04311"

volumeCount: Quantidade de volumes/pallets/caixas. Se houver múltiplos documentos, some as quantidades. Ex: "01" ou "1 PALLET"

packageType: Tipo de embalagem. Ex: "PALLET", "CAIXA", "CRATE"

grossWeight: Peso bruto total. Busque "Total Gross Weight", "G.W.", "Peso Bruto". Se houver MÚLTIPLAS invoices ou packing lists, some os pesos de todos os documentos e retorne o total. Ex: "42 KG"

netWeight: Peso líquido total. Busque "Total Net Weight", "Peso Líquido", "Peso liquido (KG)" na DUE. Se houver múltiplos documentos, some os valores. Ex: "35 KG"

measurement: Cubagem total em m³. Busque "M3:", "CBM". Se houver múltiplos documentos, some as cubagens. Ex: "0,085 M3"

containerNumbers: Número do contêiner. Se for LCL (carga fracionada), use "LCL". Ex: "LCL" ou "ABCD1234567"

sealNumbers: Número do lacre do contêiner. Se LCL, null.

incoterm: Termo de venda internacional. Busque "Incoterms:", "FOB", "CIF", "EXW". Ex: "FOB"

currency: Moeda da transação. Ex: "USD"

commercialValue: Valor total da fatura comercial. Busque "Total USD", "VMCV". Se houver MÚLTIPLAS invoices, some os valores totais de todas elas. Ex: "802,20"

freightTerms: Condição do frete: "FREIGHT COLLECT" (frete a cobrar) ou "FREIGHT PREPAID" (frete pago). Busque pistas como "FOB" → normalmente FREIGHT COLLECT.

goodsDescription: Campo CRÍTICO — monte o bloco completo de descrição do BL no seguinte formato padronizado:
[QTDE] [EMBALAGEM] CONTAINING [N_VOLUMES] VOLUMES WITH [DESCRICAO_PRODUTO]
FREIGHT [COLLECT/PREPAID]
SHIPPED ON BOARD
COUNTRY OF ORIGIN: BRAZIL
EXPRESS RELEASE
INCOTERM: [INCOTERM]
INVOICE: [NUMERO_INVOICE]
DUE: [NUMERO_DUE_SEM_HIFEN]
WOODEN PACKAGE: TREATED AND CERTIFIED
NCM: [NCM_SEM_PONTOS]

Exemplo real: "01 PALLET CONTAINING 05 VOLUMES WITH GEAR PUMP\\nFREIGHT COLLECT\\nSHIPPED ON BOARD\\nCOUNTRY OF ORIGIN: BRAZIL\\nEXPRESS RELEASE\\nINCOTERM: FOB\\nINVOICE: 411.420\\nDUE: 26BR0010137562\\nWOODEN PACKAGE: TREATED AND CERTIFIED\\nNCM: 84136011"

ncm: NCM sem pontos. Busque "NCM:" nos documentos. Ex: "84136011" (de 8413.60.11 remove pontos)

marksNumbers: Marcas e números na embalagem. Se não houver, null.

dueNumber: Número da DUE. Busque "DU-E", "DUE", "RUC" no extrato DUE. Formato: "26BR001013756-2". Retorne como está no documento.

aiNotes: Observações sobre divergências, campos não encontrados, ou informações que requerem atenção da Brasporto.

Campos a extrair no JSON:
{
  "shipperName": string | null,
  "shipperAddress": string | null,
  "shipperCity": string | null,
  "shipperCountry": string | null,
  "shipperContact": string | null,
  "consigneeName": string | null,
  "consigneeAddress": string | null,
  "consigneeCity": string | null,
  "consigneeCountry": string | null,
  "consigneeContact": string | null,
  "notifyName": string | null,
  "notifyAddress": string | null,
  "notifyContact": string | null,
  "portOrigin": string | null,
  "portDestination": string | null,
  "portTransshipment": string | null,
  "deliveryPlace": string | null,
  "vessel": string | null,
  "voyage": string | null,
  "bookingNumber": string | null,
  "volumeCount": string | null,
  "packageType": string | null,
  "grossWeight": string | null,
  "netWeight": string | null,
  "measurement": string | null,
  "containerNumbers": string | null,
  "sealNumbers": string | null,
  "incoterm": string | null,
  "currency": string | null,
  "commercialValue": string | null,
  "freightTerms": string | null,
  "goodsDescription": string | null,
  "ncm": string | null,
  "marksNumbers": string | null,
  "dueNumber": string | null,
  "aiNotes": string | null
}`;

// Send PDF files directly to Claude (handles image-based PDFs, SAP Business One, etc.)
export async function extractFieldsFromPDFs(
  documents: { filePath: string; fileName: string; fileType: string }[]
): Promise<ExtractedFields> {
  // Build content array with each PDF as a document block
  const contentBlocks: Anthropic.ContentBlockParam[] = [];

  for (const doc of documents) {
    if (!fs.existsSync(doc.filePath)) continue;
    const buffer = fs.readFileSync(doc.filePath);
    const base64 = buffer.toString("base64");
    const ext = doc.filePath.split(".").pop()?.toLowerCase();

    if (ext === "pdf") {
      const block: Anthropic.DocumentBlockParam = {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
        title: doc.fileName,
        context: `Tipo de documento: ${doc.fileType}`,
      };
      contentBlocks.push(block);
    }
  }

  if (contentBlocks.length === 0) {
    throw new Error("Nenhum arquivo PDF acessível para enviar ao Claude.");
  }

  const instructionBlock: Anthropic.TextBlockParam = {
    type: "text",
    text: "Analise os documentos acima e extraia as informações de exportação conforme as instruções do sistema.",
  };
  contentBlocks.push(instructionBlock);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: contentBlocks }],
  });

  return parseExtractionResponse(message);
}

function parseExtractionResponse(message: Anthropic.Message): ExtractedFields {
  const content = message.content[0];
  if (content.type !== "text") throw new Error("Resposta inesperada da IA");
  const text = content.text.trim();
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  const bareMatch = text.match(/\{[\s\S]*\}/);
  const jsonStr = codeBlockMatch?.[1] ?? bareMatch?.[0];
  if (!jsonStr) throw new Error(`JSON não encontrado. Resposta: ${text.slice(0, 300)}`);
  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(jsonStr); } catch { throw new Error(`JSON inválido: ${jsonStr.slice(0, 200)}`); }
  const result: ExtractedFields = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (value !== null && value !== undefined && value !== "") {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

export async function extractFieldsFromDocuments(
  documentsText: string
): Promise<ExtractedFields> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Extraia as informações dos seguintes documentos de exportação:\n\n${documentsText}` }],
  });
  return parseExtractionResponse(message);
}

export interface BookingExtracted {
  bookingNumber?: string | null;
  shipperName?: string | null;
  consigneeName?: string | null;
  portOrigin?: string | null;
  portDestination?: string | null;
  vessel?: string | null;
  voyage?: string | null;
  grossWeight?: string | null;
  measurement?: string | null;
  volumeCount?: string | null;
  packageType?: string | null;
  incoterm?: string | null;
}

const BOOKING_EXTRACTION_PROMPT = `Você é especialista em logística marítima. Extraia as informações do BOOKING (confirmação de reserva de espaço) a seguir.
Retorne APENAS JSON válido, sem markdown, sem texto adicional. Valores em MAIÚSCULAS.

{
  "bookingNumber": "Número do booking (ex: SS0626SP04311)",
  "shipperName": "Nome do exportador",
  "consigneeName": "Nome do importador",
  "portOrigin": "Porto de embarque/origem",
  "portDestination": "Porto de destino final",
  "vessel": "Nome do navio",
  "voyage": "Número da viagem",
  "grossWeight": "Peso bruto (número e unidade, ex: 42 KG)",
  "measurement": "Cubagem (ex: 0,085 M3)",
  "volumeCount": "Quantidade de embalagens (só o número)",
  "packageType": "Tipo de embalagem (PALLET, CAIXA, etc.)",
  "incoterm": "Incoterm (FOB, CIF, etc.)"
}

Se não encontrar um campo, retorne null.`;

function parseBookingJson(text: string): BookingExtracted {
  const codeMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  const bareMatch = text.match(/\{[\s\S]*\}/);
  const jsonStr = codeMatch?.[1] ?? bareMatch?.[0];
  if (!jsonStr) throw new Error("JSON não encontrado na resposta do booking");
  return JSON.parse(jsonStr) as BookingExtracted;
}

export async function extractBookingFields(filePath: string): Promise<BookingExtracted> {
  if (!fs.existsSync(filePath)) throw new Error("Arquivo de booking não encontrado");

  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString("base64");

  // Try to extract text with pdf-parse (works for native/digital PDFs)
  let extractedText = "";
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer, opts?: { max?: number }) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer, { max: 0 });
    extractedText = (parsed.text ?? "").trim();
  } catch { /* scanned PDF — text extraction not available */ }

  // Strategy 1: PDF as document + extracted text (best coverage)
  const contentBlocks: Anthropic.ContentBlockParam[] = [
    {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: base64 },
      title: "Booking",
    } as Anthropic.DocumentBlockParam,
  ];
  if (extractedText) {
    contentBlocks.push({
      type: "text",
      text: `Texto extraído do PDF (use como referência adicional):\n${extractedText.slice(0, 4000)}`,
    });
  }
  contentBlocks.push({ type: "text", text: BOOKING_EXTRACTION_PROMPT });

  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: contentBlocks }],
    });
    const content = msg.content[0];
    if (content.type === "text") return parseBookingJson(content.text);
  } catch (err) {
    console.error("[booking] Strategy 1 (PDF+text) failed:", String(err).slice(0, 200));
  }

  // Strategy 2: Text only (if pdf-parse got something)
  if (extractedText) {
    try {
      const msg2 = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `${BOOKING_EXTRACTION_PROMPT}\n\nTexto do booking:\n${extractedText.slice(0, 6000)}`,
        }],
      });
      const c2 = msg2.content[0];
      if (c2.type === "text") return parseBookingJson(c2.text);
    } catch (err) {
      console.error("[booking] Strategy 2 (text only) failed:", String(err).slice(0, 200));
    }
  }

  throw new Error("Não foi possível extrair dados do booking após múltiplas tentativas");
}

const CHAT_SYSTEM_PROMPT = `Você é um assistente especializado em documentos de comércio exterior da Brasporto Logística.
Ajude o usuário a preencher corretamente as instruções de embarque.
Seja objetivo, técnico e útil. Responda em português.
Se o usuário perguntar sobre campos específicos, explique o que devem conter.`;

export async function chatWithAI(
  userMessage: string,
  context: string
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: CHAT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Contexto do embarque:\n${context}\n\nPergunta: ${userMessage}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") return "Não foi possível processar sua pergunta.";
  return content.text;
}
