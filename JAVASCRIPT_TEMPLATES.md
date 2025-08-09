# 🚀 CodeCrack JavaScript Solution Templates

## 📋 General Template Structure

All JavaScript solutions in CodeCrack should follow this pattern:

```javascript
function yourSolutionFunction(input) {
    // Your algorithm here
    return result;
}

// Input handling (copy this exactly)
let input = '';
process.stdin.on('data', (chunk) => {
    input += chunk;
});

process.stdin.on('end', () => {
    try {
        const testInput = JSON.parse(input.trim());
        const result = yourSolutionFunction(testInput);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error.message);
    }
});
```

## 🎯 Problem Type Examples

### 1. Array/String Problems (Single Input)
```javascript
function twoSum(nums, target) {
    // Your solution
    return [index1, index2];
}

// Input handling for problems with single array input
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
    try {
        const testInput = JSON.parse(input.trim());
        const result = twoSum(testInput);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error.message);
    }
});
```

### 2. Multiple Parameter Problems
```javascript
function search(nums, target) {
    // Your solution
    return index;
}

// Input handling for multiple parameters
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
    try {
        const testInput = JSON.parse(input.trim());
        // Assuming input is [array, target]
        const result = search(testInput[0], testInput[1]);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error.message);
    }
});
```

### 3. String Input Problems
```javascript
function isValid(s) {
    // Your solution for parentheses
    return true/false;
}

// Input handling for string input
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
    try {
        const testInput = JSON.parse(input.trim());
        const result = isValid(testInput);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error.message);
    }
});
```

### 4. Tree/Graph Problems (Array Input)
```javascript
function levelOrder(root) {
    // Your solution for level order traversal
    return result;
}

// Input handling for tree (array representation)
let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
    try {
        const testInput = JSON.parse(input.trim());
        const result = levelOrder(testInput);
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error.message);
    }
});
```

## 🔧 Smart Comparison Features

The platform now supports **intelligent comparison** that handles:

### ✅ Order-Independent Arrays
- `[1,2,3]` equals `[3,1,2]` ✅
- `[[1,2],[3,4]]` equals `[[3,4],[1,2]]` ✅

### ✅ Nested Array Flexibility  
- `[["eat","tea"],["tan"]]` equals `[["tan"],["tea","eat"]]` ✅
- Perfect for problems like Group Anagrams!

### ✅ Whitespace Normalization
- `[ 1 , 2 , 3 ]` equals `[1,2,3]` ✅
- No more formatting worries!

### ✅ Empty Array Handling
- `""`, `[]`, and empty outputs all handled correctly ✅

## 💡 Pro Tips

1. **Always use the input handling template** - Don't modify it
2. **Focus on your algorithm** - The platform handles comparison intelligently  
3. **Return results directly** - No need to match exact formatting
4. **Test locally** with: `echo '["test","input"]' | node your_solution.js`

## 🎉 No More Order Worries!

The platform is now smart enough to accept your solution regardless of:
- Array order
- Group order (for grouping problems)
- Whitespace differences
- Output formatting variations

Just focus on solving the algorithm - the platform will handle the rest! 🚀
