import mongoose from 'mongoose';
import './server/models/Problem.js';

mongoose.connect('mongodb+srv://geetika:LhfqT5n8aGPnRmhx@cluster0.estl2qq.mongodb.net/codecrack?retryWrites=true&w=majority&appName=Cluster0')
.then(async () => {
  const Problem = mongoose.model('Problem');
  const problem = await Problem.findById('6896da96343a4e26e8113ad4');
  console.log('Problem:', problem.title);
  console.log('Test cases:');
  problem.testCases.forEach((tc, i) => {
    console.log(`Test ${i+1}:`);
    console.log(`  Input: '${tc.input}'`);
    console.log(`  Expected: '${tc.expectedOutput}'`);
    console.log(`  Public: ${tc.isPublic}`);
    console.log('');
  });
  mongoose.disconnect();
})
.catch(console.error);
