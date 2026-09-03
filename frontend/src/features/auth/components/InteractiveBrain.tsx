import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useAuthVisualStore } from '../store/authVisualStore';
import classes from './InteractiveBrain.module.css';

type CSSVars = CSSProperties & Record<string, string | number>;

// ---------- Dữ liệu tĩnh, tính 1 lần (deterministic, không dùng Math.random để
// pulse-dot path khớp chính xác với vị trí node) ----------

const NODE_COUNT = 9;
const NODES = Array.from({ length: NODE_COUNT }, (_, i) => {
  const angle = (i / NODE_COUNT) * Math.PI * 2 - Math.PI / 2;
  const r = 34;
  return { x: 50 + Math.cos(angle) * r, y: 50 + Math.sin(angle) * r };
});

const EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 0],
  [0, 4],
  [2, 7],
];

const PULSE_EDGES: Array<[number, number]> = [
  [0, 1],
  [3, 4],
  [6, 7],
];

const PARTICLE_COUNT = 24;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const seed = i * 137.5; // golden-angle-ish, rải đều mà không cần random
  return {
    top: `${(seed * 1.9) % 100}%`,
    left: `${(seed * 2.7) % 100}%`,
    size: 2 + (i % 4),
    dur: 6 + (i % 5) * 1.4,
    delay: (i % 6) * 0.6,
    dx: ((i % 3) - 1) * 14,
    dy: ((i % 4) - 2) * 10,
  };
});

const ORBITS = [
  { w: 190, h: 150, duration: 38 },
  { w: 250, h: 195, duration: 52 },
  { w: 310, h: 240, duration: 68 },
];

const CARDS = [
  { icon: '💡', title: 'Ghi nhớ thông minh', subtitle: 'Flashcard +24', pos: 'cardTopRight', rotate: -6, delay: 0 },
  { icon: '📚', title: 'Đang học', subtitle: 'Machine Learning', pos: 'cardMidLeft', rotate: 4, delay: 1.2 },
  { icon: '🧠', title: 'Độ ghi nhớ', subtitle: '87%', pos: 'cardBottomRight', rotate: -3, delay: 2.1, progress: 87 },
  { icon: '🎯', title: 'Mục tiêu hôm nay', subtitle: '08 / 10', pos: 'cardBottomMid', rotate: 5, delay: 0.7, progress: 80 },
] as const;

const RING_R = 78;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R;

export function InteractiveBrain() {
  const rootRef = useRef<HTMLDivElement>(null);
  const emailFilled = useAuthVisualStore((s) => s.emailFilled);
  const passwordStrength = useAuthVisualStore((s) => s.passwordStrength);

  const [burst, setBurst] = useState(false);
  const prevReadyRef = useRef(false);

  useEffect(() => {
    const ready = emailFilled && passwordStrength === 2;
    if (ready && !prevReadyRef.current) {
      setBurst(true);
      const timer = setTimeout(() => setBurst(false), 1100);
      prevReadyRef.current = ready;
      return () => clearTimeout(timer);
    }
    prevReadyRef.current = ready;
  }, [emailFilled, passwordStrength]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const my = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    el.style.setProperty('--mx', mx.toFixed(3));
    el.style.setProperty('--my', my.toFixed(3));
  };

  const handleMouseLeave = () => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
  };

  const progressRatio = passwordStrength / 2;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progressRatio);

  return (
    <div
      ref={rootRef}
      className={classes.root}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={classes.glow} />

      <div className={classes.particles}>
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={classes.particle}
            style={
              {
                top: p.top,
                left: p.left,
                '--size': `${p.size}px`,
                '--dur': `${p.dur}s`,
                '--delay': `${p.delay}s`,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
              } as CSSVars
            }
          />
        ))}
      </div>

      {/* Vùng an toàn: không đè logo (trên) / tagline (dưới) - xem .stage trong CSS */}
      <div className={classes.stage}>
        <div className={classes.orbitLayer}>
          {ORBITS.map((o, i) => (
            <div
              key={i}
              className={classes.orbitRing}
              style={{
                width: o.w,
                height: o.h,
                animationDuration: `${o.duration}s`,
                animationDirection: i % 2 ? 'reverse' : 'normal',
              }}
            />
          ))}
        </div>

        <div className={`${classes.graphLayer} ${emailFilled ? classes.intense : ''}`}>
          <svg viewBox="0 0 100 100" className={classes.graphSvg}>
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                className={classes.graphLine}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
              />
            ))}

            {NODES.map((n, i) => (
              <circle
                key={i}
                className={classes.graphNode}
                cx={n.x}
                cy={n.y}
                r={1.6}
                style={{ '--node-delay': `${(i % 5) * 0.4}s` } as CSSVars}
              />
            ))}

            {PULSE_EDGES.map(([a, b], i) => (
              <circle
                key={`dot-${i}`}
                r={1.4}
                className={classes.pulseDot}
                style={
                  {
                    offsetPath: `path('M ${NODES[a].x} ${NODES[a].y} L ${NODES[b].x} ${NODES[b].y}')`,
                    '--pulse-delay': `${i * 0.8}s`,
                  } as CSSVars
                }
              />
            ))}
          </svg>
        </div>

        <div className={`${classes.brainWrap} ${burst ? classes.burst : ''}`}>
          <div className={`${classes.brain} ${emailFilled ? classes.emailActive : ''}`}>
            <svg className={classes.progressRing} viewBox="0 0 168 168">
              <circle className={classes.progressRingTrack} cx={84} cy={84} r={RING_R} />
              <circle
                className={classes.progressRingFill}
                cx={84}
                cy={84}
                r={RING_R}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
          </div>
        </div>

        <div className={classes.cardsLayer}>
          {CARDS.map((card) => (
            <div key={card.title} className={`${classes.cardPos} ${classes[card.pos]}`}>
              <div
                className={classes.card}
                style={
                  {
                    '--card-rotate': `${card.rotate}deg`,
                    '--card-delay': `${card.delay}s`,
                    transform: `rotate(${card.rotate}deg)`,
                  } as CSSVars
                }
              >
                <span className={classes.cardIcon}>{card.icon}</span>
                <div>
                  <div className={classes.cardTitle}>{card.title}</div>
                  <div className={classes.cardSubtitle}>{card.subtitle}</div>
                  {'progress' in card && (
                    <div className={classes.miniProgress}>
                      <div className={classes.miniProgressFill} style={{ width: `${card.progress}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}