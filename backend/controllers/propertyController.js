const Property = require('../models/Property')
const User = require('../models/User')
const mongoose = require('mongoose')
const { cloudinary } = require('../middleware/upload')

// Create property
const createProperty = async (req, res) => {
  try {
    const owner = req.user.id

    // Parse JSON fields from FormData
    const propertyData = { ...req.body }
    
    // Parse address if it's a JSON string
    if (typeof propertyData.address === 'string') {
      try {
        propertyData.address = JSON.parse(propertyData.address)
      } catch (error) {
        return res.status(400).json({ error: 'Invalid address format' })
      }
    }

    // Parse amenities if it's a JSON string
    if (typeof propertyData.amenities === 'string') {
      try {
        propertyData.amenities = JSON.parse(propertyData.amenities)
      } catch (error) {
        propertyData.amenities = []
      }
    }

    // Handle amenities array from form data
    if (Array.isArray(propertyData.amenities) && propertyData.amenities.length === 1 && typeof propertyData.amenities[0] === 'string') {
      try {
        propertyData.amenities = JSON.parse(propertyData.amenities[0])
      } catch (error) {
        propertyData.amenities = [propertyData.amenities[0]]
      }
    }

    // Ensure amenities is an array
    if (!Array.isArray(propertyData.amenities)) {
      propertyData.amenities = []
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'type', 'rent', 'area', 'bedrooms', 'bathrooms']
    for (const field of requiredFields) {
      if (!propertyData[field] || propertyData[field] === '') {
        return res.status(400).json({ error: `${field} is required` })
      }
    }

    // Validate address
    if (!propertyData.address || typeof propertyData.address !== 'object') {
      return res.status(400).json({ error: 'Address is required' })
    }

    const addressFields = ['street', 'city', 'state', 'zipCode']
    for (const field of addressFields) {
      if (!propertyData.address[field] || propertyData.address[field].trim() === '') {
        return res.status(400).json({ error: `Address ${field} is required` })
      }
    }

    // Convert numeric fields
    propertyData.rent = Number(propertyData.rent)
    propertyData.area = Number(propertyData.area)
    propertyData.bedrooms = Number(propertyData.bedrooms)
    propertyData.bathrooms = Number(propertyData.bathrooms)
    
    if (propertyData.securityDeposit) {
      propertyData.securityDeposit = Number(propertyData.securityDeposit)
    }

    // Handle file uploads
    const photos = []
    const documents = []

    if (req.files) {
      if (req.files.photos) {
        req.files.photos.forEach(file => {
          photos.push({
            url: file.path, // Cloudinary URL
            publicId: file.public_id, // Cloudinary public ID for deletion
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          })
        })
      }

      if (req.files.documents) {
        req.files.documents.forEach(file => {
          documents.push({
            url: file.path, // Cloudinary URL
            publicId: file.public_id, // Cloudinary public ID for deletion
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          })
        })
      }
    }

    // Create property object
    const property = new Property({
      ...propertyData,
      owner,
      photos,
      documents,
      status: 'Pending'
    })

    await property.save()
    await property.populate('owner', 'name email')

    res.status(201).json({
      message: 'Property created successfully',
      data: property
    })

  } catch (error) {
    console.error('Property creation error:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      })
    }
    
    res.status(500).json({ error: 'Server error' })
  }
}

// Get properties (with filters)
const getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      state,
      type,
      minRent,
      maxRent,
      bedrooms,
      furnished,
      amenities,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build filter object
    const filter = {
     status: 'Approved',
      isAvailable: true
    }

    if (city) filter['address.city'] = new RegExp(city, 'i')
    if (state) filter['address.state'] = new RegExp(state, 'i')
    if (type) filter.type = type
    if (bedrooms) filter.bedrooms = Number(bedrooms)
    if (furnished) filter.furnished = furnished

    // Price range filter
    if (minRent || maxRent) {
      filter.rent = {}
      if (minRent) filter.rent.$gte = Number(minRent)
      if (maxRent) filter.rent.$lte = Number(maxRent)
    }

    // Amenities filter
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : [amenities]
      filter.amenities = { $in: amenitiesList }
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)
    const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

    const properties = await Property.find(filter)
      .populate('owner', 'name email contactNumber')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))

    const total = await Property.countDocuments(filter)

    res.json({
      data: properties,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      }
    })

  } catch (error) {
    console.error('Get properties error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// Get single property
const getProperty = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid property ID' })
    }

    const property = await Property.findById(id).populate('owner', 'name email contactNumber')

    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    // Increment view count
    property.views += 1
    await property.save()

    res.json({ data: property })

  } catch (error) {
    console.error('Get property error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// Update property (owner only)
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid property ID' })
    }

    const property = await Property.findById(id)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    // Check ownership
    if (property.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Parse JSON fields from FormData
    const updateData = { ...req.body }
    
    // Parse address if it's a JSON string
    if (typeof updateData.address === 'string') {
      try {
        updateData.address = JSON.parse(updateData.address)
      } catch (error) {
        return res.status(400).json({ error: 'Invalid address format' })
      }
    }

    // Parse amenities if it's a JSON string
    if (typeof updateData.amenities === 'string') {
      try {
        updateData.amenities = JSON.parse(updateData.amenities)
      } catch (error) {
        updateData.amenities = []
      }
    }

    // Convert numeric fields
    if (updateData.rent) updateData.rent = Number(updateData.rent)
    if (updateData.area) updateData.area = Number(updateData.area)
    if (updateData.bedrooms) updateData.bedrooms = Number(updateData.bedrooms)
    if (updateData.bathrooms) updateData.bathrooms = Number(updateData.bathrooms)
    if (updateData.securityDeposit) updateData.securityDeposit = Number(updateData.securityDeposit)

    // Handle new file uploads
    if (req.files) {
      if (req.files.newPhotos) {
        const newPhotos = req.files.newPhotos.map(file => ({
          url: file.path, // Cloudinary URL
          publicId: file.public_id, // Cloudinary public ID for deletion
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }))
        updateData.photos = [...(property.photos || []), ...newPhotos]
      }

      if (req.files.newDocuments) {
        const newDocuments = req.files.newDocuments.map(file => ({
          url: file.path, // Cloudinary URL
          publicId: file.public_id, // Cloudinary public ID for deletion
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size
        }))
        updateData.documents = [...(property.documents || []), ...newDocuments]
      }
    }

    // Handle photo removal
    if (updateData.photosToRemove) {
      const photosToRemove = Array.isArray(updateData.photosToRemove) 
        ? updateData.photosToRemove 
        : [updateData.photosToRemove]
      
      updateData.photos = property.photos.filter(photo => 
        !photosToRemove.includes(photo._id.toString())
      )
    }

    // Update property and reset status to pending for re-approval
    updateData.status = 'Pending'

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email')

    res.json({
      message: 'Property updated successfully',
      data: updatedProperty
    })

  } catch (error) {
    console.error('Update property error:', error)
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      })
    }
    
    res.status(500).json({ error: 'Server error' })
  }
}

// Delete property (owner only)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid property ID' })
    }

    const property = await Property.findById(id)
    if (!property) {
      return res.status(404).json({ error: 'Property not found' })
    }

    // Check ownership
    if (property.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Delete associated files from Cloudinary
    if (property.photos) {
      for (const photo of property.photos) {
        if (photo.publicId) {
          try {
            await cloudinary.uploader.destroy(photo.publicId)
          } catch (error) {
            console.error('Error deleting photo from Cloudinary:', error)
          }
        }
      }
    }

    if (property.documents) {
      for (const doc of property.documents) {
        if (doc.publicId) {
          try {
            await cloudinary.uploader.destroy(doc.publicId, { resource_type: 'raw' })
          } catch (error) {
            console.error('Error deleting document from Cloudinary:', error)
          }
        }
      }
    }

    await Property.findByIdAndDelete(id)

    res.json({ message: 'Property deleted successfully' })

  } catch (error) {
    console.error('Delete property error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// Get owner's properties
const getOwnerProperties = async (req, res) => {
  try {
    const ownerId = req.user.id

    const properties = await Property.find({ owner: ownerId })
      .sort({ createdAt: -1 })

    res.json({ data: properties })

  } catch (error) {
    console.error('Get owner properties error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// Search properties with advanced filters
const searchProperties = async (req, res) => {
  try {
    const {
      query,
      city,
      state,
      minRent,
      maxRent,
      type,
      bedrooms,
      amenities,
      furnished,
      page = 1,
      limit = 10
    } = req.query

    const filter = {
      status: 'Approved',
      isAvailable: true
    }

    // Text search
    if (query) {
      filter.$or = [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { 'address.city': new RegExp(query, 'i') },
        { 'address.state': new RegExp(query, 'i') }
      ]
    }

    // Location filters
    if (city) filter['address.city'] = new RegExp(city, 'i')
    if (state) filter['address.state'] = new RegExp(state, 'i')

    // Property filters
    if (type) filter.type = type
    if (bedrooms) filter.bedrooms = Number(bedrooms)
    if (furnished) filter.furnished = furnished

    // Price range
    if (minRent || maxRent) {
      filter.rent = {}
      if (minRent) filter.rent.$gte = Number(minRent)
      if (maxRent) filter.rent.$lte = Number(maxRent)
    }

    // Amenities
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',')
      filter.amenities = { $in: amenitiesList }
    }

    const skip = (Number(page) - 1) * Number(limit)

    const properties = await Property.find(filter)
      .populate('owner', 'name email contactNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await Property.countDocuments(filter)

    res.json({
      data: properties,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
        limit: Number(limit)
      },
      filters: {
        query,
        city,
        state,
        minRent,
        maxRent,
        type,
        bedrooms,
        amenities,
        furnished
      }
    })

  } catch (error) {
    console.error('Search properties error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getOwnerProperties,
  searchProperties
}
