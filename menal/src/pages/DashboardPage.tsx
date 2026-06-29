import { useEffect, useState } from "react";

const profileId = 1;

function DashboardPage() {
    const [name, setName] = useState<string>("");
    useEffect(() => {
        fetch(`http://10.0.0.76:3000/profiles/${profileId}`)
            .then((res) => res.json())
            .then((data) => setName(data.name))
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className="dashboard">
            <h1>Velkommen tilbake, {name}</h1>

            <div>
                
            </div>
        </div>
    )
}

export default DashboardPage;