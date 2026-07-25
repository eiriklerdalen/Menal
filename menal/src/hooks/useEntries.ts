import { useEffect, useState } from "react";

import { apiFetch } from "../config/apiFetch";

import type { Entry } from "../types";

function useEntries(date: string) {

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        apiFetch(`/entries/${date}`)
            .then((res) => res.json())
            .then((data) => setEntries(data))
    }, [date]);

    return { entries, setEntries };
}

export default useEntries;