import React from 'react';
import TawkMessenger from '@tawk.to/tawk-messenger-react';

function TawkComponent() {
  return (
    <div>
      {/* Your landing page content */}

      {/* Tawk.to Widget - Place it at the end */}
      <TawkMessenger
        propertyId="6a466c6b9310bd1d4ef8c483"     // e.g., 66f8c8c3f4b4a8e0c8e0c123
        widgetId="1jshhf2u7"         // e.g., default
        // Optional props for better UX
        onLoad={() => console.log('Tawk.to widget loaded')}
        onStatusChange={(status) => console.log('Chat status:', status)}
      />
    </div>
  );
}

export default TawkComponent;