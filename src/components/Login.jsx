import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HAIRLINE = 'rgba(15, 23, 42, 0.08)';
const LABEL_COLOR = '#64748B';
const TEXT_DARK = '#0f1724';
const ACCENT = '#4F46E5';
const SERIF = "'Playfair Display', serif";
const CARD_SHADOW = '0 20px 45px -20px rgba(15, 23, 42, 0.18)';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] } },
};

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(credentials);
    setLoading(false);

    if (success) {
      navigate('/dspace');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{ flex: '1 1 auto', background: 'linear-gradient(to right, #e6f0fa, #f9e6f0)' }}
    >
      {/* Atmosphere */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] rounded-full blur-3xl" style={{ background: 'rgba(79, 70, 229, 0.14)' }} />
        <div className="absolute -bottom-32 -right-24 w-[34rem] h-[34rem] rounded-full blur-3xl" style={{ background: 'rgba(244, 114, 182, 0.14)' }} />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            backgroundPosition: 'center top',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="overflow-hidden rounded-[2rem] border bg-white"
          style={{ borderColor: HAIRLINE, boxShadow: CARD_SHADOW }}
        >
          <div className="grid md:grid-cols-[1.05fr_1fr]">
            {/* ---- Editorial panel ---- */}
            <div
              className="relative p-10 md:p-14 overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f8faff 100%)' }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `linear-gradient(to bottom, ${ACCENT}, #8B5CF6, #EC4899)` }} />
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(79, 70, 229, 0.1)' }} />

              <div className="relative">
                <motion.div variants={itemVariants} className="flex items-center gap-2.5 mb-6">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 12px rgba(34, 197, 94, 0.7)' }} />
                  <span
                    className="text-[0.7rem] font-bold uppercase tracking-[0.16em]"
                    style={{ color: LABEL_COLOR }}
                  >
                    Observatorio de IA · Acceso restringido
                  </span>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5"
                  style={{ fontFamily: SERIF, color: TEXT_DARK }}
                >
                  Iniciar
                  <br />
                  sesión
                </motion.h1>

                <motion.p variants={itemVariants} className="text-[0.95rem] leading-relaxed mb-10 max-w-sm" style={{ color: LABEL_COLOR }}>
                  Acceso exclusivo para administradores del Observatorio de Inteligencia Artificial del Ecuador.
                </motion.p>

                <motion.div variants={itemVariants} className="pt-6 border-t" style={{ borderColor: HAIRLINE }}>
                  <p className="font-serif italic text-xl md:text-2xl leading-snug mb-3" style={{ color: TEXT_DARK }}>
                    “IA responsable para un Ecuador conectado”
                  </p>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]" style={{ color: LABEL_COLOR }}>
                    Observatorio de IA · Ecuador
                  </span>
                </motion.div>
              </div>
            </div>

            {/* ---- Form panel ---- */}
            <div className="p-10 md:p-14 border-t md:border-t-0 md:border-l" style={{ borderColor: HAIRLINE }}>
              <motion.div variants={itemVariants} className="flex items-center gap-1.5 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: ACCENT }} />
                <span
                  className="text-[0.7rem] font-bold uppercase tracking-[0.16em]"
                  style={{ color: LABEL_COLOR }}
                >
                  Autenticación
                </span>
              </motion.div>

              <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-8" style={{ fontFamily: SERIF, color: TEXT_DARK }}>
                Credenciales
              </motion.h2>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              <motion.form variants={containerVariants} onSubmit={handleSubmit} className="space-y-5">
                <motion.div variants={itemVariants}>
                  <label htmlFor="login-username" className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_DARK }}>
                    Usuario
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleChange}
                    placeholder="Tu usuario"
                    required
                    autoComplete="username"
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 focus:border-[#4F46E5] transition-all disabled:opacity-60"
                    style={{ borderColor: HAIRLINE, color: TEXT_DARK }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="login-password" className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: TEXT_DARK }}>
                    Contraseña
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40 focus:border-[#4F46E5] transition-all disabled:opacity-60"
                    style={{ borderColor: HAIRLINE, color: TEXT_DARK }}
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group inline-flex items-center justify-center gap-2 w-full rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: ACCENT, boxShadow: '0 12px 24px -12px rgba(79, 70, 229, 0.6)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#4338CA'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; }}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Verificando...
                      </span>
                    ) : (
                      <>
                        Iniciar sesión
                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.form>

              <motion.div variants={itemVariants} className="mt-8 pt-6 border-t flex flex-wrap items-center justify-between gap-3" style={{ borderColor: HAIRLINE }}>
                <span className="text-xs" style={{ color: LABEL_COLOR }}>
                  Acceso exclusivo para administradores
                </span>
                <Link to="/" className="text-xs font-semibold transition-colors" style={{ color: ACCENT }}>
                  ← Volver al inicio
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Login;
