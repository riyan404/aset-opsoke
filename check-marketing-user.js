const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function checkMarketingUser() {
  const prisma = new PrismaClient()
  
  try {
    console.log('=== CHECKING MARKETING USER ===')
    
    const user = await prisma.user.findUnique({
      where: { email: 'marketing.test@company.com' }
    })
    
    if (!user) {
      console.log('❌ Marketing user not found!')
      return
    }
    
    console.log('✅ Marketing user found:')
    console.log('  Email:', user.email)
    console.log('  Username:', user.username)
    console.log('  Department:', user.department)
    console.log('  Active:', user.isActive)
    console.log('  Role:', user.role)
    
    // Test password
    const passwordMatch = await bcrypt.compare('password123', user.password)
    console.log('  Password match:', passwordMatch ? '✅' : '❌')
    
    if (!passwordMatch) {
      console.log('🔧 Fixing password...')
      const hashedPassword = await bcrypt.hash('password123', 10)
      await prisma.user.update({
        where: { email: 'marketing.test@company.com' },
        data: { password: hashedPassword }
      })
      console.log('✅ Password updated!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMarketingUser()
