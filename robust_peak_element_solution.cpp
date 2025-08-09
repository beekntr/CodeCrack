#include <iostream>
#include <vector>
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
    string input;
    getline(cin, input);
    
    vector<int> nums;
    
    // Parse JSON array format: [1,2,3,1]
    if (input.length() >= 2 && input[0] == '[' && input.back() == ']') {
        string content = input.substr(1, input.length() - 2);
        
        if (!content.empty()) {
            string num = "";
            for (char c : content) {
                if (c == ',') {
                    if (!num.empty()) {
                        nums.push_back(stoi(num));
                        num = "";
                    }
                } else if (c != ' ') {
                    num += c;
                }
            }
            if (!num.empty()) {
                nums.push_back(stoi(num));
            }
        }
    }
    
    // Call function and output result
    if (!nums.empty()) {
        cout << findPeakElement(nums) << endl;
    }
    
    return 0;
}
