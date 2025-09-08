# Enhanced Negotiation System for RubberEco

## Overview

The Enhanced Negotiation System provides a comprehensive platform for farmers and staff to negotiate tapping service requests with detailed timing, pricing, and tree count specifications. This system enables transparent communication and agreement between parties.

## Features

### For Farmers
- **View Staff Applications**: See all staff who have applied for your tapping request
- **Staff Details**: Access comprehensive information about each staff applicant
- **Counter Proposals**: Submit counter proposals with detailed timing and pricing
- **Accept/Reject**: Accept or reject staff proposals
- **Negotiation History**: Track all negotiation interactions
- **Final Agreement**: View finalized agreements with all details

### For Staff
- **Initial Proposals**: Submit detailed initial proposals with timing and pricing
- **Counter Proposals**: Respond to farmer counter proposals
- **Farmer Information**: View farmer and farm details
- **Negotiation Tracking**: Monitor negotiation progress
- **Agreement Finalization**: Accept or reject farmer proposals

## Components

### 1. EnhancedNegotiationModal (Farmer)
**Location**: `RubberEco/src/components/Farmer/EnhancedNegotiationModal.jsx`

**Features**:
- Staff applicant details with expandable information
- Counter proposal form with timing details
- Accept/reject functionality
- Negotiation history display
- Final agreement summary

**Key Functions**:
- `handleSubmitCounterProposal()`: Submit counter proposals
- `handleAcceptProposal()`: Accept staff proposals
- `handleRejectProposal()`: Reject staff proposals
- `loadNegotiationDetails()`: Load negotiation data

### 2. EnhancedStaffNegotiationModal (Staff)
**Location**: `RubberEco/src/components/Staff/EnhancedStaffNegotiationModal.jsx`

**Features**:
- Farmer request details
- Initial and counter proposal forms
- Timing and scheduling options
- Negotiation history
- Agreement finalization

**Key Functions**:
- `handleSubmitProposal()`: Submit initial or counter proposals
- `handleAcceptProposal()`: Accept farmer proposals
- `handleRejectProposal()`: Reject farmer proposals

## Data Structure

### Negotiation Schema
```javascript
negotiation: {
  initialProposal: {
    proposedRate: Number,
    proposedTreeCount: Number,
    proposedTiming: {
      startDate: String,
      endDate: String,
      preferredTimeSlots: [String],
      workingDays: [String],
      estimatedDuration: String
    },
    notes: String,
    proposedAt: Date
  },
  currentProposal: {
    // Same structure as initialProposal
  },
  history: [{
    // Same structure with additional status field
    status: 'pending' | 'accepted' | 'rejected' | 'countered'
  }],
  finalAgreement: {
    agreedRate: Number,
    agreedTreeCount: Number,
    agreedTiming: {
      // Same timing structure
    },
    agreedAt: Date,
    agreedBy: {
      staff: Boolean,
      farmer: Boolean
    }
  }
}
```

## API Endpoints

### 1. Submit Initial Proposal
```
POST /api/service-applications/:applicationId/propose
```
**Body**:
```json
{
  "proposedRate": 50,
  "proposedTreeCount": 100,
  "proposedTiming": {
    "startDate": "2024-01-15",
    "endDate": "2024-02-15",
    "preferredTimeSlots": ["morning", "afternoon"],
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "estimatedDuration": "30"
  },
  "notes": "I can start immediately and work flexible hours"
}
```

### 2. Submit Counter Proposal
```
POST /api/service-applications/:applicationId/counter-propose
```
**Body**:
```json
{
  "proposedRate": 45,
  "proposedTreeCount": 95,
  "proposedTiming": {
    "startDate": "2024-01-20",
    "endDate": "2024-02-10",
    "preferredTimeSlots": ["early_morning", "morning"],
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    "estimatedDuration": "20"
  },
  "notes": "I can work more days but need slightly higher rate",
  "proposedBy": "farmer"
}
```

### 3. Accept Proposal
```
POST /api/service-applications/:applicationId/accept
```
**Body**:
```json
{
  "acceptedBy": "farmer"
}
```

### 4. Reject Proposal
```
POST /api/service-applications/:applicationId/reject
```
**Body**:
```json
{
  "rejectedBy": "farmer"
}
```

### 5. Get Negotiation Details
```
GET /api/service-applications/:applicationId/negotiation
```

## Usage Examples

### Farmer Workflow
1. **View Applications**: Farmer sees staff applications for their request
2. **Review Staff Details**: Click "Show Details" to see staff information
3. **Submit Counter Proposal**: If staff proposal needs adjustment
4. **Accept/Reject**: Accept suitable proposals or reject unsuitable ones
5. **Monitor Progress**: Track negotiation history and status

### Staff Workflow
1. **Submit Initial Proposal**: Provide detailed proposal with timing
2. **Respond to Counter**: Submit counter proposals if needed
3. **Accept/Reject**: Accept farmer proposals or reject and counter
4. **Finalize Agreement**: Both parties agree on final terms

## Timing Options

### Time Slots
- `early_morning`: 5:00 AM - 8:00 AM
- `morning`: 8:00 AM - 12:00 PM
- `afternoon`: 12:00 PM - 4:00 PM
- `evening`: 4:00 PM - 7:00 PM

### Working Days
- `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`

## Status Flow

1. **submitted**: Initial application submitted
2. **negotiating**: Active negotiation in progress
3. **agreed**: Both parties have agreed
4. **rejected**: Proposal was rejected

## Integration

### In Farmer Dashboard
```javascript
import EnhancedNegotiationModal from '../components/Farmer/EnhancedNegotiationModal';

// In your component
const [showNegotiation, setShowNegotiation] = useState(false);
const [selectedApplication, setSelectedApplication] = useState(null);

// Open negotiation modal
const handleNegotiate = (application) => {
  setSelectedApplication(application);
  setShowNegotiation(true);
};

// Render modal
<EnhancedNegotiationModal
  isOpen={showNegotiation}
  onClose={() => setShowNegotiation(false)}
  application={selectedApplication}
  onUpdate={loadApplications}
/>
```

### In Staff Dashboard
```javascript
import EnhancedStaffNegotiationModal from '../components/Staff/EnhancedStaffNegotiationModal';

// In your component
const [showNegotiation, setShowNegotiation] = useState(false);
const [selectedApplication, setSelectedApplication] = useState(null);

// Open negotiation modal
const handleNegotiate = (application) => {
  setSelectedApplication(application);
  setShowNegotiation(true);
};

// Render modal
<EnhancedStaffNegotiationModal
  isOpen={showNegotiation}
  onClose={() => setShowNegotiation(false)}
  application={selectedApplication}
  userRole="staff"
  onUpdate={loadApplications}
/>
```

## Benefits

1. **Transparency**: Both parties can see all negotiation details
2. **Flexibility**: Comprehensive timing and pricing options
3. **Tracking**: Complete history of all negotiations
4. **Efficiency**: Streamlined agreement process
5. **Communication**: Clear notes and explanations
6. **Staff Information**: Farmers can access detailed staff profiles

## Future Enhancements

1. **Real-time Notifications**: Push notifications for new proposals
2. **Document Upload**: Support for additional documents
3. **Rating System**: Post-agreement ratings and reviews
4. **Escalation**: Admin intervention for disputes
5. **Analytics**: Negotiation success metrics
6. **Mobile Optimization**: Enhanced mobile experience

## Troubleshooting

### Common Issues

1. **Modal Not Opening**: Check if application data is properly passed
2. **API Errors**: Verify authentication and permissions
3. **Data Not Loading**: Check network connectivity and API endpoints
4. **Form Validation**: Ensure all required fields are filled

### Debug Tips

1. Check browser console for errors
2. Verify API responses in Network tab
3. Confirm user permissions and roles
4. Validate data structure matches schema

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
