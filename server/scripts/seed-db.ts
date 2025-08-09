import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/database';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
import { Submission } from '../models/Submission';
import bcrypt from 'bcryptjs';

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing CodeCrack database...');
    
    await connectDB();
    
    // Clear existing data for fresh start
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});
    console.log('🧹 Cleared existing data');
    
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@codecrack.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
    const adminUser = new User({
      name: 'Administrator',
      email: adminEmail,
      password: hashedAdminPassword,
      role: 'admin',
      score: 0,
      solvedProblems: []
    });
    
    await adminUser.save();
    console.log('✅ Admin user created with email:', adminEmail);
    
    // Create sample users
    const sampleUsers = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user' as const,
        score: 370,
        solvedProblems: []
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user' as const,
        score: 100,
        solvedProblems: []
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user' as const,
        score: 950,
        solvedProblems: []
      },
      {
        name: 'Diana Prince',
        email: 'diana@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user' as const,
        score: 0,
        solvedProblems: []
      },
      {
        name: 'Ethan Hunt',
        email: 'ethan@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'user' as const,
        score: 1465,
        solvedProblems: []
      }
    ];
    
    const createdUsers = await User.insertMany(sampleUsers);
    console.log('✅ Sample users created:', createdUsers.length);
    
    // Create comprehensive problem set
    console.log('📝 Creating coding problems...');
    
    const problems = [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "easy" as const,
        tags: ["array", "hash-table"],
        testCases: [
          {
            input: '{"nums": [2,7,11,15], "target": 9}',
            expectedOutput: "[0,1]",
            isHidden: false
          },
          {
            input: '{"nums": [3,2,4], "target": 6}',
            expectedOutput: "[1,2]",
            isHidden: false
          },
          {
            input: '{"nums": [3,3], "target": 6}',
            expectedOutput: "[0,1]",
            isHidden: true
          }
        ],
        constraints: [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "Only one valid answer exists."
        ],
        examples: [
          {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]",
            explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
          }
        ],
        points: 100
      },
      {
        title: "Valid Parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        difficulty: "easy" as const,
        tags: ["string", "stack"],
        testCases: [
          {
            input: '{"s": "()"}',
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: '{"s": "()[]{}"}',
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: '{"s": "(]"}',
            expectedOutput: "false",
            isHidden: false
          },
          {
            input: '{"s": "([)]"}',
            expectedOutput: "false",
            isHidden: true
          }
        ],
        constraints: [
          "1 <= s.length <= 10^4",
          "s consists of parentheses only '()[]{}'."
        ],
        examples: [
          {
            input: 's = "()"',
            output: "true",
            explanation: "The string contains valid parentheses."
          }
        ],
        points: 120
      },
      {
        title: "Merge Two Sorted Lists",
        description: "You are given the heads of two sorted linked lists list1 and list2.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
        difficulty: "easy" as const,
        tags: ["linked-list", "recursion"],
        testCases: [
          {
            input: '{"list1": [1,2,4], "list2": [1,3,4]}',
            expectedOutput: "[1,1,2,3,4,4]",
            isHidden: false
          },
          {
            input: '{"list1": [], "list2": []}',
            expectedOutput: "[]",
            isHidden: false
          },
          {
            input: '{"list1": [], "list2": [0]}',
            expectedOutput: "[0]",
            isHidden: true
          }
        ],
        constraints: [
          "The number of nodes in both lists is in the range [0, 50].",
          "-100 <= Node.val <= 100",
          "Both list1 and list2 are sorted in non-decreasing order."
        ],
        examples: [
          {
            input: "list1 = [1,2,4], list2 = [1,3,4]",
            output: "[1,1,2,3,4,4]",
            explanation: "The merged list is [1,1,2,3,4,4]."
          }
        ],
        points: 150
      },
      {
        title: "Add Two Numbers",
        description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.",
        difficulty: "medium" as const,
        tags: ["linked-list", "math", "recursion"],
        testCases: [
          {
            input: '{"l1": [2,4,3], "l2": [5,6,4]}',
            expectedOutput: "[7,0,8]",
            isHidden: false
          },
          {
            input: '{"l1": [0], "l2": [0]}',
            expectedOutput: "[0]",
            isHidden: false
          },
          {
            input: '{"l1": [9,9,9,9,9,9,9], "l2": [9,9,9,9]}',
            expectedOutput: "[8,9,9,9,0,0,0,1]",
            isHidden: true
          }
        ],
        constraints: [
          "The number of nodes in each linked list is in the range [1, 100].",
          "0 <= Node.val <= 9",
          "It is guaranteed that the list represents a number that does not have leading zeros."
        ],
        examples: [
          {
            input: "l1 = [2,4,3], l2 = [5,6,4]",
            output: "[7,0,8]",
            explanation: "342 + 465 = 807."
          }
        ],
        points: 200
      },
      {
        title: "Longest Substring Without Repeating Characters",
        description: "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "medium" as const,
        tags: ["hash-table", "string", "sliding-window"],
        testCases: [
          {
            input: '{"s": "abcabcbb"}',
            expectedOutput: "3",
            isHidden: false
          },
          {
            input: '{"s": "bbbbb"}',
            expectedOutput: "1",
            isHidden: false
          },
          {
            input: '{"s": "pwwkew"}',
            expectedOutput: "3",
            isHidden: false
          },
          {
            input: '{"s": ""}',
            expectedOutput: "0",
            isHidden: true
          }
        ],
        constraints: [
          "0 <= s.length <= 5 * 10^4",
          "s consists of English letters, digits, symbols and spaces."
        ],
        examples: [
          {
            input: 's = "abcabcbb"',
            output: "3",
            explanation: 'The answer is "abc", with the length of 3.'
          }
        ],
        points: 250
      },
      {
        title: "Container With Most Water",
        description: "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container that contains the most water.\n\nReturn the maximum amount of water a container can store.\n\nNotice that you may not slant the container.",
        difficulty: "medium" as const,
        tags: ["array", "two-pointers", "greedy"],
        testCases: [
          {
            input: '{"height": [1,8,6,2,5,4,8,3,7]}',
            expectedOutput: "49",
            isHidden: false
          },
          {
            input: '{"height": [1,1]}',
            expectedOutput: "1",
            isHidden: false
          },
          {
            input: '{"height": [4,3,2,1,4]}',
            expectedOutput: "16",
            isHidden: true
          }
        ],
        constraints: [
          "n == height.length",
          "2 <= n <= 10^5",
          "0 <= height[i] <= 10^4"
        ],
        examples: [
          {
            input: "height = [1,8,6,2,5,4,8,3,7]",
            output: "49",
            explanation: "The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49."
          }
        ],
        points: 300
      },
      {
        title: "Median of Two Sorted Arrays",
        description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).",
        difficulty: "hard" as const,
        tags: ["array", "binary-search", "divide-and-conquer"],
        testCases: [
          {
            input: '{"nums1": [1,3], "nums2": [2]}',
            expectedOutput: "2.0",
            isHidden: false
          },
          {
            input: '{"nums1": [1,2], "nums2": [3,4]}',
            expectedOutput: "2.5",
            isHidden: false
          },
          {
            input: '{"nums1": [0,0], "nums2": [0,0]}',
            expectedOutput: "0.0",
            isHidden: true
          }
        ],
        constraints: [
          "nums1.length == m",
          "nums2.length == n",
          "0 <= m <= 1000",
          "0 <= n <= 1000",
          "1 <= m + n <= 2000",
          "-10^6 <= nums1[i], nums2[i] <= 10^6"
        ],
        examples: [
          {
            input: "nums1 = [1,3], nums2 = [2]",
            output: "2.0",
            explanation: "merged array = [1,2,3] and median is 2."
          }
        ],
        points: 500
      },
      {
        title: "Regular Expression Matching",
        description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:\n\n'.' Matches any single character.\n'*' Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).",
        difficulty: "hard" as const,
        tags: ["string", "dynamic-programming", "recursion"],
        testCases: [
          {
            input: '{"s": "aa", "p": "a"}',
            expectedOutput: "false",
            isHidden: false
          },
          {
            input: '{"s": "aa", "p": "a*"}',
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: '{"s": "ab", "p": ".*"}',
            expectedOutput: "true",
            isHidden: false
          },
          {
            input: '{"s": "aab", "p": "c*a*b"}',
            expectedOutput: "true",
            isHidden: true
          }
        ],
        constraints: [
          "1 <= s.length <= 20",
          "1 <= p.length <= 30",
          "s contains only lowercase English letters.",
          "p contains only lowercase English letters, '.', and '*'.",
          "It is guaranteed for each appearance of the character '*', there will be a previous valid character to match."
        ],
        examples: [
          {
            input: 's = "aa", p = "a"',
            output: "false",
            explanation: '"a" does not match the entire string "aa".'
          }
        ],
        points: 600
      }
    ];
    
    const createdProblems = await Problem.insertMany(problems);
    console.log('✅ Problems created:', createdProblems.length);
    
    // Create sample submissions for users
    const sampleSubmissions = [];
    const users = await User.find({ role: 'user' });
    
    // Alice solves easy problems
    const aliceUser = users.find(u => u.email === 'alice@example.com');
    if (aliceUser) {
      const easyProblems = createdProblems.filter(p => p.difficulty === 'easy');
      for (const problem of easyProblems.slice(0, 3)) {
        sampleSubmissions.push({
          userId: aliceUser._id,
          problemId: problem._id,
          code: `// Solution for ${problem.title}\nfunction solve(input) {\n  // Alice's solution\n  return "correct answer";\n}`,
          language: 'javascript',
          status: 'ACCEPTED',
          executionTime: 120 + Math.random() * 80,
          memoryUsed: 15 + Math.random() * 10,
          score: problem.points,
          testCaseResults: problem.testCases.map(() => ({ passed: true, executionTime: 50 + Math.random() * 30 }))
        });
        aliceUser.solvedProblems.push(problem._id);
      }
      await aliceUser.save();
    }
    
    // Bob solves one easy problem
    const bobUser = users.find(u => u.email === 'bob@example.com');
    if (bobUser) {
      const problem = createdProblems.find(p => p.title === 'Two Sum');
      if (problem) {
        sampleSubmissions.push({
          userId: bobUser._id,
          problemId: problem._id,
          code: `// Two Sum solution\nfunction twoSum(nums, target) {\n  // Bob's solution\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}`,
          language: 'javascript',
          status: 'ACCEPTED',
          executionTime: 95,
          memoryUsed: 18,
          score: problem.points,
          testCaseResults: problem.testCases.map(() => ({ passed: true, executionTime: 45 }))
        });
        bobUser.solvedProblems.push(problem._id);
        await bobUser.save();
      }
    }
    
    // Charlie solves easy and medium problems
    const charlieUser = users.find(u => u.email === 'charlie@example.com');
    if (charlieUser) {
      const selectedProblems = createdProblems.filter(p => 
        p.difficulty === 'easy' || (p.difficulty === 'medium' && Math.random() > 0.3)
      );
      for (const problem of selectedProblems.slice(0, 5)) {
        sampleSubmissions.push({
          userId: charlieUser._id,
          problemId: problem._id,
          code: `// ${problem.title} solution\n// Charlie's optimized approach\nfunction solve(input) {\n  // Efficient solution here\n  return result;\n}`,
          language: 'javascript',
          status: 'ACCEPTED',
          executionTime: 80 + Math.random() * 60,
          memoryUsed: 12 + Math.random() * 8,
          score: problem.points,
          testCaseResults: problem.testCases.map(() => ({ passed: true, executionTime: 40 + Math.random() * 20 }))
        });
        charlieUser.solvedProblems.push(problem._id);
      }
      await charlieUser.save();
    }
    
    // Ethan solves multiple problems including hard ones
    const ethanUser = users.find(u => u.email === 'ethan@example.com');
    if (ethanUser) {
      for (const problem of createdProblems.slice(0, 7)) {
        sampleSubmissions.push({
          userId: ethanUser._id,
          problemId: problem._id,
          code: `// Advanced solution for ${problem.title}\nclass Solution {\n  solve(input) {\n    // Ethan's expert-level solution\n    return optimizedResult;\n  }\n}`,
          language: 'javascript',
          status: 'ACCEPTED',
          executionTime: 60 + Math.random() * 40,
          memoryUsed: 10 + Math.random() * 5,
          score: problem.points,
          testCaseResults: problem.testCases.map(() => ({ passed: true, executionTime: 30 + Math.random() * 15 }))
        });
        ethanUser.solvedProblems.push(problem._id);
      }
      await ethanUser.save();
    }
    
    if (sampleSubmissions.length > 0) {
      await Submission.insertMany(sampleSubmissions);
      console.log('✅ Sample submissions created:', sampleSubmissions.length);
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
    const userCount = await User.countDocuments();
    const problemCount = await Problem.countDocuments();
    const submissionCount = await Submission.countDocuments();
    
    console.log('\n📋 Setup Summary:');
    console.log('👤 Admin Email:', adminEmail);
    console.log('🔑 Admin Password:', adminPassword);
    console.log('📊 Problems:', problemCount);
    console.log('👥 Users:', userCount);
    console.log('📝 Submissions:', submissionCount);
    console.log('\n👤 Sample User Credentials (all passwords: password123):');
    console.log('- alice@example.com (Score: 370)');
    console.log('- bob@example.com (Score: 100)'); 
    console.log('- charlie@example.com (Score: 950)');
    console.log('- diana@example.com (Score: 0)');
    console.log('- ethan@example.com (Score: 1465)');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

initializeDatabase();
