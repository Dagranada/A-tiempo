import { GoogleGenAI, Type } from '@google/genai';
import { MedicationPlan } from '../types';

const apiKey = process.env.GEMINI_API_KEY;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    dose: { type: Type.STRING },
    initialTime: { type: Type.STRING },
    frequencyValue: { type: Type.NUMBER },
    frequencyUnit: { type: Type.STRING, enum: ['horas', 'días'] },
    instructions: { type: Type.STRING },
  },
  required: ['name', 'dose', 'initialTime', 'frequencyValue', 'frequencyUnit'],
};

const PROMPT =
  'Eres un asistente que lee fotos de cajas o recetas de medicamentos en español y ' +
  'extrae los datos para armar un plan de toma. Responde solo con el JSON solicitado. ' +
  'Si un dato no aparece en la imagen, usa un valor razonable por defecto (ej. "1 pastilla" ' +
  'para la dosis, 24 para la frecuencia en horas, "08:00" para el horario inicial).';

export async function analyzeMedicationImage(
  base64Image: string
): Promise<Omit<MedicationPlan, 'id' | 'createdAt'>> {
  if (!apiKey) {
    throw new Error(
      'Falta configurar GEMINI_API_KEY en .env.local para poder analizar la imagen.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-flash-latest',
    contents: [
      {
        role: 'user',
        parts: [
          { text: PROMPT },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini no devolvió información utilizable para esta imagen.');
  }

  const parsed = JSON.parse(text);

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);

  return {
    name: parsed.name || 'Medicamento',
    description: parsed.description || '',
    dose: parsed.dose || '1 pastilla',
    initialTime: parsed.initialTime || '08:00',
    frequencyValue: Number(parsed.frequencyValue) || 24,
    frequencyUnit: parsed.frequencyUnit === 'días' ? 'días' : 'horas',
    startDate: today.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    instructions: parsed.instructions || '',
  };
}
