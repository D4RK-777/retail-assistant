// Simple test script to verify training functionality
const testTraining = async () => {
  try {
    const response = await fetch('http://localhost:54321/functions/v1/process-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
      },
      body: JSON.stringify({
        sessionId: 'test-session-' + Date.now(),
        type: 'full'
      })
    });
    
    const result = await response.json();
    console.log('Training result:', result);
    
    if (response.ok) {
      console.log('✅ Training completed successfully!');
    } else {
      console.log('❌ Training failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testTraining();