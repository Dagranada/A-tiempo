import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { SectionTitle } from './ProfileFields';

interface AccountScreenProps {
  // Devuelven un error para mostrar, o null si salió bien.
  onSendCode: (email: string) => Promise<string | null>;
  onVerifyCode: (email: string, code: string) => Promise<string | null>; // al acertar, App entra solo
}

const labelClass = 'block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5';
const inputBase =
  'w-full bg-white border rounded-2xl px-4 py-3 h-12 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all flex items-center';
const primaryButton =
  'w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY_CODE: string[] = Array(CODE_LENGTH).fill('');

/**
 * Entrar o crear la cuenta, sin contraseña: correo → código de 6 números que
 * Supabase manda al correo. Va después del splash y antes de "Nuevo perfil".
 * Sirve igual para una cuenta nueva y para volver a entrar (otro teléfono).
 */
export const AccountScreen: React.FC<AccountScreenProps> = ({ onSendCode, onVerifyCode }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  // Un número por cuadro; '' = cuadro vacío.
  const [digits, setDigits] = useState<string[]>(EMPTY_CODE);
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join('');
  const [error, setError] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [isBusy, setIsBusy] = useState(false); // esperando a Supabase

  // Cuenta regresiva para "Reenviar el código".
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // Escribe `text` desde el cuadro `start`: un número, o el código completo si se
  // pega o el teléfono lo sugiere desde el correo. El foco pasa al siguiente vacío.
  const fillFrom = (start: number, text: string) => {
    const incoming = text.replace(/\D/g, '').slice(0, CODE_LENGTH - start).split('');
    if (incoming.length === 0) return;
    const next = [...digits];
    incoming.forEach((digit, k) => {
      next[start + k] = digit;
    });
    setDigits(next);
    setError('');
    const firstEmpty = next.findIndex((d) => d === '');
    boxRefs.current[firstEmpty === -1 ? CODE_LENGTH - 1 : firstEmpty]?.focus();
  };

  const handleBoxKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Cuadro vacío: borra el anterior y vuelve a él.
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      boxRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      boxRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      boxRefs.current[index + 1]?.focus();
    }
  };

  const sendCode = async (address: string) => {
    setIsBusy(true);
    setError('');
    const failure = await onSendCode(address);
    setIsBusy(false);
    if (failure) return setError(failure);
    setDigits(EMPTY_CODE);
    setResendIn(RESEND_SECONDS);
    setStep('code');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    if (step === 'email') {
      const address = email.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(address)) return setError('Escribe un correo válido, por ejemplo ana@gmail.com');
      setEmail(address);
      return sendCode(address);
    }
    if (code.length !== CODE_LENGTH) return setError(`Escribe los ${CODE_LENGTH} números del código`);
    setIsBusy(true);
    setError('');
    const failure = await onVerifyCode(email, code);
    setIsBusy(false);
    if (failure) setError(failure);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex flex-col">
      <header className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-10 shrink-0">
        {step === 'code' ? (
          <button
            onClick={() => {
              setStep('email');
              setError('');
            }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Cambiar el correo"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
        <h1 className="text-lg font-bold text-gray-900 font-heading">
          {step === 'email' ? 'Crea tu cuenta' : 'Escribe el código'}
        </h1>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <form onSubmit={handleSubmit} noValidate className="p-5 pb-8 space-y-5 flex-1 flex flex-col">
        {step === 'email' ? (
          <div className="space-y-5">
            <SectionTitle>Tu correo</SectionTitle>
            <div>
              <label htmlFor="account-email" className={labelClass}>
                Correo electrónico *
              </label>
              <div className="relative">
                <input
                  id="account-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Ej.: ana@gmail.com"
                  className={`${inputBase} ${error ? 'border-red-500' : 'border-gray-200'} pr-10`}
                />
                <Mail className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {error ? (
                <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Te enviaremos un código de {CODE_LENGTH} números. No necesitas contraseña.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <SectionTitle>Código</SectionTitle>
            <p className="text-sm text-gray-600 leading-relaxed">
              Lo enviamos a <span className="font-bold text-gray-900 break-all">{email}</span>.
            </p>
            <div>
              <label htmlFor="account-code-0" className={labelClass}>
                Código de {CODE_LENGTH} números *
              </label>
              {/* Seis cuadros; pegar el código en cualquiera llena todos */}
              <div className="grid grid-cols-6 gap-2" role="group" aria-label={`Código de ${CODE_LENGTH} números`}>
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      boxRefs.current[index] = el;
                    }}
                    id={`account-code-${index}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Número ${index + 1} de ${CODE_LENGTH}`}
                    value={digit}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        const next = [...digits];
                        next[index] = '';
                        setDigits(next);
                        return;
                      }
                      // Al escribir sobre un número ya puesto, queda solo el nuevo.
                      fillFrom(index, value.length > 1 && digit ? value.replace(digit, '') || value : value);
                    }}
                    onKeyDown={(e) => handleBoxKeyDown(index, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      fillFrom(0, e.clipboardData.getData('text'));
                    }}
                    className={`w-full min-w-0 bg-white border rounded-2xl h-14 text-center text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0ee5ba] transition-all ${
                      error && !digit ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                ))}
              </div>
              {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
            </div>

            <button
              type="button"
              onClick={() => void sendCode(email)}
              disabled={resendIn > 0 || isBusy}
              className="text-sm font-semibold text-[#0bc4a0] hover:text-[#087064] disabled:text-gray-400 px-1 py-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ee5ba]"
            >
              {resendIn > 0 ? `Reenviar el código en ${resendIn} s` : 'Reenviar el código'}
            </button>

          </div>
        )}

        {/* Botón al final de la pantalla */}
        <div className="pt-2 mt-auto">
          <button type="submit" disabled={isBusy} className={`${primaryButton} disabled:opacity-70`}>
            {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {step === 'email' ? (isBusy ? 'Enviando el código…' : 'Enviarme el código') : isBusy ? 'Revisando…' : 'Continuar'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
