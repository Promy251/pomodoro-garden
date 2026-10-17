import { useState, useEffect } from 'react'
import './style.css'

const MINUTE = 60   // change to 1 for quick testing
const FLOWERS = ['🌷', '🌻', '🌹', '🌼', '🌸', '🌺']

const PRESETS = [
  { label: 'Quick 15/3', work: 15, break: 3 },
  { label: 'Classic 25/5', work: 25, break: 5 },
  { label: 'Deep 50/10', work: 50, break: 10 },
]

function loadSettings() {
  const saved = localStorage.getItem('settings')
  return saved ? JSON.parse(saved) : { workMinutes: 25, breakMinutes: 5 }
}

function App() {
  // SETTINGS
  const [workMinutes, setWorkMinutes] = useState(() => loadSettings().workMinutes)
  const [breakMinutes, setBreakMinutes] = useState(() => loadSettings().breakMinutes)
  const workTime = workMinutes * MINUTE
  const breakTime = breakMinutes * MINUTE

  // TIMER STATE
  const [secondsLeft, setSecondsLeft] = useState(workTime)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('work')

  // GARDEN
  const [garden, setGarden] = useState(() => {
    const saved = localStorage.getItem('garden')
    return saved ? JSON.parse(saved) : []
  })

  // TICK every second while running
  useEffect(() => {
    if (!isRunning) return
    const intervalId = setInterval(() => {
      setSecondsLeft((s) => s - 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [isRunning])

  // WHEN the timer reaches zero
  useEffect(() => {
    if (secondsLeft > 0) return
    setIsRunning(false)
    if (mode === 'work') {
      addPlant(false)
      setMode('break')
      setSecondsLeft(breakTime)
    } else {
      setMode('work')
      setSecondsLeft(workTime)
    }
  }, [secondsLeft])

  // SAVE garden and settings
  useEffect(() => {
    localStorage.setItem('garden', JSON.stringify(garden))
  }, [garden])

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({ workMinutes, breakMinutes }))
  }, [workMinutes, breakMinutes])

  // ACTIONS
  function addPlant(wilted) {
    const flower = wilted ? '🥀' : FLOWERS[Math.floor(Math.random() * FLOWERS.length)]
    setGarden((g) => [...g, { id: Date.now(), flower: flower, wilted: wilted }])
  }

  function giveUp() {
    setIsRunning(false)
    if (mode === 'work' && secondsLeft < workTime) {
      addPlant(true)
    }
    setMode('work')
    setSecondsLeft(workTime)
  }

  function changeWork(direction) {
    let step = 5
    if (workMinutes < 10 || (workMinutes === 10 && direction < 0)) step = 1

    const newValue = Math.min(120, Math.max(1, workMinutes + direction * step))
    setWorkMinutes(newValue)
    if (mode === 'work') setSecondsLeft(newValue * MINUTE)
  }

  function changeBreak(direction) {
    const newValue = Math.min(30, Math.max(1, breakMinutes + direction))
    setBreakMinutes(newValue)
    if (mode === 'break') setSecondsLeft(newValue * MINUTE)
  }

  function applyPreset(preset) {
    setWorkMinutes(preset.work)
    setBreakMinutes(preset.break)
    setSecondsLeft((mode === 'work' ? preset.work : preset.break) * MINUTE)
  }

  function resetEverything() {
    const sure = window.confirm('This will delete your whole garden and reset all settings. Are you sure?')
    if (!sure) return

    setIsRunning(false)
    setMode('work')
    setWorkMinutes(25)
    setBreakMinutes(5)
    setSecondsLeft(25 * MINUTE)
    setGarden([])
  }

  // DERIVED VALUES
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const totalTime = mode === 'work' ? workTime : breakTime
  const progress = 1 - secondsLeft / totalTime

  let plantStage = '🌱'
  if (progress > 0.33) plantStage = '🌿'
  if (progress > 0.66) plantStage = '🪴'

  const bloomCount = garden.filter((p) => !p.wilted).length

  // WHAT SHOWS ON SCREEN
  return (
    <div className={`app ${mode}`}>
      <h1>Pomodoro Garden</h1>

      <p className="mode">{mode === 'work' ? 'Focus time' : 'Break time ☕'}</p>
      <div className="plant">{mode === 'work' ? plantStage : '☕'}</div>
      <p className="timer">{timeText}</p>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }}></div>
      </div>

      <div className="buttons">
        <button onClick={() => setIsRunning(!isRunning)}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button className="give-up" onClick={giveUp}>Give up</button>
      </div>

      {!isRunning && (
        <div className="settings">
          <div className="setting">
            <span>Focus</span>
            <button onClick={() => changeWork(-1)}>−</button>
            <strong>{workMinutes} min</strong>
            <button onClick={() => changeWork(1)}>+</button>
          </div>
          <div className="setting">
            <span>Break</span>
            <button onClick={() => changeBreak(-1)}>−</button>
            <strong>{breakMinutes} min</strong>
            <button onClick={() => changeBreak(1)}>+</button>
          </div>
          <div className="presets">
            {PRESETS.map((preset) => (
              <button key={preset.label} onClick={() => applyPreset(preset)}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <h2>My Garden ({bloomCount} 🌸)</h2>
      <div className="garden-scene">
        <div className="sun">☀️</div>
        <div className="cloud cloud-1">☁️</div>
        <div className="cloud cloud-2">☁️</div>
        {bloomCount >= 5 && <div className="butterfly">🦋</div>}

        <div className="ground">
          {garden.length === 0 && (
            <p className="empty">Finish a focus session to plant your first flower!</p>
          )}
          {garden.map((p, index) => (
            <span
              key={p.id}
              className={`garden-plant ${p.wilted ? 'wilted' : ''}`}
              style={{ animationDelay: `0s, ${(index % 5) * 0.4}s` }}
              title={`Planted on ${new Date(p.id).toLocaleDateString()}`}
            >
              {p.flower}
            </span>
          ))}
        </div>
      </div>

      <button className="reset-all" onClick={resetEverything}>
        ↺ Reset everything
      </button>
    </div>
  )
}

export default App