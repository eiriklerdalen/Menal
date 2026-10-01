import "./LandingBox.css";

type LandingBoxProps = {
    imagePath: string;
    darkMode: boolean;
    text: string;
}

function LandingBox({ imagePath, darkMode, text}: LandingBoxProps) {

    return (
        <div className={`landing-box ${darkMode ? "dark-mode" : ""}`}>
            <img
                src={ imagePath }
            />
            <p className="landing-box-text">{text}</p>
        </div>
    )
}

export default LandingBox;
