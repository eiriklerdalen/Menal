import { useEffect, useState } from "react";

import { apiURL } from "../config/api";

import type { Entry } from "../types";

function useEntries(date: string) {

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(apiURL(`/entries/${date}`), {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setEntries(data))
    }, [date]);

    return { entries, setEntries };
}

export default useEntries;