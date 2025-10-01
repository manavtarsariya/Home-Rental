const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Property = require('../models/Property')
require('dotenv').config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@propertyrent.com',
    password: 'admin123',
    role: 'Admin',
    contactNumber: '9876543210',
    isActive: true
  },
  {
    name: 'John Owner',
    email: 'owner@test.com',
    password: 'password123',
    role: 'Owner',
    contactNumber: '9876543211',
    address: {
      street: '123 Owner Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    isActive: true
  },
  {
    name: 'Jane Tenant',
    email: 'tenant@test.com',
    password: 'password123',
    role: 'Tenant',
    contactNumber: '9876543212',
    address: {
      street: '456 Tenant Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    isActive: true
  }
]

const sampleProperties = [
  {
    title: 'Luxury 2BHK Apartment in Bandra',
    description: 'Beautiful 2BHK apartment with modern amenities in the heart of Bandra. Close to metro station and shopping centers.',
    address: {
      street: '123 Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400050',
      country: 'India'
    },
    area: 1200,
    type: 'Apartment',
    rent: 45000,
    securityDeposit: 90000,
    bedrooms: 2,
    bathrooms: 2,
    furnished: 'Fully Furnished',
    preferredTenants: 'Family',
    amenities: ['AC', 'WiFi', 'Parking', 'Security', 'Elevator'],
    availableFrom: new Date(),
    isAvailable: true,
    status: 'Approved'
  },
  {
    title: 'Cozy 1BHK Studio in Koramangala',
    description: 'Perfect studio apartment for working professionals. Fully furnished with high-speed internet.',
    address: {
      street: '456 Koramangala 4th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560034',
      country: 'India'
    },
    area: 600,
    type: 'Studio',
    rent: 25000,
    securityDeposit: 50000,
    bedrooms: 1,
    bathrooms: 1,
    furnished: 'Fully Furnished',
    preferredTenants: 'Bachelor',
    amenities: ['AC', 'WiFi', 'Gym', 'Security'],
    availableFrom: new Date(),
    isAvailable: true,
    status: 'Approved'
  }
]

const seedDatabase = async () => {
  try {
    console.log('🗑️ Clearing existing data...')
    await User.deleteMany({})
    await Property.deleteMany({})

    console.log('👥 Creating sample users...')
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    )
    
    const createdUsers = await User.insertMany(hashedUsers)
    console.log(`✅ Created ${createdUsers.length} users`)

    // Find owner for properties
    const owner = createdUsers.find(user => user.role === 'Owner')
    
    console.log('🏠 Creating sample properties...')
    const propertiesWithOwner = sampleProperties.map(property => ({
      ...property,
      owner: owner._id
    }))
    
    const createdProperties = await Property.insertMany(propertiesWithOwner)
    console.log(`✅ Created ${createdProperties.length} properties`)

    console.log('🎉 Sample data seeded successfully!')
    console.log('\n📧 Test Accounts:')
    console.log('Admin: admin@propertyrent.com / admin123')
    console.log('Owner: owner@test.com / password123')
    console.log('Tenant: tenant@test.com / password123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run seeder
const runSeeder = async () => {
  await connectDB()
  await seedDatabase()
}

if (require.main === module) {
  runSeeder()
}

module.exports = { seedDatabase, sampleUsers, sampleProperties }
