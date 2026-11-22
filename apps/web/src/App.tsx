import { HealthStatus } from './health/HealthStatus.js';

export function App() {
  return (
    <main className="app">
      <h1>Knotwork</h1>
      <p>Share your crochet creations and the patterns to make them.</p>
      <HealthStatus />
    </main>
  );
}
