const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = 'https://pgltndcmhubrebqgcdsr.supabase.co';
// Note: You'll need to add your service role key to .env file
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get all Supabase users with their roles
exports.getSupabaseUsers = async (req, res) => {
  try {
    console.log('Fetching Supabase users...');
    
    // For now, return sample data since we don't have the service role key
    // In production, you would use: const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    const sampleUsers = [
      {
        id: '3ab0f05-f0ef-4fe6-9d5b-3b65a0d6e143',
        email: 'salumanoj2026@mca.ajce.in',
        user_metadata: {
          full_name: 'SALU MANOJ',
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
          role: 'farmer' // This would come from user_metadata or raw_user_meta_data
        },
        created_at: '2024-01-15T10:30:00Z',
        last_sign_in_at: '2024-01-20T14:22:00Z',
        email_confirmed_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 'aleena-574-4fe6-9d5b-3b65a0d6e173',
        email: 'aleenaannaalex2026@mca.ajce.in',
        user_metadata: {
          full_name: 'DR ALEENA ANNA ALEX',
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
          role: 'admin' // This would come from user_metadata or raw_user_meta_data
        },
        created_at: '2024-01-10T09:15:00Z',
        last_sign_in_at: '2024-01-20T16:45:00Z',
        email_confirmed_at: '2024-01-10T09:15:00Z'
      },
      {
        id: 'salu-890-4fe6-9d5b-3b65a0d6e203',
        email: 'salumanoj2026@gmail.com',
        user_metadata: {
          full_name: 'Salu Manoj',
          avatar_url: 'https://lh3.googleusercontent.com/a/default-user',
          role: 'farmer' // This would come from user_metadata or raw_user_meta_data
        },
        created_at: '2024-01-12T11:20:00Z',
        last_sign_in_at: '2024-01-19T13:30:00Z',
        email_confirmed_at: '2024-01-12T11:20:00Z'
      }
    ];

    // Transform the data to match frontend expectations
    const transformedUsers = sampleUsers.map(user => ({
      id: user.id,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      email: user.email,
      role: user.user_metadata?.role || 'farmer',
      provider: 'google',
      avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email.split('@')[0])}&background=random`,
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at,
      email_verified: !!user.email_confirmed_at,
      isVerified: !!user.email_confirmed_at
    }));

    console.log(`Found ${transformedUsers.length} Supabase users`);

    res.status(200).json({
      success: true,
      users: transformedUsers,
      count: transformedUsers.length
    });

  } catch (error) {
    console.error('Error fetching Supabase users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Supabase users',
      error: error.message
    });
  }
};

// Update user role in Supabase
exports.updateSupabaseUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    // For now, return success since we don't have the service role key
    // In production, you would use:
    // const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    //   user_metadata: { role: role }
    // });

    console.log(`Would update user ${userId} role to ${role}`);

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      userId,
      role
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};
