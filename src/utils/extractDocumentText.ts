/**
 * Extract plain text from common resume file types in the browser.
 * Binary formats are parsed client-side; only text is sent to the API.
 */

import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

function extension(filename: string): string {
  const i = filename.lastIndexOf('.');
  return i >= 0 ? filename.slice(i).toLowerCase() : '';
}

function rtfToPlainText(rtf: string): string {
  let text = rtf
    .replace(/\r\n/g, '\n')
    .replace(/\\par[d]?\s*/gi, '\n')
    .replace(/\\line\s*/gi, '\n')
    .replace(/\\tab\s*/gi, '\t');

  text = text.replace(/\\'([0-9a-f]{2})/gi, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  text = text.replace(/\{\\\*[^}]*\}/g, '');
  text = text.replace(/\\[a-z]+\d* ?/gi, '');
  text = text.replace(/[{}]/g, '');
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

function extractOdtText(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const OFFICE_NS = 'urn:oasis:names:tc:opendocument:xmlns:office:1.0';
  const body = doc.getElementsByTagNameNS(OFFICE_NS, 'body')[0];
  if (!body?.textContent) return '';
  return body.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

  const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) })
    .promise;
  const parts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    parts.push(line);
  }

  return parts.join('\n\n').replace(/\s+/g, ' ').trim();
}

async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  if (result.messages?.length) {
    const errs = result.messages.filter((m) => m.type === 'error');
    if (errs.length) {
      throw new Error(errs.map((m) => m.message).join(' '));
    }
  }
  return result.value.trim();
}

async function extractOdtTextFromBuffer(arrayBuffer: ArrayBuffer): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(arrayBuffer);
  const xmlFile = zip.file('content.xml');
  if (!xmlFile) throw new Error('Invalid ODT file (missing content.xml).');
  const xml = await xmlFile.async('string');
  return extractOdtText(xml);
}

const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.text',
  '.csv',
  '.html',
  '.htm',
  '.json',
  '.rtf',
]);

export const ACCEPT_ATTR =
  '.pdf,.doc,.docx,.txt,.md,.markdown,.odt,.rtf,.html,.htm,.csv,.json,.text';

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = extension(file.name);

  if (ext === '.doc') {
    throw new Error(
      'Legacy Word .doc files cannot be read in the browser. Save as .docx or export as PDF, then upload again.',
    );
  }

  if (TEXT_EXTENSIONS.has(ext)) {
    const raw = await file.text();
    return ext === '.rtf' ? rtfToPlainText(raw) : raw;
  }

  if (ext === '.docx') {
    return extractDocxText(await file.arrayBuffer());
  }

  if (ext === '.pdf') {
    return extractPdfText(await file.arrayBuffer());
  }

  if (ext === '.odt') {
    return extractOdtTextFromBuffer(await file.arrayBuffer());
  }

  throw new Error(
    `Unsupported file type (“${ext || 'unknown'}”). Use PDF, Word (.docx), OpenDocument (.odt), RTF, HTML, or plain text.`,
  );
}
