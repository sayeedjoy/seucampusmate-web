import type { CSSProperties, ReactNode } from "react"
import { Bar, Stage, Text } from "@/components/stageshow/kit"
import "./hero-widgets.css"

// The hero's widget wall, built with Stageshow (gold: examples/many-of-one).
// A still: a wall of home-screen widgets, the phone standing in front of it.
//
// - Decorative only: nothing here is a link or a control, and the whole wall is
//   hidden from assistive tech (the phone beside it carries the description).
// - Many of one: every tile is the same anatomy (a title line, a subtitle line,
//   one graphic), in its own color. Only three tiles have words, and they tell
//   the phone's story: the CSE261 exam it grades, attendance, and the CGPA it
//   lands on (3.44, the phone's payoff). The rest is filler bars.
// - The CGPA tile leads by depth (the hero shadow), not by a ring or size.
// - Rows are right-aligned so the far tiles always run under the phone; their
//   right padding staggers them, and the left ends fade out (the parent's mask).
//
// Real strings: Attendance, 86%, CSE261 final, 3 days, Cumulative CGPA, 3.44.

type Tone = { bg: string; ink: string }

const TONES = {
  mint: { bg: "linear-gradient(135deg,#c4f3e2,#86d9c4)", ink: "#0d4d40" },
  slate: { bg: "linear-gradient(135deg,#647389,#46536a)", ink: "#ffffff" },
  cloud: { bg: "linear-gradient(135deg,#eef1f6,#cfd7e3)", ink: "#26324a" },
  peach: { bg: "linear-gradient(135deg,#fdd9cf,#f6ad9d)", ink: "#6b2a1d" },
  lilac: { bg: "linear-gradient(135deg,#d2ccfa,#a29bef)", ink: "#2c2470" },
  night: { bg: "#1f232b", ink: "#ffffff" },
  rose: { bg: "linear-gradient(135deg,#ffd9e6,#f7adc8)", ink: "#5e1734" },
  amber: { bg: "linear-gradient(135deg,#ffe6b0,#ffc36a)", ink: "#5a3600" },
  teal: { bg: "linear-gradient(135deg,#a8dedc,#5cb6b6)", ink: "#ffffff" },
  lime: { bg: "linear-gradient(135deg,#fdf3a3,#b5e5a0)", ink: "#30461a" },
} satisfies Record<string, Tone>

function Tile({ tone, wide, focus, children }: { tone: Tone; wide?: boolean; focus?: boolean; children: ReactNode }) {
  return (
    <div
      className="hw-tile"
      data-wide={wide || undefined}
      data-focus={focus || undefined}
      style={{ "--hw-bg": tone.bg, "--hw-ink": tone.ink } as CSSProperties}
    >
      {children}
    </div>
  )
}

/** Filler in the tile's own ink, so a bar reads as that widget's text, not gray paint */
const Line = ({ w, h = 7, o = 0.42 }: { w: number; h?: number; o?: number }) => (
  <Bar w={w} h={h} r={h / 2} style={{ background: "var(--hw-ink)", opacity: o }} />
)

const Lines = ({ a, b }: { a: number; b: number }) => (
  <div className="hw-lines">
    <Line w={a} />
    <Line w={b} h={6} o={0.28} />
  </div>
)

function Ring({ value, size }: { value: number; size: number }) {
  const r = 15.5
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" className="hw-ring">
      <circle cx="18" cy="18" r={r} fill="none" stroke="var(--hw-ink)" strokeOpacity="0.18" strokeWidth="5" />
      <circle
        cx="18"
        cy="18"
        r={r}
        fill="none"
        stroke="var(--hw-ink)"
        strokeOpacity="0.7"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
      />
    </svg>
  )
}

const Meter = ({ value }: { value: number }) => (
  <div className="hw-meter">
    <span style={{ width: `${value}%` }} />
  </div>
)

export function HeroWidgets() {
  return (
    <div className="hw" aria-hidden>
      <Stage width={960} height={340}>
        {() => (
          <div className="hw-wall">
            {/* Row 1: the exam the phone is about, and attendance */}
            <div className="hw-row" style={{ paddingRight: 130 }}>
              <Tile tone={TONES.mint}>
                <div className="hw-lines">
                  <Text className="hw-title">Attendance</Text>
                  <Text className="hw-sub">86% this term</Text>
                </div>
                <Meter value={86} />
              </Tile>
              <Tile tone={TONES.slate} wide>
                {/* Stacked, not split: the tile's right end runs under the phone */}
                <div className="hw-lines">
                  <Text className="hw-title hw-cyan">CSE261 final</Text>
                  <Text className="hw-sub">In 3 days</Text>
                </div>
                <div className="hw-ticks">
                  {Array.from({ length: 30 }, (_, i) => (
                    <span key={i} data-on={i < 27 || undefined} />
                  ))}
                </div>
              </Tile>
            </div>

            {/* Row 2: filler widgets */}
            <div className="hw-row">
              <Tile tone={TONES.cloud}>
                <Lines a={72} b={48} />
                <Line w={56} h={6} o={0.22} />
              </Tile>
              <Tile tone={TONES.peach} wide>
                <div className="hw-split">
                  <Lines a={84} b={60} />
                  <Ring value={60} size={48} />
                </div>
              </Tile>
              <Tile tone={TONES.lilac} wide>
                <Lines a={92} b={40} />
                <div className="hw-pills">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} data-on={i < 6 || undefined} />
                  ))}
                </div>
              </Tile>
              <Tile tone={TONES.night}>
                <Lines a={44} b={60} />
                <div className="hw-meter hw-meter--blue">
                  <span style={{ width: "66%" }} />
                </div>
              </Tile>
            </div>

            {/* Row 3: the CGPA the phone lands on leads the wall */}
            <div className="hw-row" style={{ paddingRight: 164 }}>
              <Tile tone={TONES.rose} wide>
                <Lines a={88} b={128} />
                <Line w={150} h={6} o={0.22} />
              </Tile>
              <Tile tone={TONES.amber} wide focus>
                <div className="hw-split hw-split--end">
                  <div>
                    <Text className="hw-sub">Cumulative CGPA</Text>
                    <Text className="hw-big">3.44</Text>
                  </div>
                  <div className="hw-bars">
                    {[52, 64, 58, 76, 70, 88].map((h, i) => (
                      <span key={i} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </Tile>
              <Tile tone={TONES.teal}>
                <Lines a={64} b={40} />
                <div className="hw-end">
                  <Ring value={72} size={34} />
                </div>
              </Tile>
              <Tile tone={TONES.lime}>
                <Lines a={58} b={70} />
                <Line w={40} h={6} o={0.22} />
              </Tile>
            </div>
          </div>
        )}
      </Stage>
    </div>
  )
}
