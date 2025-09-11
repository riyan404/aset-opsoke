// Script untuk test apakah tombol "Tambah Aset Digital" muncul
// Jalankan di browser console setelah login

function checkButtonVisibility() {
  console.log('=== CHECKING BUTTON VISIBILITY ===')
  
  // Check current page
  console.log('Current URL:', window.location.href)
  
  // Check if we're on digital assets page
  if (!window.location.pathname.includes('/dashboard/digital-assets')) {
    console.log('❌ Not on digital assets page')
    return
  }
  
  // Look for the button
  const addButton = document.querySelector('button:has(svg + span)');
  const buttonWithText = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Tambah Aset Digital') || btn.textContent.includes('Loading...')
  )
  
  console.log('Button found:', buttonWithText)
  
  if (buttonWithText) {
    console.log('✅ Button exists!')
    console.log('Button text:', buttonWithText.textContent)
    console.log('Button disabled:', buttonWithText.disabled)
    console.log('Button classes:', buttonWithText.className)
    console.log('Button style:', buttonWithText.style.cssText)
    
    // Check if button is visible
    const rect = buttonWithText.getBoundingClientRect()
    console.log('Button position:', rect)
    console.log('Button visible:', rect.width > 0 && rect.height > 0)
  } else {
    console.log('❌ Button not found')
    
    // List all buttons on page
    const allButtons = document.querySelectorAll('button')
    console.log('All buttons on page:', allButtons.length)
    allButtons.forEach((btn, index) => {
      console.log(`Button ${index + 1}:`, btn.textContent.trim(), btn.className)
    })
  }
  
  // Check for permission-related console logs
  console.log('\n=== CHECK CONSOLE FOR PERMISSION LOGS ===')
  console.log('Look for logs starting with 🔍, 📡, ✅, 🎯, 🔄, ❌, 💥, 🎨')
}

// Auto-run after 2 seconds
setTimeout(checkButtonVisibility, 2000)

// Also provide manual function
window.checkButton = checkButtonVisibility

console.log('Script loaded. Button check will run in 2 seconds.')
console.log('You can also run manually: checkButton()')