// Script untuk membantu debug browser console
// Jalankan ini di browser console untuk melihat permission state

console.log('=== DEBUGGING DIGITAL ASSETS PERMISSION ===')

// Check if we're on the digital assets page
if (window.location.pathname === '/dashboard/digital-assets') {
  console.log('✅ On digital assets page')
  
  // Check if there are any permission-related elements
  const addButton = document.querySelector('button:contains("Tambah Aset Digital")')
  console.log('Add button found:', addButton)
  
  // Check for permission state in React DevTools if available
  if (window.React) {
    console.log('React detected')
  }
  
  // Check localStorage for any auth data
  console.log('Auth token:', localStorage.getItem('token'))
  console.log('User data:', localStorage.getItem('user'))
  
  // Check if there are any network requests to permission endpoint
  console.log('Check Network tab for calls to /api/permissions/digital-assets')
  
} else {
  console.log('❌ Not on digital assets page. Current path:', window.location.pathname)
}

// Instructions
console.log(`
📋 DEBUGGING STEPS:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to /dashboard/digital-assets
4. Login with hr.test@example.com / testuser123
5. Look for permission logs in console
6. Check Network tab for API calls
7. Look for any error messages`)