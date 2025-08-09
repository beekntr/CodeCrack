#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

// Definition for singly-linked list.
struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    // Create a dummy node to simplify operations
    ListNode dummy(0);
    ListNode* tail = &dummy;

    while (list1 != NULL && list2 != NULL) {
        if (list1->val <= list2->val) {
            tail->next = list1;
            list1 = list1->next;
        } else {
            tail->next = list2;
            list2 = list2->next;
        }
        tail = tail->next;
    }

    // Attach remaining nodes
    if (list1 != NULL) tail->next = list1;
    if (list2 != NULL) tail->next = list2;

    return dummy.next;
}

// Helper function to convert linked list to array format output
void printListAsArray(ListNode* head) {
    cout << "[";
    bool first = true;
    while (head != NULL) {
        if (!first) cout << ",";
        cout << head->val;
        first = false;
        head = head->next;
    }
    cout << "]";
}

// Helper function to create linked list from array
ListNode* createList(vector<int> arr) {
    if (arr.empty()) return NULL;
    ListNode* head = new ListNode(arr[0]);
    ListNode* current = head;
    for (int i = 1; i < arr.size(); i++) {
        current->next = new ListNode(arr[i]);
        current = current->next;
    }
    return head;
}

// Parse array input like "[1,2,4]" or "[]"
vector<int> parseInput(string input) {
    vector<int> result;
    if (input == "[]" || input.empty()) return result;
    
    // Remove brackets
    input = input.substr(1, input.length() - 2);
    
    stringstream ss(input);
    string token;
    
    while (getline(ss, token, ',')) {
        if (!token.empty()) {
            result.push_back(stoi(token));
        }
    }
    
    return result;
}

int main() {
    string input1, input2;
    
    // Read two lines of input
    getline(cin, input1);
    getline(cin, input2);
    
    // Parse the inputs
    vector<int> arr1 = parseInput(input1);
    vector<int> arr2 = parseInput(input2);
    
    // Create linked lists
    ListNode* list1 = createList(arr1);
    ListNode* list2 = createList(arr2);
    
    // Merge and output
    ListNode* merged = mergeTwoLists(list1, list2);
    printListAsArray(merged);
    cout << endl;

    return 0;
}
