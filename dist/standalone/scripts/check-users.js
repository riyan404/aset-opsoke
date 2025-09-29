const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        isActive: true
      }
    })

    console.log('\n=== All Users in Database ===')
    console.log(`Total users: ${users.length}\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Department: ${user.department || 'N/A'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Active: ${user.isActive}`)
      console.log('')
    })

    // Check specifically for digitalkontenoke email
    const digitalUser = users.find(u => u.email.includes('digitalkonten'))
    if (digitalUser) {
      console.log('✅ Found digitalkontenoke user!')
    } else {
      console.log('❌ digitalkontenoke@gmail.com not found in database')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()