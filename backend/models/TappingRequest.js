const mongoose = require('mongoose');

// Ensure Register model is loaded
require('./Register');

const tappingRequestSchema = new mongoose.Schema({
  // Request identification
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Farmer information
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Register',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  farmerEmail: {
    type: String,
    required: true
  },
  farmerPhone: {
    type: String,
    required: true
  },
  
  // Farm details
  farmLocation: {
    type: String,
    required: true
  },
  farmSize: {
    type: String,
    required: true
  },
  numberOfTrees: {
    type: Number,
    required: true
  },
  soilType: {
    type: String
  },
  
  // Tapping details
  tappingType: {
    type: String,
    required: true,
    enum: ['daily', 'alternate_day', 'weekly', 'custom']
  },
  startDate: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  preferredTime: {
    type: String,
    required: true,
    enum: ['early_morning', 'morning', 'afternoon', 'evening']
  },
  
  // Request details
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  budgetRange: {
    type: String
  },
  specialRequirements: {
    type: String
  },
  contactPreference: {
    type: String,
    required: true,
    enum: ['phone', 'whatsapp', 'email', 'visit']
  },
  
  // Documents
  documents: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Request status
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'under_review', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'submitted'
  },
  
  // Assignment details
  assignedTapper: {
    tapperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    tapperName: String,
    tapperPhone: String,
    tapperEmail: String,
    assignedAt: Date,
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Register'
    }
  },
  
  // Service details
  serviceDetails: {
    estimatedCost: String,
    actualCost: String,
    startedAt: Date,
    completedAt: Date,
    notes: String
  },
  
  // Admin notes and actions
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Register'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Notification tracking
  notificationSent: {
    type: Boolean,
    default: false
  },
  emailNotificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
tappingRequestSchema.index({ farmerId: 1 });
tappingRequestSchema.index({ status: 1 });
tappingRequestSchema.index({ submittedAt: -1 });
tappingRequestSchema.index({ requestId: 1 });
tappingRequestSchema.index({ 'assignedTapper.tapperId': 1 });

// Pre-save middleware to update the updatedAt field
tappingRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Generate request ID
tappingRequestSchema.pre('save', async function(next) {
  if (this.isNew && !this.requestId) {
    console.log('🔢 Generating requestId...');
    const count = await this.constructor.countDocuments();
    this.requestId = `TR${String(count + 1).padStart(6, '0')}`;
    console.log('✅ Generated requestId:', this.requestId);
  }
  next();
});

// Virtual for formatted submission date
tappingRequestSchema.virtual('formattedSubmittedAt').get(function() {
  return this.submittedAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for days since submission
tappingRequestSchema.virtual('daysSinceSubmission').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.submittedAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if request is overdue
tappingRequestSchema.methods.isOverdue = function() {
  const now = new Date();
  const daysSince = Math.ceil((now - this.submittedAt) / (1000 * 60 * 60 * 24));
  
  // Consider high priority requests overdue after 1 day, normal after 3 days
  if (this.urgency === 'high' && daysSince > 1) return true;
  if (this.urgency === 'normal' && daysSince > 3) return true;
  if (this.urgency === 'low' && daysSince > 7) return true;
  
  return false;
};

// Method to get status color
tappingRequestSchema.methods.getStatusColor = function() {
  const colors = {
    submitted: 'blue',
    under_review: 'yellow',
    assigned: 'purple',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'gray',
    rejected: 'red'
  };
  return colors[this.status] || 'gray';
};

// Static method to get requests by farmer
tappingRequestSchema.statics.getByFarmer = function(farmerId) {
  return this.find({ farmerId }).sort({ submittedAt: -1 });
};

// Static method to get pending requests for admin
tappingRequestSchema.statics.getPendingRequests = function() {
  return this.find({ 
    status: { $in: ['submitted', 'under_review'] } 
  }).sort({ urgency: -1, submittedAt: 1 });
};

// Static method to get requests by status
tappingRequestSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ submittedAt: -1 });
};

// Ensure virtual fields are serialized
tappingRequestSchema.set('toJSON', { virtuals: true });
tappingRequestSchema.set('toObject', { virtuals: true });

const TappingRequest = mongoose.model('TappingRequest', tappingRequestSchema, 'tapping_request');

module.exports = TappingRequest;
