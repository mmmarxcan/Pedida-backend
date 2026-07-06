import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "rect" | "heart";
  opacity: number;
  life: number;
}

interface Petal {
  id: number;
  x: number;
  y: number;
  scale: number;
  delay: number;
  duration: number;
  color: string;
  angle: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#E8A0BF",
  "#F5D5CB",
  "#C9B8E8",
  "#A8D8EA",
  "#FAE3B4",
  "#B5EAD7",
  "#FFDAC1",
  "#E2F0CB",
];

const PETAL_COLORS = [
  "#F9C6D0",
  "#FCD9E5",
  "#E8C7E8",
  "#C9E8F0",
  "#FDE8C8",
  "#D4EDD8",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FloatingPetals({ active }: { active: boolean }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (!active) return;
    const newPetals: Petal[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      y: 100,
      scale: 0.4 + Math.random() * 0.8,
      delay: Math.random() * 1.2,
      duration: 3.5 + Math.random() * 2,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
      angle: -60 + Math.random() * 120,
    }));
    setPetals(newPetals);
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: `petalFloat ${p.duration}s ease-out ${p.delay}s forwards`,
              "--tx": `${Math.sin((p.angle * Math.PI) / 180) * 120}px`,
              "--ty": `-${280 + Math.random() * 200}px`,
              "--rot": `${p.angle * 3}deg`,
            } as React.CSSProperties
          }
        >
          <svg
            width={`${20 * p.scale}`}
            height={`${20 * p.scale}`}
            viewBox="0 0 20 20"
          >
            <ellipse
              cx="10"
              cy="10"
              rx="5"
              ry="9"
              fill={p.color}
              style={{ transform: "rotate(-20deg)", transformOrigin: "center" }}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

function ConfettiCanvas({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  const spawnConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.45;

    const batch: Particle[] = Array.from({ length: 80 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        id: Date.now() + i,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        color:
          CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        shape: (["circle", "rect", "heart"] as const)[
          Math.floor(Math.random() * 3)
        ],
        opacity: 1,
        life: 1,
      };
    });
    particlesRef.current = [...particlesRef.current, ...batch];
  }, []);

  useEffect(() => {
    if (trigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    spawnConfetti();
    setTimeout(spawnConfetti, 180);
    setTimeout(spawnConfetti, 380);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(
        (p) => p.opacity > 0.02,
      );

      particlesRef.current.forEach((p) => {
        p.vy += 0.28;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          const s = p.size / 10;
          ctx.beginPath();
          ctx.moveTo(0, s * 3);
          ctx.bezierCurveTo(-s * 5, -s, -s * 10, s * 2, 0, s * 7);
          ctx.bezierCurveTo(s * 10, s * 2, s * 5, -s, 0, s * 3);
          ctx.fill();
        }
        ctx.restore();
      });

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, spawnConfetti]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

function BloomBackground({ phase }: { phase: "idle" | "yes" | "no" }) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background:
            phase === "yes"
              ? "radial-gradient(ellipse at 50% 60%, #FDE8F0 0%, #FDF2F8 35%, #FDF8F3 70%)"
              : phase === "no"
                ? "radial-gradient(ellipse at 50% 60%, #EEF0FD 0%, #F4F6FD 35%, #FDF8F3 70%)"
                : "radial-gradient(ellipse at 50% 60%, #FFF3EA 0%, #FDF8F3 60%)",
        }}
      />

      {/* Soft orb 1 */}
      <div
        className="absolute rounded-full blur-3xl transition-all duration-1500"
        style={{
          width: phase === "yes" ? "520px" : "320px",
          height: phase === "yes" ? "520px" : "320px",
          background:
            phase === "yes"
              ? "radial-gradient(circle, rgba(232,160,191,0.38) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(232,160,191,0.18) 0%, transparent 70%)",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          transitionDuration: "1200ms",
        }}
      />

      {/* Soft orb 2 */}
      <div
        className="absolute rounded-full blur-3xl transition-all duration-1500"
        style={{
          width: phase === "yes" ? "380px" : "200px",
          height: phase === "yes" ? "380px" : "200px",
          background:
            phase === "yes"
              ? "radial-gradient(circle, rgba(201,184,232,0.35) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(201,184,232,0.12) 0%, transparent 70%)",
          bottom: "15%",
          right: "5%",
          transitionDuration: "1400ms",
        }}
      />

      {/* Soft orb 3 */}
      <div
        className="absolute rounded-full blur-2xl transition-all duration-1000"
        style={{
          width: phase === "yes" ? "260px" : "140px",
          height: phase === "yes" ? "260px" : "140px",
          background:
            phase === "yes"
              ? "radial-gradient(circle, rgba(250,227,180,0.42) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(250,227,180,0.18) 0%, transparent 70%)",
          bottom: "20%",
          left: "5%",
          transitionDuration: "1000ms",
        }}
      />

      {/* Decorative dots grid - top right */}
      <svg
        className="absolute top-6 right-6 opacity-20"
        width="80"
        height="80"
        viewBox="0 0 80 80"
      >
        {[0, 16, 32, 48, 64].map((x) =>
          [0, 16, 32, 48, 64].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#C9A08A" />
          )),
        )}
      </svg>

      {/* Decorative dots - bottom left */}
      <svg
        className="absolute bottom-10 left-6 opacity-15"
        width="60"
        height="60"
        viewBox="0 0 60 60"
      >
        {[0, 15, 30, 45].map((x) =>
          [0, 15, 30, 45].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#C9A08A" />
          )),
        )}
      </svg>

      {/* Wavy line accent */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-10"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        height="80"
      >
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill="#E8A0BF"
        />
      </svg>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function App() {
  const [phase, setPhase] = useState<"idle" | "yes" | "no">("idle");
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const [noLabel, setNoLabel] = useState("No");
  const noRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const NO_LABELS = [
    "No",
    "¿Estás seguro?",
    "Piensa otra vez…",
    "¿De verdad?",
    "¿Ni modo?",
    "¡Última oportunidad!",
    "Vamos…",
    "Porfa, ¿sí?",
  ];

  const evadeNo = useCallback(() => {
    if (phase === "yes") return;

    // Limitamos el desplazamiento máximo a un radio seguro (ej. 110 píxeles)
    const range = 110;
    const randomX = (Math.random() - 0.5) * (range * 2);
    const randomY = (Math.random() - 0.5) * (range * 2);

    setNoPos({ x: randomX, y: randomY });
    const next = noCount + 1;
    setNoCount(next);
    setNoLabel(NO_LABELS[Math.min(next, NO_LABELS.length - 1)]);
    setPhase("no");
  }, [noCount, phase]);

  const handleYes = () => {
    setPhase("yes");
    setConfettiTrigger((t) => t + 1);
  };

  const handleReset = () => {
    setPhase("idle");
    setNoPos({ x: 0, y: 0 });
    setNoCount(0);
    setNoLabel("No");
  };

  const yesMessage =
    noCount === 0
      ? "¡Yay! Mi corazón está de fiesta ahora mismo 🎉"
      : noCount <= 3
        ? "¡Sabía que dirías que sí! Me pusiste nervioso ✨"
        : "Después de tanta persecución — valió la pena 💕";

  return (
    <>
      <style>{`
        @keyframes petalFloat {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.18); }
          30% { transform: scale(1); }
          45% { transform: scale(1.12); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .anim-fade-up { animation: fadeSlideUp 0.6s ease both; }
        .anim-heartbeat { animation: heartbeat 1.4s ease infinite; }
        .anim-float { animation: floatY 3s ease-in-out infinite; }
        .btn-yes-shimmer {
          background: linear-gradient(105deg, #E8A0BF 0%, #f0b8d0 40%, #e8c4d8 50%, #E8A0BF 60%, #d490af 100%);
          background-size: 200% auto;
        }
        .btn-yes-shimmer:hover {
          animation: shimmer 1.2s linear infinite;
        }
        .no-btn-abs {
          position: absolute;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .no-btn-static {
          position: relative;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <BloomBackground phase={phase} />
      <ConfettiCanvas trigger={confettiTrigger} />
      <FloatingPetals active={phase === "yes"} />

      {/* Full viewport container */}
      <div
        ref={containerRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {/* Card */}
        <div
          className="relative w-full max-w-sm mx-auto"
          style={{ animation: "fadeSlideUp 0.7s ease both" }}
        >
          {/* Envelope / card shape */}
          <div
            className="relative bg-card rounded-3xl shadow-sm overflow-hidden"
            style={{
              border: "1.5px solid rgba(232,160,191,0.3)",
              boxShadow:
                "0 4px 40px rgba(232,160,191,0.15), 0 1px 4px rgba(61,43,31,0.06)",
            }}
          >
            {/* Top strip */}
            <div
              className="h-2 w-full"
              style={{
                background: "linear-gradient(90deg, #E8A0BF, #C9B8E8, #FAE3B4)",
              }}
            />

            <div className="px-8 pt-10 pb-8 flex flex-col items-center gap-0">
              {/* Emoji / icon */}
              {phase !== "yes" ? (
                <div className="anim-float mb-2">
                  <span style={{ fontSize: "54px", lineHeight: 1 }}>🌸</span>
                </div>
              ) : (
                <div className="anim-heartbeat mb-2">
                  <span style={{ fontSize: "60px", lineHeight: 1 }}>💖</span>
                </div>
              )}

              {/* Main message */}
              {phase !== "yes" ? (
                <div className="text-center mt-4 mb-2">
                  <h1
                    className="text-3xl leading-snug tracking-tight"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: "italic",
                      color: "#3D2B1F",
                    }}
                  >
                    Jade Quieres ser
                    <br />
                    <span
                      style={{
                        background: "linear-gradient(90deg, #E8A0BF, #C9A0E0)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        fontStyle: "normal",
                        fontWeight: 500,
                      }}
                    >
                      mi Novia?
                    </span>
                  </h1>
                  {noCount > 0 && (
                    <p
                      className="mt-3 text-sm"
                      style={{
                        color: "#9A7B6E",
                        animation: "fadeSlideUp 0.4s ease both",
                      }}
                    >
                      {noCount === 1 && "El botón parece tímido…"}
                      {noCount === 2 && "¡Realmente no quiere ser atrapado!"}
                      {noCount >= 3 &&
                        noCount < 6 &&
                        "¿Todavía huyendo? Qué valiente."}
                      {noCount >= 6 && "Tienes resistencia, te concedo eso."}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center mt-4 mb-2 anim-fade-up">
                  <h1
                    className="text-2xl leading-snug"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: "italic",
                      color: "#3D2B1F",
                    }}
                  >
                    {yesMessage}
                  </h1>
                  <p className="mt-3 text-sm" style={{ color: "#9A7B6E" }}>
                    Te amo mujer.
                  </p>
                </div>
              )}

              {/* Divider */}
              <div
                className="w-16 my-6 rounded-full"
                style={{
                  height: "1.5px",
                  background: "rgba(232,160,191,0.35)",
                }}
              />

              {/* Buttons area */}
              {phase !== "yes" ? (
                <div
                  className="relative w-full flex flex-col items-center gap-4"
                  style={{ minHeight: "120px" }}
                >
                  {/* Yes button */}
                  <button
                    onClick={handleYes}
                    className="btn-yes-shimmer w-full py-3.5 rounded-2xl font-semibold text-white tracking-wide transition-transform active:scale-95"
                    style={{
                      fontSize: "1rem",
                      letterSpacing: "0.04em",
                      boxShadow: "0 6px 24px rgba(232,160,191,0.45)",
                    }}
                  >
                    Sí, ¡por supuesto! ✨
                  </button>

                  {/* No button — static initially, absolute/transform after first evasion */}
                  <button
                    ref={noRef}
                    onClick={evadeNo}
                    onMouseEnter={evadeNo}
                    className="py-3 px-8 rounded-2xl font-medium text-sm select-none transition-all duration-300"
                    style={{
                      color: "#9A7B6E",
                      background: "rgba(240,232,223,0.7)",
                      border: "1.5px solid rgba(180,140,120,0.2)",
                      ...(noCount > 0
                        ? {
                            position: "fixed",
                            left: `${noPos.x}px`,
                            top: `${noPos.y}px`,
                            zIndex: 999,
                            pointerEvents: "auto",
                          }
                        : {
                            position: "relative",
                            width: "100%",
                          }),
                    }}
                  >
                    {noLabel}
                  </button>
                </div>
              ) : (
                <div className="w-full anim-fade-up">
                  <button
                    onClick={handleReset}
                    className="w-full py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
                    style={{
                      color: "#9A7B6E",
                      background: "rgba(240,232,223,0.7)",
                      border: "1.5px solid rgba(180,140,120,0.2)",
                    }}
                  >
                    Preguntar de nuevo desde el inicio
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Small note below card */}
          <p
            className="text-center mt-6 text-xs"
            style={{ color: "#C4A898", fontFamily: "'Nunito', sans-serif" }}
          >
            {phase === "yes"
              ? "Hecho con amor y un poco de código 💌"
              : noCount === 0
                ? "Una pregunta pequeña con un gran corazón 💌"
                : "Pista: intenta atrapar el otro botón…"}
          </p>
        </div>
      </div>
    </>
  );
}
