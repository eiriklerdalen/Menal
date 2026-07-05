import { useEffect, useState } from "react";

import { apiURL } from "../config/api";

import useRequiredUser from "./useRequiredUser";

import type { Entry } from "../types";

function useEntries(date: string) {
    const user = useRequiredUser();
    const userId = user.userId;

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(apiURL(`/users/${userId}/entries/${date}`))
            .then((res) => res.json())
            .then((data) => setEntries(data))
    }, [date]);

    return { entries, setEntries };
}

export default useEntries;