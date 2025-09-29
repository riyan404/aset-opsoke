# Manual Testing Guide - Department Permissions

## Test Setup Summary
✅ **Test Users Created:**
- Marketing User (marketing.test@company.com) - Marketing Department
- Finance User (finance.test@company.com) - Finance Department  
- HR User (hr.test@company.com) - HR Department
- IT Admin (it.test@company.com) - IT Department

✅ **Password for all test users:** `testpassword123`

## Permission Matrix
| Department | Assets      | Documents   | Digital Assets |
|-----------|-------------|-------------|----------------|
| Marketing | Read Only   | -           | Full Access    |
| Finance   | Read/Write  | Full Access | -              |
| HR        | Read Only   | Read Only   | -              |
| IT        | Full Access | Full Access | Full Access    |

## Testing Checklist

### 1. Marketing User Testing
**Login:** marketing.test@company.com / testpassword123

**Expected Permissions:**
- ✅ Assets: Read Only (can view, cannot create/edit/delete)
- ❌ Documents: No access
- ✅ Digital Assets: Full Access (can view, create, edit, delete)

**Test Steps:**
1. Login with Marketing user
2. Navigate to Assets page - should see assets but no "Add" button
3. Try to edit an asset - should be restricted
4. Navigate to Digital Assets page - should see full functionality
5. Try to create a new digital asset - should work
6. Navigate to Documents page - should be restricted or show no access

### 2. Finance User Testing  
**Login:** finance.test@company.com / testpassword123

**Expected Permissions:**
- ✅ Assets: Read/Write (can view, create, edit, but not delete)
- ✅ Documents: Full Access (can view, create, edit, delete)
- ❌ Digital Assets: No access

**Test Steps:**
1. Login with Finance user
2. Navigate to Assets page - should see "Add" button and edit functionality
3. Try to create a new asset - should work
4. Try to delete an asset - should be restricted
5. Navigate to Documents page - should see full functionality
6. Navigate to Digital Assets page - should be restricted

### 3. HR User Testing
**Login:** hr.test@company.com / testpassword123

**Expected Permissions:**
- ✅ Assets: Read Only (can view only)
- ✅ Documents: Read Only (can view only)
- ❌ Digital Assets: No access

**Test Steps:**
1. Login with HR user
2. Navigate to Assets page - should see assets but no "Add" or edit buttons
3. Navigate to Documents page - should see documents but no "Add" or edit buttons
4. Navigate to Digital Assets page - should be restricted

### 4. IT Admin Testing
**Login:** it.test@company.com / testpassword123

**Expected Permissions:**
- ✅ Assets: Full Access (can view, create, edit, delete)
- ✅ Documents: Full Access (can view, create, edit, delete)
- ✅ Digital Assets: Full Access (can view, create, edit, delete)

**Test Steps:**
1. Login with IT Admin user
2. Navigate to all modules (Assets, Documents, Digital Assets)
3. Verify full functionality in all modules
4. Test create, edit, and delete operations

## Test Results Log

### Marketing User Test Results:
- [ ] Login successful
- [ ] Assets: Read-only access verified
- [ ] Digital Assets: Full access verified
- [ ] Documents: Access restriction verified

### Finance User Test Results:
- [ ] Login successful
- [ ] Assets: Read/Write access verified (no delete)
- [ ] Documents: Full access verified
- [ ] Digital Assets: Access restriction verified

### HR User Test Results:
- [ ] Login successful
- [ ] Assets: Read-only access verified
- [ ] Documents: Read-only access verified
- [ ] Digital Assets: Access restriction verified

### IT Admin Test Results:
- [ ] Login successful
- [ ] Assets: Full access verified
- [ ] Documents: Full access verified
- [ ] Digital Assets: Full access verified

## Notes
- All test users have been created with the password: `testpassword123`
- Permission configurations have been set up in the database
- Test assets have been created for testing purposes
- Use the application at: http://localhost:3000

## Expected Behavior
1. Users should only see modules they have access to
2. Within accessible modules, users should only see actions they're permitted to perform
3. Unauthorized actions should be blocked with appropriate error messages
4. Navigation should be restricted based on permissions