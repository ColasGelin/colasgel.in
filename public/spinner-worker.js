let isSpinning = true;
let currentRotation = 0;
let speed = 2;
let targetPosition = 315;
let animationId;

function animate() {
  if (isSpinning) {
    currentRotation = (currentRotation + speed) % 360;
  } else {
    // Stop logic would go here if needed
  }
  
  // Send rotation update to main thread
  self.postMessage({
    type: 'rotation-update',
    rotation: currentRotation
  });
  
  // Continue animation
  setTimeout(() => {
    animate();
  }, 16); // ~60fps
}

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'start':
      isSpinning = true;
      speed = data.speed || 2;
      animate();
      break;
    case 'stop':
      isSpinning = false;
      targetPosition = data.targetPosition || 315;
      break;
    case 'update-speed':
      speed = data.speed;
      break;
  }
};
