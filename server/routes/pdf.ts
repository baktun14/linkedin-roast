import { config } from '../config';
import { parseLinkedInPDF } from '../services/pdf';

export async function handleParsePDF(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File | null;

    if (!pdfFile) {
      return Response.json({ error: 'PDF file is required' }, { status: 400 });
    }

    if (!config.akashML.apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Parsing PDF:', pdfFile.name, pdfFile.size, 'bytes');

    const profile = await parseLinkedInPDF(pdfFile);

    return Response.json({ profile });
  } catch (error) {
    console.error('PDF parsing error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}
