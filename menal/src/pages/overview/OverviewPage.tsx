import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import type { Year } from "../../types";

import "/src/pages/overview/OverviewPage.css";
import { apiFetch } from "../../config/apiFetch";

function OverviewPage() {

    const navigate = useNavigate();

    const [years, setYears] = useState<Year[]>([]);
    useEffect(() => {
        apiFetch("/overview")
            .then((res) => res.json())
            .then((data) => setYears(data))
            .catch((err) => console.log(err));
    }, [])

    return (
        <div className="overview-page">
            <h1
                className="over-view-back-button"
                onClick={() => navigate("/overview")}
            >
                Oversikt
            </h1>

            <div className="overview-years">
                {years.map((year) => (
                    <button
                        key={year.year}
                        className="year-button"
                        onClick={() => navigate(`/overview/${year.year}`)}
                    >
                        {year.year}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default OverviewPage;
