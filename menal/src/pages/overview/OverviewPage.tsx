import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Year = {
    year: string;
};

function OverviewPage() {
    const navigate = useNavigate();

    const [years, setYears] = useState<Year[]>([]);
    useEffect(() => {
        fetch("http://10.0.0.76:3000/profiles/1/overview")
            .then((res) => res.json())
            .then((data) => setYears(data))
            .catch((err) => console.log(err));
    }, [])

    return (
        <div>
            <h1>Oversikt</h1>

            <div className="overview-years">
                {years.map((year) => (
                    <button
                        key={year.year}
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