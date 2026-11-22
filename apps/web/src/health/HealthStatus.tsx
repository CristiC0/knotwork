import { $api } from '../api/client.js';
import { summarizeHealth, type ServiceState } from './health-summary.js';

const LABELS: Record<ServiceState, string> = {
  checking: 'Checking…',
  up: 'Up',
  down: 'Down',
};

export function HealthStatus() {
  const query = $api.useQuery('get', '/api/health', {}, { refetchInterval: 10_000, retry: false });
  const summary = summarizeHealth(query);

  return (
    <section aria-labelledby="health-heading" className="health">
      <h2 id="health-heading">System status</h2>
      <dl>
        <div className="health-row" data-state={summary.api}>
          <dt>API</dt>
          <dd data-testid="api-status">{LABELS[summary.api]}</dd>
        </div>
        <div className="health-row" data-state={summary.database}>
          <dt>Database</dt>
          <dd data-testid="database-status">{LABELS[summary.database]}</dd>
        </div>
      </dl>
      <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching}>
        {query.isFetching ? 'Checking…' : 'Check again'}
      </button>
    </section>
  );
}
