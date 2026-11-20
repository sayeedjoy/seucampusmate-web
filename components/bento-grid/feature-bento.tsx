"use client"

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { Bar, Check, Count, Phone, Roll, Stage, useReducedMotion } from "@/components/stageshow/kit"
import type { Act } from "@/components/stageshow/kit"
import "./feature-bento.css"

// The landing page's feature grid, built with Stageshow (references/bento.md).
//
//   Tile           Span   Kind        The one thing                       Moves (once, on scroll-in)
//   Class Routine  1 × 2  Hero UI     the live class on the phone         attendance countdown ticks
//   Marks Tracker  1 × 1  Stat        "13/30" needed in the final for A+  the number counts down
//   Todo List      1 × 1  Component   one task checked off                check draws, progress rolls
//   Exam Schedule  1 × 1  Object      a stack of exam slips               the slips fan out
//   Fee Calculator 1 × 1  Diagram     ৳26,600 split into installments     the segments grow in
//
// One device in the whole grid (the hero's). Each picture is its own Stage
// at 1:1, cropped by its tile; the copy is page text, never inside a stage.
// Each tile plays one beat, 110ms after the one before it in reading order.

const STEP = 110
const LEAD = 450

type Beat = { on: boolean }
const before: Beat = { on: false }
const after: Beat = { on: true }
const beat = (i: number) => async (a: Act<Beat>) => {
  await a.wait(LEAD + i * STEP)
  await a.set({ on: true })
}

// The tile owns the crop: a measured Stage matches the picture slot's width,
// so nothing is sliced before the tile edge.
function usePictureSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () => {
      const r = node.getBoundingClientRect()
      setSize({ width: Math.max(1, Math.round(r.width)), height: Math.max(1, Math.round(r.height)) })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, size] as const
}

function useInView<T extends Element>(delay: number) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        t = window.setTimeout(() => setSeen(true), delay)
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(t)
    }
  }, [delay])
  return [ref, seen] as const
}

function Tile({ area, lead, children, picture, invert }: { area: string; lead?: ReactNode; children?: ReactNode; picture?: ReactNode; invert?: boolean }) {
  return (
    <article className={`fb-tile fb-tile--${area}`} data-invert={invert || undefined}>
      {lead ? (
        <p className="fb-copy">
          <b>{lead}</b> {children}
        </p>
      ) : (
        children
      )}
      {picture}
    </article>
  )
}

/* ---------------- Class Routine (hero) ---------------- */

type Clock = { sec: number }
const WINDOW = 15 * 60
const mmss = (n: number) => `${Math.floor(n / 60)}:${String(Math.round(n) % 60).padStart(2, "0")}`

const DAYS = [
  { d: "Sat", n: 15 },
  { d: "Sun", n: 16 },
  { d: "Mon", n: 17 },
  { d: "Tue", n: 18 },
  { d: "Wed", n: 19 },
  { d: "Thu", n: 20, today: true },
]

function Pin() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path fill="currentColor" d="M8 1.5a4.75 4.75 0 0 0-4.75 4.75c0 3.4 4.75 8.25 4.75 8.25s4.75-4.85 4.75-8.25A4.75 4.75 0 0 0 8 1.5Zm0 6.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.75V8l2.25 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Person() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <circle cx="8" cy="5" r="3" fill="currentColor" />
      <path fill="currentColor" d="M2.5 14c0-3 2.5-4.75 5.5-4.75S13.5 11 13.5 14Z" />
    </svg>
  )
}

function Routine() {
  const [picture, size] = usePictureSize()
  const phone = size ? Math.min(340, size.width - 56) : 0
  return (
    <Tile
      area="hero"
      lead="Class Routine."
      picture={
        <div ref={picture} className="fb-picture fb-picture--hero">
          {size && <Stage<Clock>
            width={size.width}
            height={size.height}
            initial={{ sec: WINDOW - 26 }}
            poster={{ sec: WINDOW - 29 }}
            play="once"
            script={async (a) => {
              await a.wait(LEAD + 300)
              for (let i = 1; i <= 3; i++) {
                await a.set({ sec: WINDOW - 26 - i })
                if (i < 3) await a.wait(1000)
              }
            }}
            className="fb-stage"
          >
            {(s) => (
              <Phone width={phone} frame="android" time="1:27" className="fb-phone" style={{ left: (size.width - phone) / 2 }}>
                <div className="fb-app">
                  <div className="fb-app-head">
                    <div className="fb-app-title">Today&apos;s Classes</div>
                    <div className="fb-app-date">Thursday, 20 November</div>
                  </div>
                  <div className="fb-days">
                    {DAYS.map((day) => (
                      <span key={day.d} className="fb-day" data-today={day.today || undefined}>
                        <span className="fb-day-name">{day.d}</span>
                        <span className="fb-day-num">{day.n}</span>
                      </span>
                    ))}
                  </div>

                  <div className="fb-live">
                    <div className="fb-live-top">
                      <div>
                        <div className="fb-live-code">CSE281.1</div>
                        <div className="fb-live-name">Java</div>
                      </div>
                      <span className="fb-live-pill">
                        <span className="fb-live-dot" />
                        Live
                      </span>
                    </div>
                    <div className="fb-live-meta">
                      <span><ClockIcon />1:26 – 2:26 PM</span>
                      <span><Pin />Room 214</span>
                      <span><Person /><Bar w={58} h={6} tone={3} /></span>
                    </div>
                    <div className="fb-meter-row">
                      <span>Class progress</span>
                      <b>59m left</b>
                    </div>
                    <div className="fb-meter"><span style={{ transform: `scaleX(${2 / 60})` }} /></div>
                    <div className="fb-meter-row">
                      <span>Attendance time left</span>
                      <b className="fb-amber"><Roll>{mmss(s.sec)}</Roll></b>
                    </div>
                    <div className="fb-meter fb-meter--amber"><span style={{ transform: `scaleX(${s.sec / WINDOW})` }} /></div>
                  </div>

                  <div className="fb-up-next">Up next</div>
                  {[
                    { code: 70, name: 52, a: 96, b: 64 },
                    { code: 62, name: 74, a: 88, b: 58 },
                    { code: 76, name: 46, a: 92, b: 70 },
                  ].map((c, i) => (
                    <div key={i} className="fb-next">
                      <div className="fb-next-top">
                        <Bar w={c.code} h={8} tone={4} />
                        <Bar w={44} h={18} r={9} tone={1} />
                      </div>
                      <Bar w={c.name} h={6} tone={3} />
                      <div className="fb-next-meta">
                        <Bar w={c.a} h={6} tone={2} />
                        <Bar w={c.b} h={6} tone={2} />
                      </div>
                    </div>
                  ))}
                </div>
              </Phone>
            )}
          </Stage>}
        </div>
      }
    >
      Today&apos;s classes and rooms, with the attendance window counting down.
    </Tile>
  )
}

/* ---------------- Marks Tracker (stat) ---------------- */

function Marks() {
  const reduced = useReducedMotion()
  const [ref, seen] = useInView<HTMLDivElement>(LEAD + STEP)
  return (
    <Tile area="marks" invert>
      <div ref={ref} className="fb-stat">
        <p className="fb-copy fb-copy--stat">
          <b>Marks Tracker.</b> To keep your A+, you need
        </p>
        <span className="fb-stat-number">
          <Count value={seen || reduced ? 13 : 24} duration={1100} />
          <span className="fb-stat-of">/30</span>
        </span>
        <span className="fb-stat-label">in the final, worked out from every mark so far.</span>
      </div>
    </Tile>
  )
}

/* ---------------- Todo List (component) ---------------- */

function Todo() {
  const [picture, size] = usePictureSize()
  return (
    <Tile
      area="todo"
      lead="Todo List."
      picture={
        <div ref={picture} className="fb-picture fb-picture--fill">
          {size && <Stage<Beat> width={size.width} height={size.height} initial={before} poster={after} play="once" script={beat(2)} className="fb-stage">
            {(s) => (
              <div className="fb-tasks">
                <div className="fb-tasks-head">
                  <span>Tasks</span>
                  <span className="fb-tasks-count">
                    <Count value={s.on ? 2 : 1} duration={500} /> of 3 done
                  </span>
                </div>
                <div className="fb-progress"><span style={{ transform: `scaleX(${s.on ? 2 / 3 : 1 / 3})` }} /></div>
                <div className="fb-task" data-done={s.on || undefined}>
                  <span className="fb-task-rule" />
                  <span className="fb-task-text">
                    <span className="fb-task-title">Lab report</span>
                    <span className="fb-task-tags">
                      <span className="fb-tag fb-tag--blue">Assignment</span>
                      <span className="fb-task-due">Due tomorrow</span>
                    </span>
                  </span>
                  <Check on={s.on} size={20} className="fb-check" />
                </div>
                <div className="fb-task">
                  <span className="fb-task-rule" />
                  <span className="fb-task-text">
                    <span className="fb-task-title">AI class test</span>
                    <span className="fb-task-tags">
                      <span className="fb-tag">Class Test</span>
                      <span className="fb-task-due">In 3 days</span>
                    </span>
                  </span>
                  <Check on={false} size={20} className="fb-check" />
                </div>
                <div className="fb-task fb-task--filler">
                  <span className="fb-task-rule" />
                  <span className="fb-task-text">
                    <Bar w={92} h={7} tone={3} />
                    <Bar w={120} h={6} tone={2} />
                  </span>
                  <Check on={false} size={20} className="fb-check" />
                </div>
              </div>
            )}
          </Stage>}
        </div>
      }
    >
      Class tests and deadlines, checked off as you go.
    </Tile>
  )
}

/* ---------------- Exam Schedule (object) ---------------- */

function Exams() {
  const [picture, size] = usePictureSize()
  return (
    <Tile
      area="exam"
      lead="Exam Schedule."
      picture={
        <div ref={picture} className="fb-picture fb-picture--fill">
          {size && <Stage<Beat> width={size.width} height={size.height} initial={before} poster={after} play="once" script={beat(3)} className="fb-stage">
            {(s) => (
              <div className="fb-slips" data-on={s.on || undefined}>
                <div className="fb-slip fb-slip--3" aria-hidden />
                <div className="fb-slip fb-slip--2" aria-hidden />
                <div className="fb-slip fb-slip--1">
                  <span className="fb-slip-code">CSE181.2</span>
                  <span className="fb-slip-title">Discrete Mathematics</span>
                  <span className="fb-slip-boxes">
                    <span className="fb-slip-box">
                      <span className="fb-slip-label">Date</span>
                      <span className="fb-slip-value">Sun, 14 Dec</span>
                    </span>
                    <span className="fb-slip-box">
                      <span className="fb-slip-label">Time</span>
                      <span className="fb-slip-value">2:30 – 4:30 PM</span>
                    </span>
                  </span>
                </div>
              </div>
            )}
          </Stage>}
        </div>
      }
    >
      Search a course code for its date, time and room.
    </Tile>
  )
}

/* ---------------- Fee Calculator (diagram) ---------------- */

const PARTS = [
  { label: "1st installment", share: 40, amount: "10,640" },
  { label: "2nd installment", share: 30, amount: "7,980" },
  { label: "3rd installment", share: 30, amount: "7,980" },
]

function Fees() {
  const [picture, size] = usePictureSize()
  return (
    <Tile
      area="fee"
      lead="Fee Calculator."
      picture={
        <div ref={picture} className="fb-picture fb-picture--fill">
          {size && <Stage<Beat> width={size.width} height={size.height} initial={before} poster={after} play="once" script={beat(4)} className="fb-stage">
            {(s) => (
              <div className="fb-fees" data-on={s.on || undefined}>
                <div className="fb-fees-total">
                  <span className="fb-fees-label">Total semester fee</span>
                  <span className="fb-fees-amount">৳26,600</span>
                </div>
                <div className="fb-split">
                  {PARTS.map((p, i) => (
                    <span key={p.label} className={`fb-seg fb-seg--${i}`} style={{ flexGrow: p.share }} />
                  ))}
                </div>
                <div className="fb-legend">
                  {PARTS.map((p, i) => (
                    <div key={p.label} className="fb-legend-row">
                      <span className={`fb-legend-dot fb-seg--${i}`} />
                      <span className="fb-legend-name">{p.label}</span>
                      <span className="fb-legend-share">{p.share}%</span>
                      <span className="fb-legend-amount">৳{p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Stage>}
        </div>
      }
    >
      Your semester fee, waiver included, split into installments.
    </Tile>
  )
}

export function FeatureBento() {
  return (
    <div className="seu-bento">
      <div className="fb-grid">
        <Routine />
        <Marks />
        <Todo />
        <Exams />
        <Fees />
      </div>
    </div>
  )
}
