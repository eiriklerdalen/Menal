import { useState } from "react";
import { HexColorPicker } from "react-colorful";

type ScaleColorSelectorProps = {
    colors: string[];
    setColors: React.Dispatch<React.SetStateAction<string[]>>;
    maxRating: number;
};


function ScaleColorSelector({colors, setColors, maxRating}: ScaleColorSelectorProps) {
    const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);

    return (
        <div className="scales-color-selector">
            <p>Farger:</p>
            <div className="color-buttons">
                {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
                    <button
                        key={rating}
                        style={{ backgroundColor: colors[rating - 1] }}
                        onClick={() => setSelectedColorIndex(rating - 1)}
                    >
                        {rating}
                    </button>
                ))}
            </div>
            {selectedColorIndex !== null && (
                <div className="color-picker-popup">
                    <HexColorPicker
                        color={colors[selectedColorIndex]}
                        onChange={(newColor) => {
                            const updatedColors = [...colors];
                            updatedColors[selectedColorIndex] = newColor;
                            setColors(updatedColors);
                        }}
                    />

                    <button 
                        className="close-color-selector-button"
                        onClick={() => setSelectedColorIndex(null)}
                    >
                        Lukk
                    </button>
                </div>
            )}
        </div>
    )
}

export default ScaleColorSelector;