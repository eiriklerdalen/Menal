type ThemeSwitchProps = {
    darkMode: boolean,
    setDarkMode: (value: boolean) => void;
}

function ThemeSwitch({ darkMode, setDarkMode}: ThemeSwitchProps) {
    return (
        <button
            className={`theme-switch ${darkMode ? "dark" : ""}`}
            onClick={() => setDarkMode(!darkMode)}
        >
            {darkMode ? "☀️" : "🌙"}
        </button>
    )
}

export default ThemeSwitch;