const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a property title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  area: {
    type: Number,
    required: [true, 'Please add area in square feet']
  },
  type: {
    type: String,
    required: [true, 'Please add property type'],
    enum: ['Apartment', 'Villa', 'PG', 'House', 'Flat', 'Studio', 'Duplex']
  },
  rent: {
    type: Number,
    required: [true, 'Please add monthly rent amount']
  },
  securityDeposit: {
    type: Number,
    default: function() {
      return this.rent * 2; // Default 2 months rent
    }
  },
  amenities: [{
    type: String,
    enum: [
      'Parking', 'Swimming Pool', 'Gym', 'Garden', 'Balcony', 
      'AC', 'Furnished', 'WiFi', 'Security', 'Elevator',
      'Power Backup', 'Water Supply', 'Maintenance', 'Pet Friendly'
    ]
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    formattedAddress: String
  },
  photos: [{
    url: String, // Cloudinary URL
    publicId: String, // Cloudinary public ID for deletion
    originalName: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    url: String, // Cloudinary URL
    publicId: String, // Cloudinary public ID for deletion
    originalName: String,
    size: Number,
    mimetype: String,
    documentType: {
      type: String,
      enum: ['Ownership Papers', 'NOC', 'Agreement', 'Other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Rented', 'Maintenance'],
    default: 'Pending'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  bedrooms: {
    type: Number,
    min: 0
  },
  bathrooms: {
    type: Number,
    min: 0
  },
  furnished: {
    type: String,
    enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'],
    default: 'Unfurnished'
  },
  preferredTenants: {
    type: String,
    enum: ['Family', 'Bachelor', 'Company', 'Any'],
    default: 'Any'
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create index for text search
propertySchema.index({
  title: 'text',
  description: 'text',
  'address.city': 'text',
  'address.state': 'text'
});

module.exports = mongoose.model('Property', propertySchema);
