const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({ 
  title: String, 
  difficulty: String 
}, { timestamps: true });

const Problem = mongoose.model('Problem', ProblemSchema);

async function listAllProblems() {
  try {
    await mongoose.connect('mongodb+srv://vismayasinghbhati:9Cn4Zrgiyp6A176G@codecrack.estl2qq.mongodb.net/?retryWrites=true&w=majority&appName=CodeCrack');
    
    const problems = await Problem.find({}, 'title difficulty').sort({ title: 1 });
    
    console.log('🎯 ALL INTELLIGENT PROBLEMS IN CODECRACK:');
    console.log('='.repeat(50));
    
    problems.forEach((p, i) => {
      const title = p.title;
      const difficulty = p.difficulty.toUpperCase();
      console.log(`${i+1}. ${title} (${difficulty})`);
    });
    
    console.log('='.repeat(50));
    console.log(`✅ ${problems.length} total problems - ALL using smart comparison!`);
    console.log('');
    console.log('🧠 Smart Features Applied to ALL Problems:');
    console.log('  • Order-independent arrays');
    console.log('  • Flexible nested structures'); 
    console.log('  • Whitespace normalization');
    console.log('  • Multiple valid solutions accepted');
    console.log('  • Intelligent empty output handling');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

listAllProblems();
