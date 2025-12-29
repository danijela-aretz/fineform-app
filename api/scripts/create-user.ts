import bcrypt from 'bcryptjs'
import prisma from '../src/db/client'

async function createUser() {
  const email = process.argv[2] || 'admin@fineform.com'
  const password = process.argv[3] || 'admin123'
  const fullName = process.argv[4] || 'Admin User'
  const userType = process.argv[5] || 'STAFF' // STAFF or CLIENT
  const staffRole = process.argv[6] || 'SUPER_ADMIN' // SUPER_ADMIN, ADMIN, or STAFF

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log(`User with email ${email} already exists`)
      process.exit(1)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            userType: userType as 'STAFF' | 'CLIENT',
            fullName,
            email,
            active: true,
            ...(userType === 'STAFF' && {
              staffProfile: {
                create: {
                  staffRole: staffRole as 'SUPER_ADMIN' | 'ADMIN' | 'STAFF',
                  active: true,
                },
              },
            }),
          },
        },
      },
      include: {
        profile: {
          include: {
            staffProfile: true,
          },
        },
      },
    })

    console.log('User created successfully!')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Full Name:', user.profile.fullName)
    console.log('User Type:', user.profile.userType)
    if (user.profile.staffProfile) {
      console.log('Staff Role:', user.profile.staffProfile.staffRole)
    }
  } catch (error) {
    console.error('Error creating user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()

