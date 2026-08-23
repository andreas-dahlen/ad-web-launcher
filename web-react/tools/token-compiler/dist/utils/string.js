export function formatLogPath(file) {
    return file
        .replaceAll("\\", "/")
        .split("/")
        .slice(-2)
        .join("/");
}
export const ESC = "\u{1B}";
/**
 * Terminal color theme
 *
 * heading    → bold bright cyan
 * success    → bright green
 * warning    → bright yellow
 * error      → bright red
 * token      → bright magenta
 * variable   → bright blue
 * muted      → bright black (gray)
 * info       → bright cyan
 * file       → white
 * path       → gray
 * selector   → green
 * value      → yellow
 * debug      → dim white
 */
export const colors = {
    // structure
    heading: `${ESC}[1;96m`, // bright cyan
    subHeading: `${ESC}[94m`, // bright blue
    muted: `${ESC}[90m`, // gray
    // status
    success: `${ESC}[92m`, // bright green
    // warning: `${ESC}[93m`,        // bright yellow
    error: `${ESC}[91m`, // bright red
    // data
    symbol: `${ESC}[95m`, // magenta
    // variable: `${ESC}[94m`,       // blue
    value: `${ESC}[93m`, // yellow
    file: `${ESC}[97m`, // green
    // optional accents (256-color)
    variable: `${ESC}[38;5;208m`, // orange
    highlight: `${ESC}[38;5;214m`, // gold
    info: `${ESC}[38;5;45m`, // aqua
    reset: `${ESC}[0m`,
};
export function paint(text, color) {
    return `${color}${text}${colors.reset}`;
}
