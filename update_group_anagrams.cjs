const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  isPublic: Boolean
}, { _id: false });

const ProblemSchema = new mongoose.Schema({
  title: String,
  description: String,
  testCases: [TestCaseSchema]
}, { timestamps: true });

const Problem = mongoose.model('Problem', ProblemSchema);

async function updateGroupAnagrams() {
  try {
    await mongoose.connect('mongodb+srv://vismayasinghbhati:9Cn4Zrgiyp6A176G@codecrack.estl2qq.mongodb.net/?retryWrites=true&w=majority&appName=CodeCrack');
    
    const problem = await Problem.findOne({ title: 'Group Anagrams' });
    if (problem) {
      problem.description = `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Note: The groups can be returned in any order, and the strings within each group can also be in any order.`;
      
      await problem.save();
      console.log('✅ Updated Group Anagrams description');
    } else {
      console.log('❌ Group Anagrams problem not found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

updateGroupAnagrams();
