import React from 'react';

// Example props: request, tapperId, onAccept
function TappingRequestCard({ request, tapperId, onAccept }) {
  const handleAccept = async () => {
    const res = await fetch(`/api/tapping-requests/${request._id}/acceptRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tapperId }),
    });
    const data = await res.json();
    onAccept(data);
  };

  return (
    <div className="tapping-request-card">
      <h3>{request.farmLocation}</h3>
      <p>{request.acceptedTappers} / {request.requiredTappers} tappers accepted</p>
      <p>Status: {request.status}</p>
      {request.status !== 'completed' && !request.tappersAccepted.includes(tapperId) && (
        <button onClick={handleAccept}>Accept Request</button>
      )}
    </div>
  );
}

export default TappingRequestCard;
