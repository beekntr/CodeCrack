import 'dotenv/config';
import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Problem } from '../models/Problem';

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing CodeCrack database...');
    
    // Connect to database
    await connectDB();
    
    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@codecrack.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin'
      });
      
      await adminUser.save();
      console.log(`✅ Admin user created with email: ${adminEmail}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create sample problems if none exist
    const problemCount = await Problem.countDocuments();
    
    if (problemCount === 0) {
      console.log('📝 Creating sample problems...');
      
      const sampleProblems = [
        {
          title: "Two Sum",
          description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\``,
          inputFormat: "First line contains n (length of array) and target. Second line contains n space-separated integers.",
          outputFormat: "Two space-separated integers representing the indices.",
          constraints: "2 ≤ n ≤ 10^4, -10^9 ≤ nums[i] ≤ 10^9, -10^9 ≤ target ≤ 10^9",
          testCases: [
            {
              input: "4 9\n2 7 11 15",
              expectedOutput: "0 1",
              isPublic: true
            },
            {
              input: "3 6\n3 2 4",
              expectedOutput: "1 2",
              isPublic: true
            },
            {
              input: "2 6\n3 3",
              expectedOutput: "0 1",
              isPublic: false
            }
          ],
          difficulty: "easy" as const,
          tags: ["array", "hash-table"],
          createdBy: (await User.findOne({ role: 'admin' }))!._id
        },
        {
          title: "Valid Parentheses",
          description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
\`\`\`
Input: s = "()"
Output: true
\`\`\`

**Example 2:**
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

**Example 3:**
\`\`\`
Input: s = "(]"
Output: false
\`\`\``,
          inputFormat: "A single line containing the string s.",
          outputFormat: "Print 'true' if valid, 'false' otherwise.",
          constraints: "1 ≤ s.length ≤ 10^4, s consists of parentheses only '()[]{}'.",
          testCases: [
            {
              input: "()",
              expectedOutput: "true",
              isPublic: true
            },
            {
              input: "()[]{}",
              expectedOutput: "true",
              isPublic: true
            },
            {
              input: "(]",
              expectedOutput: "false",
              isPublic: false
            },
            {
              input: "([)]",
              expectedOutput: "false",
              isPublic: false
            }
          ],
          difficulty: "easy" as const,
          tags: ["string", "stack"],
          createdBy: (await User.findOne({ role: 'admin' }))!._id
        },
        {
          title: "Binary Tree Inorder Traversal",
          description: `Given the root of a binary tree, return the inorder traversal of its nodes' values.

**Example 1:**
\`\`\`
Input: root = [1,null,2,3]
Output: [1,3,2]
\`\`\`

**Example 2:**
\`\`\`
Input: root = []
Output: []
\`\`\`

**Example 3:**
\`\`\`
Input: root = [1]
Output: [1]
\`\`\`

**Note:** The tree is given as a level-order array where null represents a missing node.`,
          inputFormat: "First line contains n (number of nodes). Second line contains level-order representation of the tree (use -1 for null).",
          outputFormat: "Space-separated integers representing inorder traversal.",
          constraints: "The number of nodes in the tree is in the range [0, 100]. -100 ≤ Node.val ≤ 100",
          testCases: [
            {
              input: "3\n1 -1 2 3",
              expectedOutput: "1 3 2",
              isPublic: true
            },
            {
              input: "0\n",
              expectedOutput: "[]",
              isPublic: true
            },
            {
              input: "1\n1",
              expectedOutput: "1",
              isPublic: false
            }
          ],
          difficulty: "medium" as const,
          tags: ["tree", "depth-first-search", "binary-tree"],
          createdBy: (await User.findOne({ role: 'admin' }))!._id
        }
      ];
      
      for (const problemData of sampleProblems) {
        const problem = new Problem(problemData);
        await problem.save();
        console.log(`✅ Created problem: ${problem.title}`);
      }
    } else {
      console.log('ℹ️  Sample problems already exist');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log(`👤 Admin Email: ${adminEmail}`);
    console.log(`🔑 Admin Password: ${adminPassword}`);
    console.log(`📊 Problems: ${await Problem.countDocuments()}`);
    console.log(`👥 Users: ${await User.countDocuments()}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();
