// Count occurrences of a regex pattern in a string.
export function countOccurrences(mainString: string, regexPattern: RegExp): number {
    const regex = new RegExp(regexPattern, 'g');
    const matches = mainString.match(regex);
    return matches ? matches.length : 0;
}

// Get the indices of a regex pattern in a string.
export function getIndices(inputString: string, regexPattern: RegExp) {
    const indices = [];
    let match;
    const regex = new RegExp(regexPattern, 'g');
    while ((match = regex.exec(inputString)) !== null) {
        indices.push(match.index);
    }
    return indices;
}