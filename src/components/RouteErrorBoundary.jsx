import { Component } from 'react';
import { ErrorScreen } from './HydrationGate';

const RELOAD_KEY = 'ssrp_chunk_reload';

/* True for the family of errors thrown when a lazily-imported route chunk
   can't be fetched — almost always because a new build was deployed while this
   tab was open in the background (very common on iOS Safari). */
export function isChunkLoadError(err) {
  const msg = (err && (err.message || String(err))) || '';
  return /dynamically imported module|Importing a module script failed|Failed to fetch dynamically imported|ChunkLoadError|error loading dynamically imported module|'text\/html' is not a valid JavaScript MIME type/i.test(msg);
}

/* Reload once to pull the fresh build, guarding against reload loops (if the
   chunk is genuinely gone, we stop after one try and show a Reload button). */
export function recoverFromStaleChunk() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last > 10000) {
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
      window.location.reload();
      return true;
    }
  } catch {
    window.location.reload();
    return true;
  }
  return false;
}

export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, recovering: false };
  }

  static getDerivedStateFromError(error) {
    return { error, recovering: isChunkLoadError(error) };
  }

  componentDidCatch(error) {
    if (isChunkLoadError(error)) recoverFromStaleChunk();
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col" style={{ minHeight: '100vh' }}>
          <ErrorScreen
            message={this.state.recovering
              ? 'A new version is available. Reloading…'
              : 'Something went wrong on this page.'}
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
