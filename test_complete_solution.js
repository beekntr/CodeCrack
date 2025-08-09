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

// Handle input and call the function
try {
    // Try to read from command line arguments first, then stdin
    let input;
    if (process.argv[2]) {
        input = process.argv[2];
    } else {
        // For ES modules, we need to use a different approach for stdin
        const chunks = [];
        process.stdin.on('data', chunk => chunks.push(chunk));
        process.stdin.on('end', () => {
            input = Buffer.concat(chunks).toString().trim();
            processInput(input);
        });
        return;
    }
    
    processInput(input);
} catch (error) {
    console.error('Error:', error.message);
}

function processInput(input) {
    try {
        // Parse the input as JSON
        const testInput = JSON.parse(input);
        
        // Call the function
        const result = groupAnagrams(testInput);
        
        // Output the result as JSON
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error processing input:', error.message);
    }
}
