import prisma from '../src/db/client'
import bcrypt from 'bcryptjs'

async function checkUser() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Usage: tsx scripts/check-user.ts <email>')
    process.exit(1)
  }

  try {
    // Try exact match first
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
    })

    // If not found, try case-insensitive
    if (!user) {
      const allUsers = await prisma.user.findMany({
        include: {
          profile: true,
        },
      })
      
      user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
      
      if (user) {
        user = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            profile: {
              include: {
                staffProfile: true,
              },
            },
          },
        })
      }
    }

    if (!user) {
      console.log(`❌ User not found with email: ${email}`)
      console.log('\nAvailable users:')
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          id: true,
        },
      })
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.id})`))
      process.exit(1)
    }

    console.log('✅ User found!')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Email (lowercase):', user.email.toLowerCase())
    console.log('Has Profile:', !!user.profile)
    
    if (user.profile) {
      console.log('Profile Active:', user.profile.active)
      console.log('User Type:', user.profile.userType)
      console.log('Full Name:', user.profile.fullName)
    }

    // Test password
    const testPassword = process.argv[3]
    if (testPassword) {
      const isValid = await bcrypt.compare(testPassword, user.passwordHash)
      console.log('\nPassword Test:')
      console.log('  Test Password:', testPassword)
      console.log('  Password Hash:', user.passwordHash.substring(0, 20) + '...')
      console.log('  Valid:', isValid ? '✅ YES' : '❌ NO')
      
      if (!isValid) {
        console.log('\n⚠️  Password does not match!')
        console.log('Make sure you are using the exact password (no extra spaces)')
      }
    }

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()


