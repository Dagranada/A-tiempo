// Edge Function de Supabase: analiza la foto de un medicamento con Gemini.
//
// La clave de Gemini vive aquí, como secreto de Supabase (GEMINI_API_KEY), y
// nunca llega a la app. Solo atiende a una cuenta con sesión: la función misma
// revisa el token con Supabase Auth (no depende de "Verify JWT", que con las
// claves publicables nuevas no basta). La app manda su token sola.
//
// Recibe { image: "<jpeg en base64, sin prefijo data:>" } y devuelve el JSON
// que pide RESPONSE_SCHEMA. La app (src/services/geminiService.ts) completa
// fechas y deja vacío lo que no se pudo leer.

const GEMINI_MODEL = 'gemini-flash-latest'; // los nombres fijos caducan (ver Context/gotchas/gemini.md)
const MAX_IMAGE_CHARS = 8 * 1024 * 1024; // ~6 MB de foto en base64

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    description: { type: 'STRING' },
    dose: { type: 'STRING' },
    initialTime: { type: 'STRING' },
    frequencyValue: { type: 'NUMBER' },
    frequencyUnit: { type: 'STRING', enum: ['horas', 'días'] },
    instructions: { type: 'STRING' },
  },
  required: ['name', 'dose', 'initialTime', 'frequencyValue', 'frequencyUnit'],
};

const PROMPT =
  'Eres un asistente que lee fotos de cajas o recetas de medicamentos en español y ' +
  'extrae los datos para armar un plan de toma. Responde solo con el JSON solicitado. ' +
  'Si un dato no aparece en la imagen, no lo inventes: déjalo vacío ("" en los textos y 0 ' +
  'en la frecuencia). La persona lo completará a mano.';

// La app corre en otro dominio (Vercel, localhost, la app de Android): CORS abierto.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return reply(405, { error: 'Solo POST' });

  // ¿Hay una cuenta con sesión? Supabase Auth valida el token de la app.
  // SUPABASE_URL lo pone Supabase en toda función; la clave pública es la que
  // manda la app (o la anon de siempre, si la función la tiene).
  const authorization = req.headers.get('Authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) return reply(401, { error: 'Necesitas una cuenta con sesión' });
  const publicKey = Deno.env.get('SUPABASE_ANON_KEY') || req.headers.get('apikey') || '';
  const user = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
    headers: { Authorization: authorization, apikey: publicKey },
  });
  if (!user.ok) return reply(401, { error: 'Necesitas una cuenta con sesión' });

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return reply(500, { error: 'Falta el secreto GEMINI_API_KEY en Supabase' });

  let image: unknown;
  try {
    ({ image } = await req.json());
  } catch {
    return reply(400, { error: 'El cuerpo debe ser JSON con { image }' });
  }
  if (typeof image !== 'string' || image.length === 0 || image.length > MAX_IMAGE_CHARS) {
    return reply(400, { error: 'Falta la foto o es demasiado grande' });
  }

  const gemini = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: image } }],
          },
        ],
        generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
      }),
    }
  );

  if (!gemini.ok) {
    // El detalle queda en los logs de la función; a la app solo le llega el fallo.
    console.error('Gemini respondió', gemini.status, await gemini.text());
    return reply(502, { error: 'Gemini no pudo analizar la foto' });
  }

  const data = await gemini.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return reply(502, { error: 'Gemini no devolvió información utilizable' });

  try {
    return reply(200, JSON.parse(text));
  } catch {
    return reply(502, { error: 'Gemini devolvió un JSON inválido' });
  }
});
