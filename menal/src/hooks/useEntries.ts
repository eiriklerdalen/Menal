import { use, useEffect, useState } from "react";

import type { Entry } from "../types";

function useEntries(date: string) {
    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/1/entries/${date}`)
            .then((res) => res.json())
            .then((data) => setEntries(data))
    }, [date]);

    return { entries, setEntries };
}

export default useEntries;

// entries = {
//     id: x, calendar_id: y, date: z, rating: a
// }