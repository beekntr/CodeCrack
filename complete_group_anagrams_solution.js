function groupAnagrams(strs) {
    // Use a Map to group strings by their sorted character signature
    const anagramMap = new Map();
    
    for (const str of strs) {
        // Sort the characters of the string to create a key
        // Anagrams will have the same sorted key
        const sortedKey = str.split('').sort().join('');
        
        // If key doesn't exist, create new array; otherwise add to existing
        if (!anagramMap.has(sortedKey)) {
            anagramMap.set(sortedKey, []);
        }
        anagramMap.get(sortedKey).push(str);
    }
    
    // Convert Map values to array and return
    return Array.from(anagramMap.values());
}

// Input handling - ADD THIS PART!
let input = '';
process.stdin.on('data', (chunk) => {
    input += chunk;
});

process.stdin.on('end', () => {
    try {
        const testInput = JSON.parse(input.trim());
        const result = groupAnagrams(testInput);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error.message);
    }
});
