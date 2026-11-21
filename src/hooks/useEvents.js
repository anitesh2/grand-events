/**
 * Bridges the service layer to React state. Components get plain data and
 * callbacks; they never touch the repository.
 */
import { useCallback, useMemo, useState } from 'react';

export function useEvents(service) {
  const [filter, setFilter] = useState({ status: 'all', query: '' });
  const [version, setVersion] = useState(0); // bump to re-read after changes
  const refresh = () => setVersion((v) => v + 1);

  const events = useMemo(() => service.list(filter), [service, filter, version]);
  const summary = useMemo(() => service.summary(), [service, version]);

  const save = useCallback((event) => {
    const result = service.save(event);
    if (result.ok) refresh();
    return result;
  }, [service]);

  const remove = useCallback((id) => {
    service.remove(id);
    refresh();
  }, [service]);

  return { events, summary, filter, setFilter, save, remove };
}
