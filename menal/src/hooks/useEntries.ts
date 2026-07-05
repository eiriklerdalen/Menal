import { useEffect, useState } from "react";

import { apiURL } from "../config/api";

import useRequiredUser from "./useRequiredUser";

import type { Entry } from "../types";

function useEntries(date: string) {
    const user = useRequiredUser();
    const profileId = user.profileId;

    const [entries, setEntries] = useState<Entry[]>([]);
    useEffect(() => {
        fetch(apiURL(`/profiles/${profileId}/entries/${date}`))
            .then((res) => res.json())
            .then((data) => setEntries(data))
    }, [date]);

    return { entries, setEntries };
}

export default useEntries;