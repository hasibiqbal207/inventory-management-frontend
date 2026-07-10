import { useEffect, useState } from "react";

/**
 * Debounce a rapidly-changing value (e.g. a search box) so it only propagates
 * after `delay` ms of quiet — used to avoid firing a server request per
 * keystroke on the list pages.
 */
export function useDebounce<T>(value: T, delay = 350): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);

    return debounced;
}
