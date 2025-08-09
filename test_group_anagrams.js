const mongoose = require('mongoose');

// Define schemas
const TestCaseSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  isPublic: Boolean
}, { _id: false });

const ProblemSchema = new mongoose.Schema({
  title: String,
  description: String,
  testCases: [TestCaseSchema],
  difficulty: String,
  tags: [String]
}, { timestamps: true });

const Problem = mongoose.model('Problem', ProblemSchema);

async function checkGroupAnagrams() {
  try {
    await mongoose.connect('mongodb+srv://vismayasinghbhati:9Cn4Zrgiyp6A176G@codecrack.estl2qq.mongodb.net/?retryWrites=true&w=majority&appName=CodeCrack');
    
    const problem = await Problem.findOne({ title: 'Group Anagrams' });
    if (problem) {
      console.log('=== Group Anagrams Problem ===');
      console.log('Test Cases:');
      problem.testCases.forEach((tc, index) => {
        console.log(`Test ${index + 1}:`);
        console.log(`Input: ${tc.input}`);
        console.log(`Expected: ${tc.expectedOutput}`);
        console.log(`Public: ${tc.isPublic}`);
        console.log('---');
      });
      
      // Test the function
      console.log('\n=== Testing Function ===');
      
      function groupAnagrams(strs) {
        const anagramMap = new Map();
        
        for (const str of strs) {
          const sortedKey = str.split('').sort().join('');
          
          if (!anagramMap.has(sortedKey)) {
            anagramMap.set(sortedKey, []);
          }
          anagramMap.get(sortedKey).push(str);
        }
        
        return Array.from(anagramMap.values());
      }
      
      // Test with actual inputs
      const testInput1 = ["eat","tea","tan","ate","nat","bat"];
      const result1 = groupAnagrams(testInput1);
      console.log('Test 1 Input:', testInput1);
      console.log('Test 1 Result:', JSON.stringify(result1));
      console.log('Test 1 Expected:', '[["bat"],["nat","tan"],["ate","eat","tea"]]');
      
      const testInput2 = [""];
      const result2 = groupAnagrams(testInput2);
      console.log('Test 2 Input:', testInput2);
      console.log('Test 2 Result:', JSON.stringify(result2));
      console.log('Test 2 Expected:', '[[""]]');
      
    } else {
      console.log('Group Anagrams problem not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkGroupAnagrams();
