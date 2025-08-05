# 🔐 Supabase User Role Management Guide

## 🎯 **Problem:** Google OAuth Users Auto-Login Without Role Check

When users sign in with Google OAuth through Supabase, they bypass your role-based access control because:
1. **No role assigned** in Supabase user metadata
2. **Auto-login** doesn't check roles
3. **Frontend** doesn't know user permissions

## ✅ **Solution: Role Management System**

### **Step 1: Check Current User Roles in Supabase**

#### **Method A: Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project: `pgltndcmhubrebqgcdsr`
3. Navigate: **Authentication → Users**
4. Click on each user to see their metadata
5. Look for `user_metadata` or `raw_user_meta_data` fields

#### **Method B: SQL Query**
In Supabase SQL Editor, run:
```sql
-- View all users and their current roles
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as name,
  raw_user_meta_data->>'role' as role,
  user_metadata->>'role' as user_role,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

### **Step 2: Assign Roles to Existing Users**

#### **Set Admin Role:**
```sql
-- Make DR ALEENA ANNA ALEX an admin
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'aleenaannaalex2026@mca.ajce.in';
```

#### **Set Farmer Role:**
```sql
-- Make other users farmers
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "farmer"}'::jsonb
WHERE email = 'salumanoj2026@mca.ajce.in';

UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "farmer"}'::jsonb
WHERE email = 'salumanoj2026@gmail.com';
```

#### **Verify Updates:**
```sql
-- Check updated roles
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as name
FROM auth.users 
WHERE email IN (
  'aleenaannaalex2026@mca.ajce.in',
  'salumanoj2026@mca.ajce.in', 
  'salumanoj2026@gmail.com'
);
```

### **Step 3: Updated AuthCallback Component** ✅

The AuthCallback component has been updated to:
1. **Extract user role** from Supabase metadata
2. **Store role** in localStorage with user data
3. **Redirect based on role:**
   - `admin` → `/admin-dashboard`
   - `farmer` → `/home`
   - `other` → `/dashboard`

### **Step 4: Test Role-Based Google OAuth**

#### **Test Admin Login:**
1. **Set admin role** in Supabase (SQL above)
2. **Go to:** `http://localhost:5176/login`
3. **Click "Continue with Google"**
4. **Login with:** aleenaannaalex2026@mca.ajce.in
5. **Should redirect to:** `/admin-dashboard`

#### **Test Farmer Login:**
1. **Set farmer role** in Supabase (SQL above)
2. **Go to:** `http://localhost:5176/login`
3. **Click "Continue with Google"**
4. **Login with:** salumanoj2026@gmail.com
5. **Should redirect to:** `/home`

### **Step 5: Backend API for Role Management**

#### **Get Supabase Users:**
```bash
GET /api/users/supabase
```

#### **Update User Role:**
```bash
PUT /api/users/supabase/role
Content-Type: application/json

{
  "userId": "user-uuid",
  "role": "admin"
}
```

### **Step 6: Frontend Role Management UI**

The ManageUsers component now:
- ✅ **Fetches real Supabase users** via API
- ✅ **Shows user roles** from metadata
- ✅ **Displays provider** (Google vs MongoDB)
- ✅ **Allows role updates** (future feature)

## 🎯 **Complete Role Management Workflow**

### **For New Google OAuth Users:**
1. **User signs in** with Google
2. **Supabase creates** user account
3. **Default role** assigned (farmer)
4. **Admin can update** role via SQL or API
5. **Next login** redirects based on role

### **For Existing Users:**
1. **Run SQL queries** to assign roles
2. **Users logout/login** to get new roles
3. **Automatic redirect** based on role

### **Role Assignment SQL:**
```sql
-- Make someone an admin
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'user@example.com';

-- Make someone a farmer
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "farmer"}'::jsonb
WHERE email = 'user@example.com';

-- Make someone a field officer
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "field_officer"}'::jsonb
WHERE email = 'user@example.com';

-- Make someone a broker
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "broker"}'::jsonb
WHERE email = 'user@example.com';
```

## 🚀 **Quick Setup Commands**

### **1. Assign Roles to Your Current Users:**
```sql
-- Set admin role for DR ALEENA
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'aleenaannaalex2026@mca.ajce.in';

-- Set farmer roles for others
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "farmer"}'::jsonb
WHERE email IN ('salumanoj2026@mca.ajce.in', 'salumanoj2026@gmail.com');
```

### **2. Verify Roles:**
```sql
SELECT
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as name
FROM auth.users;
```

### **3. Test Google OAuth:**
1. **Run the SQL** commands above
2. **Restart your servers**
3. **Test Google login** with different users
4. **Verify redirects** work correctly

Your Google OAuth users will now be properly managed with role-based access control! 🎊


<function_calls>
<invoke name="view">
<parameter name="path">RubberEco/src/components/Auth/AuthCallback.jsx
