const mongoose = require('mongoose');

// Define User schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google auth
    },
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  googleId: {
    type: String,
    sparse: true,
    unique: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

// Define the schemas directly in this file to avoid TypeScript issues
const TestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    unique: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 10000
  },
  inputFormat: {
    type: String,
    required: true,
    maxlength: 2000
  },
  outputFormat: {
    type: String,
    required: true,
    maxlength: 2000
  },
  constraints: {
    type: String,
    required: true,
    maxlength: 2000
  },
  testCases: {
    type: [TestCaseSchema],
    required: true,
    validate: {
      validator: function(testCases) {
        return testCases.length >= 1;
      },
      message: 'At least one test case is required'
    }
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Problem = mongoose.model('Problem', ProblemSchema);

// Get admin user ID (we'll use the first user as admin)
async function getAdminUserId() {
  const user = await User.findOne().sort({ createdAt: 1 });
  if (!user) {
    throw new Error('No users found. Please create a user first.');
  }
  return user._id;
}

// Problems to seed
const problems = [
  {
    title: "Valid Binary Search Tree",
    description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- Both the left and right subtrees must also be binary search trees.`,
    inputFormat: "The input consists of nodes of a binary tree in level-order traversal. null represents a missing node.",
    outputFormat: "Return true if the tree is a valid BST, false otherwise.",
    constraints: "The number of nodes in the tree is in the range [1, 10^4]. -2^31 <= Node.val <= 2^31 - 1",
    testCases: [
      {
        input: "[2,1,3]",
        expectedOutput: "true",
        isPublic: true
      },
      {
        input: "[5,1,4,null,null,3,6]",
        expectedOutput: "false",
        isPublic: true
      },
      {
        input: "[10,5,15,null,null,12,20]",
        expectedOutput: "true",
        isPublic: false
      },
      {
        input: "[1]",
        expectedOutput: "true",
        isPublic: false
      }
    ],
    difficulty: "medium",
    tags: ["Binary Tree", "Depth-First Search", "Binary Search Tree"]
  },
  {
    title: "Maximum Subarray Sum",
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

This is a classic dynamic programming problem also known as Kadane's algorithm.`,
    inputFormat: "An array of integers nums where 1 <= nums.length <= 10^5",
    outputFormat: "Return the maximum sum of any contiguous subarray.",
    constraints: "-10^4 <= nums[i] <= 10^4",
    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
        isPublic: true
      },
      {
        input: "[1]",
        expectedOutput: "1",
        isPublic: true
      },
      {
        input: "[5,4,-1,7,8]",
        expectedOutput: "23",
        isPublic: false
      },
      {
        input: "[-1,-2,-3,-4]",
        expectedOutput: "-1",
        isPublic: false
      }
    ],
    difficulty: "medium",
    tags: ["Array", "Dynamic Programming", "Divide and Conquer"]
  },
  {
    title: "Valid Parentheses",
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputFormat: "A string s consisting only of parentheses characters.",
    outputFormat: "Return true if the string is valid, false otherwise.",
    constraints: "1 <= s.length <= 10^4. s consists of parentheses only '()[]{}'.",
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
    difficulty: "easy",
    tags: ["String", "Stack"]
  },
  {
    title: "Longest Palindromic Substring",
    description: `Given a string s, return the longest palindromic substring in s.

A palindrome is a string that reads the same forward and backward.`,
    inputFormat: "A string s",
    outputFormat: "Return the longest palindromic substring in s.",
    constraints: "1 <= s.length <= 1000. s consist of only digits and English letters.",
    testCases: [
      {
        input: "babad",
        expectedOutput: "bab",
        isPublic: true
      },
      {
        input: "cbbd",
        expectedOutput: "bb",
        isPublic: true
      },
      {
        input: "racecar",
        expectedOutput: "racecar",
        isPublic: false
      },
      {
        input: "ac",
        expectedOutput: "a",
        isPublic: false
      }
    ],
    difficulty: "medium",
    tags: ["String", "Dynamic Programming"]
  },
  {
    title: "Binary Tree Level Order Traversal",
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
    inputFormat: "The root of a binary tree represented as an array in level-order.",
    outputFormat: "Return a 2D array where each sub-array contains the values of nodes at that level.",
    constraints: "The number of nodes in the tree is in the range [0, 2000]. -1000 <= Node.val <= 1000",
    testCases: [
      {
        input: "[3,9,20,null,null,15,7]",
        expectedOutput: "[[3],[9,20],[15,7]]",
        isPublic: true
      },
      {
        input: "[1]",
        expectedOutput: "[[1]]",
        isPublic: true
      },
      {
        input: "[]",
        expectedOutput: "[]",
        isPublic: false
      },
      {
        input: "[1,2,3,4,5]",
        expectedOutput: "[[1],[2,3],[4,5]]",
        isPublic: false
      }
    ],
    difficulty: "medium",
    tags: ["Binary Tree", "Breadth-First Search"]
  },
  {
    title: "Climbing Stairs",
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    inputFormat: "An integer n representing the number of steps.",
    outputFormat: "Return the number of distinct ways to climb to the top.",
    constraints: "1 <= n <= 45",
    testCases: [
      {
        input: "2",
        expectedOutput: "2",
        isPublic: true
      },
      {
        input: "3",
        expectedOutput: "3",
        isPublic: true
      },
      {
        input: "4",
        expectedOutput: "5",
        isPublic: false
      },
      {
        input: "5",
        expectedOutput: "8",
        isPublic: false
      }
    ],
    difficulty: "easy",
    tags: ["Math", "Dynamic Programming", "Memoization"]
  },
  {
    title: "Find Peak Element",
    description: `A peak element is an element that is strictly greater than its neighbors.

Given a 0-indexed integer array nums, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.

You may imagine that nums[-1] = nums[n] = -∞. In other words, an element is always considered to be strictly greater than a neighbor that is outside the array.

You must write an algorithm that runs in O(log n) time.`,
    inputFormat: "An integer array nums",
    outputFormat: "Return the index of a peak element.",
    constraints: "1 <= nums.length <= 1000. -2^31 <= nums[i] <= 2^31 - 1. nums[i] != nums[i + 1] for all valid i.",
    testCases: [
      {
        input: "[1,2,3,1]",
        expectedOutput: "2",
        isPublic: true
      },
      {
        input: "[1,2,1,3,5,6,4]",
        expectedOutput: "5",
        isPublic: true
      },
      {
        input: "[1]",
        expectedOutput: "0",
        isPublic: false
      },
      {
        input: "[1,2]",
        expectedOutput: "1",
        isPublic: false
      }
    ],
    difficulty: "medium",
    tags: ["Array", "Binary Search"]
  },
  {
    title: "Group Anagrams",
    description: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    inputFormat: "An array of strings strs",
    outputFormat: "Return a 2D array where each sub-array contains strings that are anagrams of each other.",
    constraints: "1 <= strs.length <= 10^4. 0 <= strs[i].length <= 100. strs[i] consists of lowercase English letters only.",
    testCases: [
      {
        input: `["eat","tea","tan","ate","nat","bat"]`,
        expectedOutput: `[["bat"],["nat","tan"],["ate","eat","tea"]]`,
        isPublic: true
      },
      {
        input: `[""]`,
        expectedOutput: `[[""]]`,
        isPublic: true
      },
      {
        input: `["a"]`,
        expectedOutput: `[["a"]]`,
        isPublic: false
      },
      {
        input: `["abc","bca","cab","xyz","zyx","yxz"]`,
        expectedOutput: `[["abc","bca","cab"],["xyz","zyx","yxz"]]`,
        isPublic: false
      }
    ],
    difficulty: "medium",
    tags: ["Array", "Hash Table", "String", "Sorting"]
  }
];

async function seedProblems() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://vismayasinghbhati:9Cn4Zrgiyp6A176G@codecrack.estl2qq.mongodb.net/?retryWrites=true&w=majority&appName=CodeCrack');
    console.log('📊 Connected to MongoDB');

    // Get admin user ID
    const adminUserId = await getAdminUserId();
    console.log('👤 Found admin user:', adminUserId);

    let addedCount = 0;
    let skippedCount = 0;

    for (const problemData of problems) {
      try {
        // Check if problem already exists
        const existingProblem = await Problem.findOne({ title: problemData.title });
        
        if (existingProblem) {
          console.log(`⏭️  Skipping existing problem: ${problemData.title}`);
          skippedCount++;
          continue;
        }

        // Create new problem
        const problem = new Problem({
          ...problemData,
          createdBy: adminUserId
        });

        await problem.save();
        console.log(`✅ Added problem: ${problemData.title}`);
        addedCount++;

      } catch (error) {
        console.error(`❌ Error adding problem "${problemData.title}":`, error.message);
      }
    }

    console.log('\n🎉 Seeding completed!');
    console.log(`📊 Added: ${addedCount} new problems`);
    console.log(`⏭️  Skipped: ${skippedCount} existing problems`);
    console.log(`📈 Total problems processed: ${addedCount + skippedCount}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 MongoDB connection closed');
  }
}

// Run the seeding
if (require.main === module) {
  seedProblems();
}

module.exports = { seedProblems };
