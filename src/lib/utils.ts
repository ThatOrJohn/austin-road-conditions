// src/lib/utils.ts
export const conditionCodeToText = (code: string): string => {
  const codeMap: { [key: string]: string } = {
    "0": "Unknown",
    "1": "Dry",
    "2": "Damp",
    "3": "Wet",
    "4": "Snow",
    "5": "Ice",
    "6": "Standing Water",
    "7": "Deep Snow",
    "8": "Black Ice",
    "9": "Error",
    "10": "Error",
  };
  return codeMap[code] || "Unknown";
};

export const celsiusToFahrenheit = (celsius: string): number => {
  const c = parseFloat(celsius);
  return Math.round((c * 9) / 5 + 32);
};

export const getMarkerIcon = (
  gripText: string,
  isDarkMode: boolean = false
) => {
  const colors: { [key: string]: string } = {
    GOOD: "#28a745", // Green
    FAIR: "#ffc107", // Yellow
    POOR: "#dc3545", // Red
    UNKNOWN: "#6c757d", // Gray
  };

  const color = colors[gripText.toUpperCase()] || colors.UNKNOWN;
  const textColor = isDarkMode ? "#e0e0e0" : "#333";
  const shadowColor = isDarkMode ? "#333" : "#fff";

  const html = `
    <div style="display: flex; align-items: center; white-space: nowrap;">
      <div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; margin-right: 5px; border: 2px solid ${shadowColor}; box-shadow: 0 0 2px rgba(0,0,0,0.5);"></div>
      <span style="font-size: 12px; color: ${textColor}; font-weight: bold; text-shadow: 0 0 2px ${shadowColor};">${gripText}</span>
    </div>
  `;

  return html;
};
