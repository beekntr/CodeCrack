#include <iostream>
#include <vector>
#include <sstream>
#include <string>
using namespace std;

int findPeakElement(vector<int>& nums) {
    int left = 0;
    int right = nums.size() - 1;
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        // If mid element is smaller than next element,
        // peak must be on the right side
        if (nums[mid] < nums[mid + 1]) {
            left = mid + 1;
        }
        // Otherwise, peak is on the left side (including mid)
        else {
            right = mid;
        }
    }
    
    return left; // left == right at this point
}

int main() {
    string line;
    getline(cin, line);
    
    // Parse the input array from string like "[1,2,3,1]"
    vector<int> nums;
    
    // Remove brackets and parse
    line = line.substr(1, line.length() - 2); // Remove [ and ]
    stringstream ss(line);
    string token;
    
    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }
    
    // Call the function and output result
    int result = findPeakElement(nums);
    cout << result << endl;
    
    return 0;
}
