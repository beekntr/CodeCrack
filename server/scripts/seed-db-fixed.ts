import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Problem } from "../models/Problem";
import { Submission } from "../models/Submission";

async function connectDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('📊 MongoDB Connected:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Problem.deleteMany({});
    await Submission.deleteMany({});
    console.log('🧹 Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

async function seedData() {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@codecrack.com',
      password: adminPassword,
      role: 'admin',
      score: 0,
      solvedProblems: []
    });
    console.log('✅ Admin user created with email: admin@codecrack.com');

    // Create sample users
    const users = [];
    const userNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Ethan Hunt'];
    const userEmails = ['alice@example.com', 'bob@example.com', 'charlie@example.com', 'diana@example.com', 'ethan@example.com'];
    const userScores = [370, 100, 950, 0, 1465];

    for (let i = 0; i < userNames.length; i++) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const user = await User.create({
        name: userNames[i],
        email: userEmails[i],
        password: hashedPassword,
        role: 'user',
        score: userScores[i],
        solvedProblems: []
      });
      users.push(user);
    }
    console.log(`✅ Sample users created: ${users.length}`);

    // Create coding problems
    console.log('📝 Creating coding problems...');
    
    const problems = [
      {
        title: 'Two Sum',
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

**Example 2:**
Input: nums = [3,2,4], target = 6
Output: [1,2]

**Example 3:**
Input: nums = [3,3], target = 6
Output: [0,1]`,
        inputFormat: 'First line contains the array of integers.\nSecond line contains the target integer.',
        outputFormat: 'Return the indices of the two numbers that add up to the target.',
        constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
        difficulty: 'easy',
        tags: ['array', 'hash-table'],
        testCases: [
          { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isPublic: true },
          { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isPublic: true },
          { input: '[3,3]\n6', expectedOutput: '[0,1]', isPublic: false },
          { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', isPublic: false }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Valid Parentheses',
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

**Example 1:**
Input: s = "()"
Output: true

**Example 2:**
Input: s = "()[]{}"
Output: true

**Example 3:**
Input: s = "(]"
Output: false`,
        inputFormat: 'A string s containing only the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\'.',
        outputFormat: 'Return true if the string is valid, false otherwise.',
        constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.', 
        difficulty: 'easy',
        tags: ['string', 'stack'],
        testCases: [
          { input: '()', expectedOutput: 'true', isPublic: true },
          { input: '()[]{} ', expectedOutput: 'true', isPublic: true },
          { input: '(]', expectedOutput: 'false', isPublic: false },
          { input: '([)]', expectedOutput: 'false', isPublic: false }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Merge Two Sorted Lists',
        description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

**Example 1:**
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]

**Example 2:**
Input: list1 = [], list2 = []
Output: []

**Example 3:**
Input: list1 = [], list2 = [0]
Output: [0]`,
        inputFormat: 'Two lines, each containing a sorted linked list represented as an array.',
        outputFormat: 'Return the merged sorted linked list as an array.',
        constraints: 'The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.',
        difficulty: 'easy',
        tags: ['linked-list', 'recursion'],
        testCases: [
          { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isPublic: true },
          { input: '[]\n[]', expectedOutput: '[]', isPublic: true },
          { input: '[]\n[0]', expectedOutput: '[0]', isPublic: false }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Add Two Numbers',
        description: `You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**Example 1:**
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.

**Example 2:**
Input: l1 = [0], l2 = [0]
Output: [0]

**Example 3:**
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]`,
        inputFormat: 'Two lines, each containing a linked list representing a number in reverse order.',
        outputFormat: 'Return the sum as a linked list in reverse order.',
        constraints: 'The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9\nIt is guaranteed that the list represents a number that does not have leading zeros.',
        difficulty: 'medium',
        tags: ['linked-list', 'math', 'recursion'],
        testCases: [
          { input: '[2,4,3]\n[5,6,4]', expectedOutput: '[7,0,8]', isPublic: true },
          { input: '[0]\n[0]', expectedOutput: '[0]', isPublic: true },
          { input: '[9,9,9,9,9,9,9]\n[9,9,9,9]', expectedOutput: '[8,9,9,9,0,0,0,1]', isPublic: false }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Longest Substring Without Repeating Characters',
        description: `Given a string s, find the length of the longest substring without repeating characters.

**Example 1:**
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.

**Example 2:**
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.

**Example 3:**
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.`,
        inputFormat: 'A string s consisting of English letters, digits, symbols and spaces.',
        outputFormat: 'Return the length of the longest substring without repeating characters.',
        constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
        difficulty: 'medium',
        tags: ['hash-table', 'string', 'sliding-window'],
        testCases: [
          { input: 'abcabcbb', expectedOutput: '3', isPublic: true },
          { input: 'bbbbb', expectedOutput: '1', isPublic: true },
          { input: 'pwwkew', expectedOutput: '3', isPublic: false },
          { input: ' ', expectedOutput: '1', isPublic: false }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Container With Most Water',
        description: `You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Notice that you may not slant the container.

**Example 1:**
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.

**Example 2:**
Input: height = [1,1]
Output: 1`,
        inputFormat: 'An array of integers representing the height of vertical lines.',
        outputFormat: 'Return the maximum area of water that can be contained.',
        constraints: 'n == height.length\n2 <= n <= 10^5\n0 <= height[i] <= 10^4',
        difficulty: 'medium',
        tags: ['array', 'two-pointers', 'greedy'],
        testCases: [
          { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isPublic: true },
          { input: '[1,1]', expectedOutput: '1', isPublic: true },
          { input: '[4,3,2,1,4]', expectedOutput: '16', isPublic: false }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Median of Two Sorted Arrays',
        description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

**Example 1:**
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.

**Example 2:**
Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.`,
        inputFormat: 'Two lines, each containing a sorted array of integers.',
        outputFormat: 'Return the median of the two sorted arrays as a floating point number.',
        constraints: 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6',
        difficulty: 'hard',
        tags: ['array', 'binary-search', 'divide-and-conquer'],
        testCases: [
          { input: '[1,3]\n[2]', expectedOutput: '2.00000', isPublic: true },
          { input: '[1,2]\n[3,4]', expectedOutput: '2.50000', isPublic: true },
          { input: '[0,0]\n[0,0]', expectedOutput: '0.00000', isPublic: false }
        ],
        createdBy: adminUser._id
      },
      {
        title: 'Regular Expression Matching',
        description: `Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where:

'.' Matches any single character.
'*' Matches zero or more of the preceding element.

The matching should cover the entire input string (not partial).

**Example 1:**
Input: s = "aa", p = "a"
Output: false
Explanation: "a" does not match the entire string "aa".

**Example 2:**
Input: s = "aa", p = "a*"
Output: true
Explanation: '*' means zero or more of the preceding element, 'a'. Therefore, by repeating 'a' once, it becomes "aa".

**Example 3:**
Input: s = "ab", p = ".*"
Output: true
Explanation: ".*" means "zero or more (*) of any character (.)".`,
        inputFormat: 'Two lines: the input string s and the pattern p.',
        outputFormat: 'Return true if s matches p, false otherwise.',
        constraints: '1 <= s.length <= 20\n1 <= p.length <= 30\ns contains only lowercase English letters.\np contains only lowercase English letters, \'.\', and \'*\'.\nIt is guaranteed for each appearance of the character \'*\', there will be a previous valid character to match.',
        difficulty: 'hard',
        tags: ['string', 'dynamic-programming', 'recursion'],
        testCases: [
          { input: 'aa\na', expectedOutput: 'false', isPublic: true },
          { input: 'aa\na*', expectedOutput: 'true', isPublic: true },
          { input: 'ab\n.*', expectedOutput: 'true', isPublic: false },
          { input: 'aab\nc*a*b', expectedOutput: 'true', isPublic: false }
        ],
        createdBy: adminUser._id
      }
    ];

    const createdProblems = await Problem.insertMany(problems);
    console.log(`✅ Problems created: ${createdProblems.length}`);

    // Create sample submissions and update user scores
    console.log('📊 Creating sample submissions...');
    
    const submissions = [];
    const difficultyPoints = { easy: 10, medium: 20, hard: 30 };

    // Alice solves some easy and medium problems
    const aliceProblems = createdProblems.slice(0, 3); // First 3 problems (2 easy, 1 easy)
    const aliceUser = users[0];
    
    for (const problem of aliceProblems) {
      const submission = await Submission.create({
        userId: aliceUser._id,
        problemId: problem._id,
        code: `# Solution for ${problem.title}\ndef solution():\n    return "correct answer"`,
        language: 'python',
        result: {
          success: true,
          verdict: 'ACCEPTED',
          message: 'All test cases passed!',
          testResults: problem.testCases.map(tc => ({
            passed: true,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: tc.expectedOutput,
            executionTime: 50,
            memoryUsage: 1024
          })),
          totalExecutionTime: 150,
          totalMemoryUsage: 3072,
          passedTests: problem.testCases.length,
          totalTests: problem.testCases.length
        }
      });
      
      submissions.push(submission);
      aliceUser.solvedProblems.push(problem._id);
      aliceUser.score += difficultyPoints[problem.difficulty as keyof typeof difficultyPoints];
    }
    await aliceUser.save();

    // Charlie solves more problems including hard ones
    const charlieProblems = createdProblems.slice(0, 7); // First 7 problems
    const charlieUser = users[2];
    
    for (const problem of charlieProblems) {
      const submission = await Submission.create({
        userId: charlieUser._id,
        problemId: problem._id,
        code: `# Advanced solution for ${problem.title}\nclass Solution:\n    def solve(self):\n        return "optimized answer"`,
        language: 'python',
        result: {
          success: true,
          verdict: 'ACCEPTED',
          message: 'Excellent solution!',
          testResults: problem.testCases.map(tc => ({
            passed: true,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: tc.expectedOutput,
            executionTime: 30,
            memoryUsage: 512
          })),
          totalExecutionTime: 90,
          totalMemoryUsage: 1536,
          passedTests: problem.testCases.length,
          totalTests: problem.testCases.length
        }
      });
      
      submissions.push(submission);
      charlieUser.solvedProblems.push(problem._id);
      charlieUser.score += difficultyPoints[problem.difficulty as keyof typeof difficultyPoints];
    }
    await charlieUser.save();

    // Ethan solves all problems
    const ethanUser = users[4];
    
    for (const problem of createdProblems) {
      const submission = await Submission.create({
        userId: ethanUser._id,
        problemId: problem._id,
        code: `// Master solution for ${problem.title}\nclass Solution {\n    public solve() {\n        return "perfect answer";\n    }\n}`,
        language: 'java',
        result: {
          success: true,
          verdict: 'ACCEPTED',
          message: 'Perfect execution!',
          testResults: problem.testCases.map(tc => ({
            passed: true,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: tc.expectedOutput,
            executionTime: 20,
            memoryUsage: 256
          })),
          totalExecutionTime: 60,
          totalMemoryUsage: 768,
          passedTests: problem.testCases.length,
          totalTests: problem.testCases.length
        }
      });
      
      submissions.push(submission);
      ethanUser.solvedProblems.push(problem._id);
      ethanUser.score += difficultyPoints[problem.difficulty as keyof typeof difficultyPoints];
    }
    await ethanUser.save();

    // Bob tries but fails some problems
    const bobProblems = createdProblems.slice(0, 2); // First 2 problems
    const bobUser = users[1];
    
    // Bob solves 1 problem successfully
    const successfulProblem = bobProblems[0];
    const successSubmission = await Submission.create({
      userId: bobUser._id,
      problemId: successfulProblem._id,
      code: `# Basic solution for ${successfulProblem.title}\ndef solve():\n    return "answer"`,
      language: 'python',
      result: {
        success: true,
        verdict: 'ACCEPTED',
        message: 'Solution accepted!',
        testResults: successfulProblem.testCases.map(tc => ({
          passed: true,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: tc.expectedOutput,
          executionTime: 100,
          memoryUsage: 2048
        })),
        totalExecutionTime: 300,
        totalMemoryUsage: 6144,
        passedTests: successfulProblem.testCases.length,
        totalTests: successfulProblem.testCases.length
      }
    });
    
    submissions.push(successSubmission);
    bobUser.solvedProblems.push(successfulProblem._id);
    bobUser.score += difficultyPoints[successfulProblem.difficulty as keyof typeof difficultyPoints];

    // Bob fails another problem
    const failedProblem = bobProblems[1];
    const failedSubmission = await Submission.create({
      userId: bobUser._id,
      problemId: failedProblem._id,
      code: `# Incorrect solution\ndef solve():\n    return "wrong answer"`,
      language: 'python',
      result: {
        success: false,
        verdict: 'WRONG_ANSWER',
        message: 'Wrong answer on test case 2',
        testResults: failedProblem.testCases.map((tc, index) => ({
          passed: index === 0, // Only first test passes
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: index === 0 ? tc.expectedOutput : 'wrong output',
          executionTime: 80,
          memoryUsage: 1536
        })),
        totalExecutionTime: 240,
        totalMemoryUsage: 4608,
        passedTests: 1,
        totalTests: failedProblem.testCases.length
      }
    });
    
    submissions.push(failedSubmission);
    await bobUser.save();

    console.log(`✅ Sample submissions created: ${submissions.length}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📋 Summary:');
    console.log(`   • Admin user: admin@codecrack.com (password: admin123)`);
    console.log(`   • Regular users: ${users.length}`);
    console.log(`   • Problems: ${createdProblems.length}`);
    console.log(`   • Submissions: ${submissions.length}`);
    console.log('\n👤 User Scores:');
    for (const user of users) {
      console.log(`   • ${user.name}: ${user.score} points (${user.solvedProblems.length} problems solved)`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Initializing CodeCrack database...');
    
    await connectDatabase();
    await clearDatabase();
    await seedData();
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📊 MongoDB disconnected');
    process.exit(0);
  }
}

main();
