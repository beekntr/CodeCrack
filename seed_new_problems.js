import mongoose from 'mongoose';
import './server/models/Problem.js';

const problems = [
  {
    title: "Valid Binary Search Tree",
    difficulty: "medium",
    description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key
- The right subtree of a node contains only nodes with keys greater than the node's key
- Both the left and right subtrees must also be binary search trees

The tree is represented as a JSON object where each node has the structure:
\`\`\`json
{
  "val": number,
  "left": TreeNode | null,
  "right": TreeNode | null
}
\`\`\`

**Input Format:** A JSON string representing the root node of the binary tree, or "null" for an empty tree.
**Output Format:** Return "true" if the tree is a valid BST, "false" otherwise.`,
    examples: [
      {
        input: `{"val": 2, "left": {"val": 1, "left": null, "right": null}, "right": {"val": 3, "left": null, "right": null}}`,
        output: `true`,
        explanation: "This represents the tree with root 2, left child 1, and right child 3. This is a valid BST since 1 < 2 < 3."
      },
      {
        input: `{"val": 5, "left": {"val": 1, "left": null, "right": null}, "right": {"val": 4, "left": {"val": 3, "left": null, "right": null}, "right": {"val": 6, "left": null, "right": null}}}`,
        output: `false`,
        explanation: "This represents a tree where the root is 5, but the right subtree has a node with value 4, which violates the BST property since 4 < 5."
      }
    ],
    testCases: [
      {
        input: `{"val": 2, "left": {"val": 1, "left": null, "right": null}, "right": {"val": 3, "left": null, "right": null}}`,
        expectedOutput: `true`,
        isPublic: true
      },
      {
        input: `{"val": 5, "left": {"val": 1, "left": null, "right": null}, "right": {"val": 4, "left": {"val": 3, "left": null, "right": null}, "right": {"val": 6, "left": null, "right": null}}}`,
        expectedOutput: `false`,
        isPublic: true
      },
      {
        input: `null`,
        expectedOutput: `true`,
        isPublic: false
      },
      {
        input: `{"val": 1, "left": null, "right": null}`,
        expectedOutput: `true`,
        isPublic: false
      },
      {
        input: `{"val": 10, "left": {"val": 5, "left": null, "right": {"val": 7, "left": null, "right": null}}, "right": {"val": 15, "left": {"val": 12, "left": null, "right": null}, "right": {"val": 20, "left": null, "right": null}}}`,
        expectedOutput: `true`,
        isPublic: false
      },
      {
        input: `{"val": 10, "left": {"val": 5, "left": null, "right": {"val": 15, "left": null, "right": null}}, "right": {"val": 15, "left": null, "right": null}}`,
        expectedOutput: `false`,
        isPublic: false
      }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 256,
      inputSize: "1 ≤ number of nodes ≤ 10,000"
    },
    tags: ["Binary Trees", "Tree Traversal", "Recursion", "Validation"]
  },
  {
    title: "Maximum Subarray Sum",
    difficulty: "medium",
    description: `Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return the sum.

A subarray is a contiguous part of an array.

**Input Format:** A JSON array of integers as a string.
**Output Format:** Return the maximum sum as an integer.`,
    examples: [
      {
        input: `[-2,1,-3,4,-1,2,1,-5,4]`,
        output: `6`,
        explanation: "[4,-1,2,1] has the largest sum = 6."
      },
      {
        input: `[1]`,
        output: `1`,
        explanation: "The array contains only one element, so the maximum sum is 1."
      }
    ],
    testCases: [
      {
        input: `[-2,1,-3,4,-1,2,1,-5,4]`,
        expectedOutput: `6`,
        isPublic: true
      },
      {
        input: `[1]`,
        expectedOutput: `1`,
        isPublic: true
      },
      {
        input: `[5,4,-1,7,8]`,
        expectedOutput: `23`,
        isPublic: false
      },
      {
        input: `[-1]`,
        expectedOutput: `-1`,
        isPublic: false
      },
      {
        input: `[-2,-3,-1,-5]`,
        expectedOutput: `-1`,
        isPublic: false
      },
      {
        input: `[1,2,3,4,5]`,
        expectedOutput: `15`,
        isPublic: false
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputSize: "1 ≤ nums.length ≤ 100,000"
    },
    tags: ["Arrays", "Dynamic Programming", "Kadane's Algorithm"]
  },
  {
    title: "Valid Parentheses",
    difficulty: "easy",
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Input Format:** A string containing only parentheses characters.
**Output Format:** Return "true" if the string is valid, "false" otherwise.`,
    examples: [
      {
        input: `"()"`,
        output: `true`,
        explanation: "The string contains one pair of valid parentheses."
      },
      {
        input: `"()[]{}",`,
        output: `true`,
        explanation: "All brackets are properly matched and in correct order."
      },
      {
        input: `"(]"`,
        output: `false`,
        explanation: "The opening parenthesis doesn't match the closing square bracket."
      }
    ],
    testCases: [
      {
        input: `"()"`,
        expectedOutput: `true`,
        isPublic: true
      },
      {
        input: `"()[]{}",`,
        expectedOutput: `true`,
        isPublic: true
      },
      {
        input: `"(]"`,
        expectedOutput: `false`,
        isPublic: true
      },
      {
        input: `""`,
        expectedOutput: `true`,
        isPublic: false
      },
      {
        input: `"((("`,
        expectedOutput: `false`,
        isPublic: false
      },
      {
        input: `"{[()]}"`,
        expectedOutput: `true`,
        isPublic: false
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputSize: "0 ≤ s.length ≤ 10,000"
    },
    tags: ["Stack", "String Processing"]
  },
  {
    title: "Longest Palindromic Substring",
    difficulty: "medium",
    description: `Given a string \`s\`, return the longest palindromic substring in \`s\`.

A palindrome is a string that reads the same forward and backward.

**Input Format:** A string s.
**Output Format:** Return the longest palindromic substring as a string.`,
    examples: [
      {
        input: `"babad"`,
        output: `"bab"`,
        explanation: `"bab" is a palindrome. Note that "aba" is also a valid answer.`
      },
      {
        input: `"cbbd"`,
        output: `"bb"`,
        explanation: `"bb" is the longest palindromic substring.`
      }
    ],
    testCases: [
      {
        input: `"babad"`,
        expectedOutput: `"bab"`,
        isPublic: true
      },
      {
        input: `"cbbd"`,
        expectedOutput: `"bb"`,
        isPublic: true
      },
      {
        input: `"a"`,
        expectedOutput: `"a"`,
        isPublic: false
      },
      {
        input: `"ac"`,
        expectedOutput: `"a"`,
        isPublic: false
      },
      {
        input: `"racecar"`,
        expectedOutput: `"racecar"`,
        isPublic: false
      },
      {
        input: `"abcdef"`,
        expectedOutput: `"a"`,
        isPublic: false
      }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 256,
      inputSize: "1 ≤ s.length ≤ 1000"
    },
    tags: ["String Processing", "Dynamic Programming", "Two Pointers"]
  },
  {
    title: "Binary Tree Level Order Traversal",
    difficulty: "medium",
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

The tree is represented as a JSON object where each node has the structure:
\`\`\`json
{
  "val": number,
  "left": TreeNode | null,
  "right": TreeNode | null
}
\`\`\`

**Input Format:** A JSON string representing the root node of the binary tree, or "null" for an empty tree.
**Output Format:** Return a JSON array of arrays, where each inner array contains the values of nodes at that level.`,
    examples: [
      {
        input: `{"val": 3, "left": {"val": 9, "left": null, "right": null}, "right": {"val": 20, "left": {"val": 15, "left": null, "right": null}, "right": {"val": 7, "left": null, "right": null}}}`,
        output: `[[3],[9,20],[15,7]]`,
        explanation: "Level 0: [3], Level 1: [9,20], Level 2: [15,7]"
      },
      {
        input: `{"val": 1, "left": null, "right": null}`,
        output: `[[1]]`,
        explanation: "Single node tree has only one level."
      }
    ],
    testCases: [
      {
        input: `{"val": 3, "left": {"val": 9, "left": null, "right": null}, "right": {"val": 20, "left": {"val": 15, "left": null, "right": null}, "right": {"val": 7, "left": null, "right": null}}}`,
        expectedOutput: `[[3],[9,20],[15,7]]`,
        isPublic: true
      },
      {
        input: `{"val": 1, "left": null, "right": null}`,
        expectedOutput: `[[1]]`,
        isPublic: true
      },
      {
        input: `null`,
        expectedOutput: `[]`,
        isPublic: false
      },
      {
        input: `{"val": 1, "left": {"val": 2, "left": {"val": 4, "left": null, "right": null}, "right": null}, "right": {"val": 3, "left": null, "right": {"val": 5, "left": null, "right": null}}}`,
        expectedOutput: `[[1],[2,3],[4,5]]`,
        isPublic: false
      }
    ],
    constraints: {
      timeLimit: 1500,
      memoryLimit: 256,
      inputSize: "0 ≤ number of nodes ≤ 2000"
    },
    tags: ["Binary Trees", "BFS", "Queue", "Tree Traversal"]
  },
  {
    title: "Climbing Stairs",
    difficulty: "easy",
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

**Input Format:** An integer n representing the number of steps.
**Output Format:** Return the number of distinct ways as an integer.`,
    examples: [
      {
        input: `2`,
        output: `2`,
        explanation: `There are two ways to climb to the top:
1. 1 step + 1 step
2. 2 steps`
      },
      {
        input: `3`,
        output: `3`,
        explanation: `There are three ways to climb to the top:
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step`
      }
    ],
    testCases: [
      {
        input: `2`,
        expectedOutput: `2`,
        isPublic: true
      },
      {
        input: `3`,
        expectedOutput: `3`,
        isPublic: true
      },
      {
        input: `1`,
        expectedOutput: `1`,
        isPublic: false
      },
      {
        input: `4`,
        expectedOutput: `5`,
        isPublic: false
      },
      {
        input: `5`,
        expectedOutput: `8`,
        isPublic: false
      },
      {
        input: `10`,
        expectedOutput: `89`,
        isPublic: false
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputSize: "1 ≤ n ≤ 45"
    },
    tags: ["Dynamic Programming", "Fibonacci Sequence", "Math"]
  },
  {
    title: "Find Peak Element",
    difficulty: "medium",
    description: `A peak element is an element that is strictly greater than its neighbors.

Given a 0-indexed integer array \`nums\`, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of the peaks.

You may imagine that \`nums[-1] = nums[n] = -∞\`. In other words, an element is always considered to be strictly greater than a neighbor that is outside the array.

You must write an algorithm that runs in O(log n) time.

**Input Format:** A JSON array of integers as a string.
**Output Format:** Return the index of a peak element as an integer.`,
    examples: [
      {
        input: `[1,2,3,1]`,
        output: `2`,
        explanation: "3 is a peak element and your function should return the index number 2."
      },
      {
        input: `[1,2,1,3,5,6,4]`,
        output: `5`,
        explanation: "Your function can return either index 1 where the peak element is 2, or index 5 where the peak element is 6."
      }
    ],
    testCases: [
      {
        input: `[1,2,3,1]`,
        expectedOutput: `2`,
        isPublic: true
      },
      {
        input: `[1,2,1,3,5,6,4]`,
        expectedOutput: `5`,
        isPublic: true
      },
      {
        input: `[1]`,
        expectedOutput: `0`,
        isPublic: false
      },
      {
        input: `[1,2]`,
        expectedOutput: `1`,
        isPublic: false
      },
      {
        input: `[2,1]`,
        expectedOutput: `0`,
        isPublic: false
      },
      {
        input: `[1,3,2,1]`,
        expectedOutput: `1`,
        isPublic: false
      }
    ],
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputSize: "1 ≤ nums.length ≤ 1000"
    },
    tags: ["Binary Search", "Arrays"]
  },
  {
    title: "Group Anagrams",
    difficulty: "medium",
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

**Input Format:** A JSON array of strings.
**Output Format:** Return a JSON array of arrays, where each inner array contains anagrams grouped together.`,
    examples: [
      {
        input: `["eat","tea","tan","ate","nat","bat"]`,
        output: `[["bat"],["nat","tan"],["ate","eat","tea"]]`,
        explanation: "The strings are grouped by their anagrams."
      },
      {
        input: `[""]`,
        output: `[[""]]`,
        explanation: "Single empty string forms one group."
      }
    ],
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
        input: `["abc","bca","cab","xyz"]`,
        expectedOutput: `[["abc","bca","cab"],["xyz"]]`,
        isPublic: false
      },
      {
        input: `["ab","ba"]`,
        expectedOutput: `[["ab","ba"]]`,
        isPublic: false
      }
    ],
    constraints: {
      timeLimit: 2000,
      memoryLimit: 256,
      inputSize: "1 ≤ strs.length ≤ 10,000"
    },
    tags: ["Hash Table", "String Processing", "Sorting"]
  }
];

async function seedProblems() {
  try {
    await mongoose.connect('mongodb+srv://geetika:LhfqT5n8aGPnRmhx@cluster0.estl2qq.mongodb.net/codecrack?retryWrites=true&w=majority&appName=Cluster0');
    
    const Problem = mongoose.model('Problem');
    
    console.log('🌱 Starting to seed new problems...');
    
    for (let i = 0; i < problems.length; i++) {
      const problemData = problems[i];
      
      // Check if problem already exists
      const existingProblem = await Problem.findOne({ title: problemData.title });
      if (existingProblem) {
        console.log(`⚠️  Problem "${problemData.title}" already exists, skipping...`);
        continue;
      }
      
      const problem = new Problem(problemData);
      await problem.save();
      console.log(`✅ Added problem ${i + 1}: "${problemData.title}" (${problemData.difficulty})`);
    }
    
    console.log('🎉 All problems seeded successfully!');
    
    // Show summary
    const totalProblems = await Problem.countDocuments();
    const easy = await Problem.countDocuments({ difficulty: 'easy' });
    const medium = await Problem.countDocuments({ difficulty: 'medium' });
    const hard = await Problem.countDocuments({ difficulty: 'hard' });
    
    console.log('\n📊 Database Summary:');
    console.log(`Total Problems: ${totalProblems}`);
    console.log(`Easy: ${easy} | Medium: ${medium} | Hard: ${hard}`);
    
    await mongoose.disconnect();
    console.log('🔗 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error seeding problems:', error);
    process.exit(1);
  }
}

seedProblems();
