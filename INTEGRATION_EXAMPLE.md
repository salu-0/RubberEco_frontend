# Enhanced Negotiation System Integration Examples

## Overview
This document provides integration examples for the Enhanced Negotiation System, showing how to integrate the new negotiation modals into existing farmer and staff components.

## Key Features Added

### For Staff Negotiation Modal:
- **Farmer's Proposal Display**: Shows the farmer's proposed rate per tree and tree count
- **Editable Fields**: Staff can edit the farmer's proposal to negotiate
- **Counter Proposal**: Staff can submit counter proposals with modified terms
- **Timing Details**: Full timing and scheduling options
- **Negotiation History**: Complete history tracking

### For Farmer Negotiation Modal:
- **Staff Details**: Expandable staff information
- **Counter Proposals**: Submit counter proposals with detailed terms
- **Accept/Reject**: Accept or reject staff proposals
- **Final Agreement**: View finalized agreements

## Integration Examples

### 1. Farmer TapperRequest Component Integration

```javascript
// Add this to your existing TapperRequest.jsx file

import EnhancedNegotiationModal from './EnhancedNegotiationModal';

// Add these state variables to your component
const [showEnhancedNegotiation, setShowEnhancedNegotiation] = useState(false);
const [selectedApplicationForNegotiation, setSelectedApplicationForNegotiation] = useState(null);

// Add this function to handle opening the enhanced negotiation modal
const handleEnhancedNegotiate = (application) => {
  setSelectedApplicationForNegotiation(application);
  setShowEnhancedNegotiation(true);
};

// Add this button to your applications list
<button
  onClick={() => handleEnhancedNegotiate(application)}
  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
>
  <MessageSquare className="h-4 w-4" />
  <span>Enhanced Negotiate</span>
</button>

// Add this modal at the end of your component, before the closing div
<EnhancedNegotiationModal
  isOpen={showEnhancedNegotiation}
  onClose={() => setShowEnhancedNegotiation(false)}
  application={selectedApplicationForNegotiation}
  onUpdate={loadApplications}
/>
```

### 2. Staff AvailableServiceRequests Component Integration

```javascript
// Add this to your existing AvailableServiceRequests.jsx file

import EnhancedStaffNegotiationModal from './EnhancedStaffNegotiationModal';

// Add these state variables to your component
const [showEnhancedNegotiation, setShowEnhancedNegotiation] = useState(false);
const [selectedApplicationForNegotiation, setSelectedApplicationForNegotiation] = useState(null);

// Add this function to handle opening the enhanced negotiation modal
const handleEnhancedNegotiate = (application) => {
  setSelectedApplicationForNegotiation(application);
  setShowEnhancedNegotiation(true);
};

// Add this button to your applications list
<button
  onClick={() => handleEnhancedNegotiate(application)}
  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
>
  <MessageSquare className="h-4 w-4" />
  <span>Enhanced Negotiate</span>
</button>

// Add this modal at the end of your component, before the closing div
<EnhancedStaffNegotiationModal
  isOpen={showEnhancedNegotiation}
  onClose={() => setShowEnhancedNegotiation(false)}
  application={selectedApplicationForNegotiation}
  userRole="staff"
  onUpdate={loadUserApplications}
/>
```

## New Staff Negotiation Features

### Farmer's Proposal Editing
The staff modal now includes a special section that displays the farmer's proposal in editable form fields:

```javascript
// The modal automatically detects if there's a farmer proposal and shows it in a yellow-highlighted section
{farmerProposal && (
  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-yellow-900">Farmer's Proposal</h3>
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="text-yellow-700 hover:text-yellow-800 text-sm font-medium flex items-center space-x-1"
      >
        <Edit3 className="h-4 w-4" />
        <span>{isEditing ? 'Cancel Edit' : 'Edit Proposal'}</span>
      </button>
    </div>
    
    {/* Editable rate and tree count fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium text-yellow-800 mb-2">
          Farmer's Proposed Rate (₹ per tree)
        </label>
        <input
          type="number"
          value={isEditing ? proposedRate : (farmerProposal.proposedRate || 0)}
          onChange={(e) => setProposedRate(e.target.value)}
          disabled={!isEditing}
          className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg ${
            isEditing ? 'bg-white' : 'bg-gray-100'
          }`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-yellow-800 mb-2">
          Farmer's Proposed Tree Count
        </label>
        <input
          type="number"
          value={isEditing ? proposedTreeCount : (farmerProposal.proposedTreeCount || 0)}
          onChange={(e) => setProposedTreeCount(e.target.value)}
          disabled={!isEditing}
          className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg ${
            isEditing ? 'bg-white' : 'bg-gray-100'
          }`}
        />
      </div>
    </div>
    
    {/* Timing details and other fields */}
    {/* ... */}
  </div>
)}
```

### Key Benefits for Staff:
1. **See Farmer's Proposal**: Staff can view the farmer's exact proposed rate and tree count
2. **Edit and Negotiate**: Staff can modify the farmer's proposal and submit counter proposals
3. **Timing Flexibility**: Full control over timing and scheduling details
4. **Clear Communication**: Add notes explaining the counter proposal
5. **History Tracking**: See all negotiation interactions

### Key Benefits for Farmers:
1. **Staff Information**: Access detailed staff profiles and contact information
2. **Counter Proposals**: Submit counter proposals with modified terms
3. **Accept/Reject**: Accept suitable proposals or reject and counter
4. **Transparency**: See all negotiation details and history
5. **Final Agreement**: Clear view of finalized agreements

## Usage Workflow

### Staff Workflow:
1. **View Farmer's Proposal**: See the farmer's proposed rate and tree count
2. **Edit Proposal**: Click "Edit Proposal" to modify the terms
3. **Submit Counter**: Submit counter proposal with modified terms
4. **Negotiate**: Continue negotiation until agreement
5. **Accept/Reject**: Accept farmer proposals or reject and counter

### Farmer Workflow:
1. **View Applications**: See all staff applications for your request
2. **Review Staff Details**: Click "Show Details" to see staff information
3. **Submit Counter Proposal**: If staff proposal needs adjustment
4. **Accept/Reject**: Accept suitable proposals or reject unsuitable ones
5. **Monitor Progress**: Track negotiation history and status

## API Endpoints Used

The modals use these API endpoints:
- `GET /api/service-applications/:applicationId/negotiation` - Get negotiation details
- `POST /api/service-applications/:applicationId/propose` - Submit initial proposal
- `POST /api/service-applications/:applicationId/counter-propose` - Submit counter proposal
- `POST /api/service-applications/:applicationId/accept` - Accept proposal
- `POST /api/service-applications/:applicationId/reject` - Reject proposal

## Data Structure

The negotiation data includes:
- **Rate per tree**: Numeric value in rupees
- **Tree count**: Number of trees to be tapped
- **Timing details**: Start date, end date, time slots, working days, duration
- **Notes**: Additional comments and explanations
- **Status**: submitted, negotiating, agreed, rejected
- **History**: Complete negotiation history with timestamps

## Troubleshooting

### Common Issues:
1. **Modal not opening**: Check if application data is properly passed
2. **API errors**: Verify authentication and permissions
3. **Data not loading**: Check network connectivity and API endpoints
4. **Form validation**: Ensure all required fields are filled

### Debug Tips:
1. Check browser console for errors
2. Verify API responses in Network tab
3. Confirm user permissions and roles
4. Validate data structure matches schema
