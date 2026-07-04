import { useEffect, useState } from "react";

import { apiURL } from "../config/api";

import useCurrentUser from "./useCurrentUser";

import type { Entry } from "../types";

function useEntries(date: string) {
    const { profileId } = useCurrentUser();

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(apiURL(`/profiles/${profileId}/entries/${date}`))
            .then((res) => res.json())
            .then((data) => setEntries(data))
    }, [date]);

    return { entries, setEntries };
}

export default useEntries;