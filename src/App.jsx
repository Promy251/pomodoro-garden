import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="page">
      <section className="starter-card" aria-labelledby="welcome-heading">
        <div className="mark" aria-hidden="true">
          <span>R</span>
        </div>
        <p className="eyebrow">React · JavaScript · Vite</p>
        <h1 id="welcome-heading">Your project is ready.</h1>
        <p className="description">
          Start building by editing <code>src/App.jsx</code>. Changes appear
          instantly as you work.
        </p>
        <div className="counter">
          <button
            className="counter-button"
            onClick={() => setCount((value) => value + 1)}
            type="button"
          >
            Clicked {count} {count === 1 ? "time" : "times"}
          </button>
          <span className="hint">A small example of React state</span>
        </div>
        <div className="card-footer">
          <span className="status-dot" />
          <span>Ready for your first idea</span>
        </div>
      </section>
    </main>
  );
}
