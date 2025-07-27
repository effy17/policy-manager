export function getDecimalIndex(prev?: number, next?: number): number {
    if (prev === undefined && next === undefined) return 1; // Only item
    if (prev === undefined) return next! - 1;               // Insert at start
    if (next === undefined) return prev + 1;                // Insert at end
    return (Number(prev) + Number(next)) / 2;
}
