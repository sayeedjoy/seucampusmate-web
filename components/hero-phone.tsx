"use client"

import type { ReactNode } from "react"
import { ArrowLeft, Bell, CalendarDays, ChevronDown, ClipboardList, Search, Wallet } from "lucide-react"
import { Bar, Count, Expand, Menu, Phone, Popover, Roll, Row, Stage, type Act } from "@/components/stageshow/kit"
import "./hero-phone.css"

// The landing hero's phone, built with Stageshow (gold: examples/phone-touch).
//
// A flow in the app, told as one object, in four beats:
//   1. Home (context): the greeting, Quick Actions and the CGPA card.
//   2. A tap on the CGPA card opens it into the calculator (the card's header
//      becomes the screen's header, never a swap).
//   3. The one ungraded course gets A+ from its grade menu.
//   4. The CGPA rolls 3.40 -> 3.44 and the credits 45 -> 48 (the payoff),
//      holds, then Back folds the screen into its card.
// The grade and CGPA reset while the card is closed, so data never rewinds
// in view.
//
// Real strings: the greeting, Quick Actions and its three tiles, CGPA
// Calculator, the course rows, the grade menu, the CGPA. Everything else is
// a line or a shape.

type S = { open: boolean; menu: boolean; hover: number; grade: string | null }
const START: S = { open: false, menu: false, hover: -1, grade: null }
const POSTER: S = { open: true, menu: false, hover: -1, grade: "A+" }

// Screen points (the Pixel's screen is 412 wide)
const CARD = { top: 318, h: 96 }
/** How far the header slides up when closed, so the card shows its title band and not the status-bar safe area */
const LIFT = 40
const REST = { wide: { x: 300, y: 540 }, compact: { x: 200, y: 500 } }

const GRADES = [
  { g: "A+", p: "4.00" },
  { g: "A", p: "3.75" },
  { g: "A-", p: "3.50" },
  { g: "B+", p: "3.25" },
]

const script = async (a: Act<S>) => {
  await a.wait(1000)
  a.mark("open")
  await a.click("card")
  a.put({ open: true })
  await a.wait(1300)
  a.mark("grade")
  await a.click("grade")
  a.put({ menu: true })
  await a.wait(500)
  await a.move("grade-0")
  a.put({ hover: 0 })
  await a.wait(250)
  await a.click()
  // Tick the row, then close the menu in the next set (Popover freezes its contents as it closes)
  a.put({ grade: "A+" })
  await a.wait(120)
  a.put({ menu: false, hover: -1 })
  a.mark("payoff")
  await a.move(REST[a.layout])
  await a.wait(2600)
  a.mark("close")
  await a.click("back")
  a.put({ open: false })
  await a.wait(700)
  // Behind the card's clip now: reset the calculator unseen
  await a.snap({ grade: null })
  // The finger lifts back to where it started; touch shows nothing between taps
  await a.move(REST[a.layout])
}

function Tile({ icon, label, tone }: { icon: ReactNode; label: string; tone: string }) {
  return (
    <div className="hp-tile">
      <span className={`hp-tile-icon hp-tone--${tone}`}>{icon}</span>
      <span className="hp-tile-label">{label}</span>
      <Bar w={58} h={6} tone={2} />
    </div>
  )
}

export function HeroPhone() {
  return (
    <Stage<S>
      width={560}
      height={620}
      compact={{ below: 520, width: 358, height: 540 }}
      initial={START}
      poster={POSTER}
      script={script}
      cursor={{ at: REST, style: "touch" }}
      className="hp"
    >
      {(s, rect, layout) => {
        const graded = s.grade !== null
        return (
          <Phone
            width={layout === "compact" ? 326 : 380}
            frame="android"
            time="8:30"
            className="hp-phone"
            data-open={s.open || undefined}
          >
            {/* ---- Home ---- */}
            <div className="hp-home" data-back={s.open || undefined}>
              <header className="hp-greet">
                <span className="hp-avatar">S</span>
                <span className="hp-greet-text">
                  <span className="hp-greet-hi">Good morning</span>
                  <span className="hp-greet-name">Student</span>
                </span>
                <span className="hp-greet-icons">
                  <Search size={20} strokeWidth={2} />
                  <Bell size={20} strokeWidth={2} />
                </span>
              </header>

              <div className="hp-section">Quick Actions</div>
              <div className="hp-tiles">
                <Tile icon={<CalendarDays size={18} strokeWidth={2} />} label="Class Routine" tone="blue" />
                <Tile icon={<ClipboardList size={18} strokeWidth={2} />} label="Exam Routine" tone="green" />
                <Tile icon={<Wallet size={18} strokeWidth={2} />} label="Fees" tone="amber" />
              </div>

              <div className="hp-section" style={{ top: CARD.top - 40 }}>Academic Excellence</div>
              <span className="hp-slot" data-target="card" style={{ top: CARD.top, height: CARD.h }} />

              <div className="hp-more" style={{ top: CARD.top + CARD.h + 14 }}>
                {[
                  [84, 120],
                  [70, 104],
                ].map(([t, d], i) => (
                  <div key={i} className="hp-more-card">
                    <Bar w={28} h={28} r={14} tone={2} />
                    <Bar w={t} h={8} tone={4} />
                    <Bar w={d} h={6} tone={2} />
                  </div>
                ))}
              </div>
            </div>

            {/* ---- The CGPA card and the calculator are one element ---- */}
            <div className="hp-press">
              <Expand className="hp-detail" open={s.open} from={rect("card")} radius={22} duration={620}>
                <div className="hp-detail-inner" style={{ transform: `translateY(${s.open ? 0 : -LIFT}px)` }}>
                  <div className="hp-head">
                    <span className="hp-back" data-target="back">
                      <ArrowLeft size={20} strokeWidth={2} />
                    </span>
                    <span className="hp-head-title" style={{ transform: `translateX(${s.open ? 0 : -28}px)` }}>
                      <span className="hp-head-name">CGPA Calculator</span>
                      <span className="hp-head-sub">Semester and cumulative GPA</span>
                    </span>
                    <div className="hp-score">
                      <span className="hp-score-label">Cumulative GPA</span>
                      <span className="hp-score-value">
                        <Roll delay={250}>{graded ? "3.44" : "3.40"}</Roll>
                      </span>
                      <span className="hp-score-note">
                        <Count value={graded ? 48 : 45} format={(n) => `${n} credits`} duration={700} />
                      </span>
                    </div>
                  </div>

                  <div className="hp-body">
                    <div className="hp-term">
                      <span>Fall 2025</span>
                      <span className="hp-term-count">4 courses</span>
                    </div>
                    <div className="hp-courses">
                      {/* The course still waiting for its grade, with its menu anchored under the chip */}
                      <div className="hp-anchor">
                        <Row className="hp-course" title="CSE261" subtitle="Data Structures">
                          <span className="hp-chip hp-chip--pick" data-target="grade" data-set={graded || undefined} data-open={s.menu || undefined}>
                            <Roll variant="fade" className="hp-chip-text">{s.grade ?? "Grade"}</Roll>
                            <ChevronDown size={14} strokeWidth={2.25} />
                          </span>
                        </Row>
                        <Popover show={s.menu} origin="top right" className="hp-menu">
                          <Menu
                            value={s.hover}
                            targets={GRADES.map((_, i) => `grade-${i}`)}
                            items={GRADES.map((g) => (
                              <span key={g.g} className="hp-menu-row">
                                <b>{g.g}</b>
                                <span>{g.p}</span>
                              </span>
                            ))}
                          />
                        </Popover>
                      </div>
                      <Row className="hp-course" title="CSE281" subtitle="Java">
                        <span className="hp-chip" data-set>A-</span>
                      </Row>
                      <Row className="hp-course" title="CSE181" subtitle="Discrete Mathematics">
                        <span className="hp-chip" data-set>B+</span>
                      </Row>
                      <Row className="hp-course" title={<Bar w={64} h={9} tone={4} />} subtitle={<Bar w={112} h={7} tone={2} />}>
                        <span className="hp-chip hp-chip--filler" data-set>
                          <Bar w={22} h={8} tone={3} />
                        </span>
                      </Row>
                    </div>
                  </div>
                </div>
              </Expand>
            </div>
          </Phone>
        )
      }}
    </Stage>
  )
}
