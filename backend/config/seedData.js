const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

// Load env vars
dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'Admin',
    contactNumber: '+91-9876543210',
    address: {
      street: '123 Admin Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  {
    name: 'John Property Owner',
    email: 'owner@example.com',
    password: 'owner123',
    role: 'Owner',
    contactNumber: '+91-9876543211',
    address: {
      street: '456 Owner Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    }
  },
  {
    name: 'Jane Property Owner',
    email: 'owner2@example.com',
    password: 'owner123',
    role: 'Owner',
    contactNumber: '+91-9876543212',
    address: {
      street: '789 Owner Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    }
  },
  {
    name: 'Mike Tenant',
    email: 'tenant@example.com',
    password: 'tenant123',
    role: 'Tenant',
    contactNumber: '+91-9876543213',
    address: {
      street: '321 Tenant Road',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India'
    }
  },
  {
    name: 'Sarah Tenant',
    email: 'tenant2@example.com',
    password: 'tenant123',
    role: 'Tenant',
    contactNumber: '+91-9876543214',
    address: {
      street: '654 Tenant Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India'
    }
  }
];

// Sample properties data (will be populated with owner IDs after users are created)
const getPropertiesData = (ownerIds) => [
  {
    owner: ownerIds[0], // John Property Owner
    title: 'Modern 2BHK Apartment in Bandra',
    description: 'Beautiful modern apartment with all amenities. Perfect for young professionals and small families. Located in the heart of Bandra with easy access to transportation.',
    address: {
      street: '123 Linking Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400050',
      country: 'India'
    },
    area: 900,
    type: 'Apartment',
    rent: 45000,
    securityDeposit: 90000,
    amenities: ['Parking', 'Swimming Pool', 'Gym', 'Security', 'Elevator', 'WiFi'],
    location: {
      type: 'Point',
      coordinates: [72.8347, 19.0596], // Bandra coordinates
      formattedAddress: '123 Linking Road, Bandra, Mumbai, Maharashtra 400050'
    },
    status: 'Approved',
    isAvailable: true,
    bedrooms: 2,
    bathrooms: 2,
    furnished: 'Semi Furnished',
    preferredTenants: 'Family',
    availableFrom: new Date()
  },
  {
    owner: ownerIds[0], // John Property Owner
    title: 'Luxury 3BHK Villa in Juhu',
    description: 'Spacious villa near Juhu Beach with private parking and garden. Perfect for families looking for luxury living with beach proximity.',
    address: {
      street: '45 Juhu Tara Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400049',
      country: 'India'
    },
    area: 1500,
    type: 'Villa',
    rent: 85000,
    securityDeposit: 170000,
    amenities: ['Parking', 'Garden', 'Security', 'Power Backup', 'Water Supply'],
    location: {
      type: 'Point',
      coordinates: [72.8262, 19.0975], // Juhu coordinates
      formattedAddress: '45 Juhu Tara Road, Juhu, Mumbai, Maharashtra 400049'
    },
    status: 'Approved',
    isAvailable: true,
    bedrooms: 3,
    bathrooms: 3,
    furnished: 'Fully Furnished',
    preferredTenants: 'Family',
    availableFrom: new Date()
  },
  {
    owner: ownerIds[1], // Jane Property Owner
    title: 'Cozy 1BHK Studio in Koramangala',
    description: 'Perfect studio apartment for working professionals. Located in prime Koramangala area with easy access to IT companies and restaurants.',
    address: {
      street: '78 Koramangala 4th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560034',
      country: 'India'
    },
    area: 600,
    type: 'Studio',
    rent: 25000,
    securityDeposit: 50000,
    amenities: ['Parking', 'WiFi', 'AC', 'Security', 'Elevator'],
    location: {
      type: 'Point',
      coordinates: [77.6212, 12.9352], // Koramangala coordinates
      formattedAddress: '78 Koramangala 4th Block, Bangalore, Karnataka 560034'
    },
    status: 'Approved',
    isAvailable: true,
    bedrooms: 1,
    bathrooms: 1,
    furnished: 'Fully Furnished',
    preferredTenants: 'Bachelor',
    availableFrom: new Date()
  },
  {
    owner: ownerIds[1], // Jane Property Owner
    title: 'Spacious 2BHK in Whitefield',
    description: 'Well-ventilated apartment in peaceful Whitefield area. Great for IT professionals working in tech parks nearby.',
    address: {
      street: '92 Whitefield Main Road',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560066',
      country: 'India'
    },
    area: 1100,
    type: 'Apartment',
    rent: 35000,
    securityDeposit: 70000,
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Power Backup'],
    location: {
      type: 'Point',
      coordinates: [77.7500, 12.9698], // Whitefield coordinates
      formattedAddress: '92 Whitefield Main Road, Whitefield, Bangalore, Karnataka 560066'
    },
    status: 'Approved',
    isAvailable: false, // This one is rented
    bedrooms: 2,
    bathrooms: 2,
    furnished: 'Semi Furnished',
    preferredTenants: 'Any',
    availableFrom: new Date()
  },
  {
    owner: ownerIds[0], // John Property Owner
    title: 'Budget PG in Andheri',
    description: 'Affordable PG accommodation for students and working professionals. Clean rooms with basic amenities.',
    address: {
      street: '15 Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400069',
      country: 'India'
    },
    area: 200,
    type: 'PG',
    rent: 12000,
    securityDeposit: 24000,
    amenities: ['WiFi', 'Security', 'Water Supply', 'Maintenance'],
    location: {
      type: 'Point',
      coordinates: [72.8681, 19.1136], // Andheri coordinates
      formattedAddress: '15 Andheri East, Mumbai, Maharashtra 400069'
    },
    status: 'Pending', // This one is pending approval
    isAvailable: true,
    bedrooms: 1,
    bathrooms: 1,
    furnished: 'Furnished',
    preferredTenants: 'Bachelor',
    availableFrom: new Date()
  }
];

// Clear database
const clearDatabase = async () => {
  try {
    await User.deleteMany();
    await Property.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Feedback.deleteMany();
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// Import data
const importData = async () => {
  try {
    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    for (let user of users) {
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Create users
    const createdUsers = await User.create(users);
    console.log('Users imported');

    // Get owner IDs
    const owners = createdUsers.filter(user => user.role === 'Owner');
    const ownerIds = owners.map(owner => owner._id);

    // Create properties
    const propertiesData = getPropertiesData(ownerIds);
    const createdProperties = await Property.create(propertiesData);
    console.log('Properties imported');

    // Create sample bookings
    const tenants = createdUsers.filter(user => user.role === 'Tenant');
    const availableProperties = createdProperties.filter(property => property.isAvailable);

    if (tenants.length > 0 && availableProperties.length > 0) {
      const sampleBookings = [
        {
          property: availableProperties[0]._id,
          tenant: tenants[0]._id,
          owner: availableProperties[0].owner,
          moveInDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          leaseDuration: 12,
          monthlyRent: availableProperties[0].rent,
          securityDeposit: availableProperties[0].securityDeposit,
          totalAmount: availableProperties[0].rent + availableProperties[0].securityDeposit,
          message: 'I am interested in this property. Please let me know when we can schedule a visit.',
          status: 'Pending'
        }
      ];

      const createdBookings = await Booking.create(sampleBookings);
      console.log('Sample bookings imported');

      // Create sample payments
      const samplePayments = [
        {
          tenant: tenants[0]._id,
          property: availableProperties[1]._id,
          booking: createdBookings[0]._id,
          amount: 25000,
          paymentType: 'Rent',
          paymentMethod: 'Card',
          status: 'Completed',
          description: 'Monthly rent payment for March 2024'
        }
      ];

      await Payment.create(samplePayments);
      console.log('Sample payments imported');

      // Create sample feedback
      const sampleFeedback = [
        {
          tenant: tenants[0]._id,
          property: availableProperties[0]._id,
          rating: 4,
          comment: 'Great property with excellent amenities. The location is perfect and the owner is very responsive.',
          categories: {
            cleanliness: 4,
            location: 5,
            amenities: 4,
            ownerBehavior: 5,
            valueForMoney: 4
          }
        }
      ];

      await Feedback.create(sampleFeedback);
      console.log('Sample feedback imported');
    }

    console.log('All data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await clearDatabase();
    console.log('Data destroyed');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  deleteData();
} else {
  clearDatabase().then(() => {
    importData();
  });
}
