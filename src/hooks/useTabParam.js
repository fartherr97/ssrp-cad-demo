import { useSearchParams } from 'react-router-dom';

/**
 * Sync a single piece of "which tab/view is showing" state to a URL query
 * param so the tab is deep-linkable, shareable, and survives a refresh.
 *
 *   const [tab, setTab] = useTabParam('tab', 'SUMMARY');
 *
 * The default value is kept *out* of the URL (clean links); any other value is
 * written as `?key=value`. Tab switches use `replace` so they don't flood the
 * browser history.
 *
 * @param {string} key       query-param name (e.g. 'tab', 'type', 'sel')
 * @param {string} fallback  value to use when the param is absent
 * @param {object} [opts]
 * @param {boolean} [opts.push=false]  push a history entry instead of replacing
 */
export function useTabParam(key, fallback, { push = false } = {}) {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? fallback;

  const setValue = (next) => {
    setParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        if (next == null || next === fallback || next === '') sp.delete(key);
        else sp.set(key, String(next));
        return sp;
      },
      { replace: !push },
    );
  };

  return [value, setValue];
}
