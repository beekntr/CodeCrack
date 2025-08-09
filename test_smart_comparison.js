// Test the new smart comparison logic
const testCases = [
  {
    name: "Group Anagrams - Different Order",
    actual: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
    expected: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
    shouldPass: true
  },
  {
    name: "Simple Array - Different Order", 
    actual: '[1,2,3]',
    expected: '[3,1,2]',
    shouldPass: true
  },
  {
    name: "Empty Array",
    actual: '[]',
    expected: '[]',
    shouldPass: true
  },
  {
    name: "String Exact Match",
    actual: 'hello',
    expected: 'hello',
    shouldPass: true
  },
  {
    name: "Wrong Answer",
    actual: '[1,2,3]',
    expected: '[1,2,4]',
    shouldPass: false
  }
];

// Simulate the comparison logic
function normalizeOutput(str) {
  const trimmed = str.trim();
  if (!trimmed || trimmed === '' || trimmed === '[]') {
    return '[]';
  }
  
  let normalized = trimmed
    .replace(/\[\s*/g, '[')
    .replace(/\s*\]/g, ']')
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  
  return normalized;
}

function compareArraysFlexibly(actual, expected) {
  if (actual.length !== expected.length) {
    return false;
  }
  
  // Handle array of arrays (like group anagrams result)
  if (actual.every(item => Array.isArray(item)) && expected.every(item => Array.isArray(item))) {
    const sortArrayOfArrays = (arr) => {
      return arr.map(subArr => [...subArr].sort()).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    };
    
    const sortedActual = sortArrayOfArrays(actual);
    const sortedExpected = sortArrayOfArrays(expected);
    
    return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
  }
  
  // Handle simple arrays - sort and compare
  if (actual.every(item => typeof item !== 'object') && expected.every(item => typeof item !== 'object')) {
    const sortedActual = [...actual].sort();
    const sortedExpected = [...expected].sort();
    return JSON.stringify(sortedActual) === JSON.stringify(sortedExpected);
  }
  
  return false;
}

function smartCompare(actual, expected) {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  
  if (normalizedActual === normalizedExpected) {
    return true;
  }
  
  try {
    const actualParsed = JSON.parse(normalizedActual);
    const expectedParsed = JSON.parse(normalizedExpected);
    
    if (Array.isArray(actualParsed) && Array.isArray(expectedParsed)) {
      return compareArraysFlexibly(actualParsed, expectedParsed);
    }
    
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
    
  } catch (e) {
    return normalizedActual === normalizedExpected;
  }
}

// Run tests
console.log('🧪 Testing Smart Comparison Logic\n');

testCases.forEach((test, index) => {
  const result = smartCompare(test.actual, test.expected);
  const status = result === test.shouldPass ? '✅ PASS' : '❌ FAIL';
  
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log(`  Actual: ${test.actual}`);
  console.log(`  Expected: ${test.expected}`);
  console.log(`  Result: ${result} (should be ${test.shouldPass})`);
  console.log(`  Status: ${status}\n`);
});

console.log('🎉 Smart comparison logic test completed!');
