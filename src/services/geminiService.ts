import { MedicationPlan } from '../types';
import { toIsoDate } from '../lib/claims';
import { supabase } from '../lib/supabase';

// La foto se analiza en la Edge Function "analizar-medicamento" de Supabase
// (supabase/functions/analizar-medicamento): ahí viven la clave de Gemini, el
// prompt y el schema. La app ya no lleva ninguna clave de Gemini. Solo funciona
// con sesión: Supabase manda el token de la cuenta en cada llamada.
const FUNCTION_NAME = 'analizar-medicamento';

interface ExtractedFields {
  name?: string;
  description?: string;
  dose?: string;
  initialTime?: string;
  frequencyValue?: number;
  frequencyUnit?: string;
  instructions?: string;
}

export async function analyzeMedicationImage(
  base64Image: string
): Promise<Omit<MedicationPlan, 'id' | 'createdAt'>> {
  const { data, error } = await supabase.functions.invoke<ExtractedFields>(FUNCTION_NAME, {
    body: { image: base64Image },
  });
  if (error) throw error; // App.tsx lo registra y sigue con el formulario vacío
  if (!data) throw new Error('El análisis no devolvió información utilizable para esta imagen.');

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 30);

  return {
    // Lo que no se pudo leer queda vacío: el formulario lo pide antes de guardar.
    name: data.name || '',
    description: data.description || '',
    dose: data.dose || '',
    initialTime: /^\d{1,2}:\d{2}$/.test(data.initialTime ?? '') ? data.initialTime!.padStart(5, '0') : '',
    frequencyValue: Number(data.frequencyValue) > 0 ? Number(data.frequencyValue) : 0,
    frequencyUnit: data.frequencyUnit === 'días' ? 'días' : 'horas',
    startDate: toIsoDate(today), // fecha local, no la de UTC
    endDate: toIsoDate(endDate),
    instructions: data.instructions || '',
  };
}
