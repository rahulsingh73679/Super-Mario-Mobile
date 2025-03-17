/**
 * Mobile Controls for Super Mario Bros
 * This file handles touch input for mobile devices
 */

(function() {
  // Check if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Only initialize mobile controls if on a mobile device
  if (!isMobile) return;
  
  // Force landscape orientation if possible
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(function(error) {
      console.log('Orientation lock failed: ' + error);
    });
  }
  
  // Get control elements
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnJump = document.getElementById('btn-jump');
  const btnRun = document.getElementById('btn-run');
  const btnShoot = document.getElementById('btn-shoot');
  
  // Function to simulate key press/release
  function simulateKey(keyCode, isPressed) {
    const event = new KeyboardEvent(isPressed ? 'keydown' : 'keyup', {
      keyCode: keyCode,
      which: keyCode,
      bubbles: true
    });
    document.dispatchEvent(event);
  }
  
  // Key codes
  const KEY_LEFT = 37;  // Left arrow
  const KEY_RIGHT = 39; // Right arrow
  const KEY_X = 74;     // X key (Jump)
  const KEY_Z = 90;     // Z key (Run)
  const KEY_S = 83;     // S key (Shoot - same as Run for fireball)
  
  // Touch event handlers for left button
  btnLeft.addEventListener('touchstart', function(e) {
    e.preventDefault();
    simulateKey(KEY_LEFT, true);
  });
  
  btnLeft.addEventListener('touchend', function(e) {
    e.preventDefault();
    simulateKey(KEY_LEFT, false);
  });
  
  // Touch event handlers for right button
  btnRight.addEventListener('touchstart', function(e) {
    e.preventDefault();
    simulateKey(KEY_RIGHT, true);
  });
  
  btnRight.addEventListener('touchend', function(e) {
    e.preventDefault();
    simulateKey(KEY_RIGHT, false);
  });
  
  // Touch event handlers for jump button
  btnJump.addEventListener('touchstart', function(e) {
    e.preventDefault();
    simulateKey(KEY_X, true);
  });
  
  btnJump.addEventListener('touchend', function(e) {
    e.preventDefault();
    simulateKey(KEY_X, false);
  });
  
  // Touch event handlers for run button
  btnRun.addEventListener('touchstart', function(e) {
    e.preventDefault();
    simulateKey(KEY_Z, true);
  });
  
  btnRun.addEventListener('touchend', function(e) {
    e.preventDefault();
    simulateKey(KEY_Z, false);
  });
  
  // Touch event handlers for shoot button (same as run but dedicated for shooting)
  btnShoot.addEventListener('touchstart', function(e) {
    e.preventDefault();
    simulateKey(KEY_Z, true); // Use the same key as run since that's how the game handles shooting
  });
  
  btnShoot.addEventListener('touchend', function(e) {
    e.preventDefault();
    simulateKey(KEY_Z, false);
  });
  
  // Prevent default touch actions to avoid scrolling
  document.addEventListener('touchmove', function(e) {
    if (e.target.classList.contains('control-btn')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Handle touch leaving the button
  function handleTouchLeave(button, keyCode) {
    button.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      simulateKey(keyCode, false);
    });
    
    // Also handle the case when touch moves out of the button
    button.addEventListener('touchmove', function(e) {
      const touch = e.touches[0];
      const buttonRect = button.getBoundingClientRect();
      
      if (touch.clientX < buttonRect.left || 
          touch.clientX > buttonRect.right || 
          touch.clientY < buttonRect.top || 
          touch.clientY > buttonRect.bottom) {
        simulateKey(keyCode, false);
      }
    });
  }
  
  // Apply touch leave handlers
  handleTouchLeave(btnLeft, KEY_LEFT);
  handleTouchLeave(btnRight, KEY_RIGHT);
  handleTouchLeave(btnJump, KEY_X);
  handleTouchLeave(btnRun, KEY_Z);
  handleTouchLeave(btnShoot, KEY_Z);
  
  // Disable zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Check and handle orientation changes
  function checkOrientation() {
    const orientationMessage = document.querySelector('.orientation-message');
    const gameContainer = document.querySelector('.game-container');
    
    if (window.innerWidth < window.innerHeight) {
      // Portrait mode
      if (orientationMessage) orientationMessage.style.display = 'flex';
      if (gameContainer) gameContainer.style.display = 'none';
    } else {
      // Landscape mode
      if (orientationMessage) orientationMessage.style.display = 'none';
      if (gameContainer) gameContainer.style.display = 'block';
    }
  }
  
  // Check orientation on load and when orientation changes
  window.addEventListener('load', checkOrientation);
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);
  
  // Adjust game canvas for mobile
  window.addEventListener('DOMContentLoaded', function() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Make sure the canvas is properly sized for mobile
      function resizeCanvas() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight * 0.8; // Leave room for controls
        
        // Maintain aspect ratio
        const aspectRatio = canvas.width / canvas.height;
        let newWidth, newHeight;
        
        if (windowWidth / windowHeight > aspectRatio) {
          newHeight = windowHeight;
          newWidth = newHeight * aspectRatio;
        } else {
          newWidth = windowWidth;
          newHeight = newWidth / aspectRatio;
        }
        
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
      }
      
      // Resize on load and window resize
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      window.addEventListener('orientationchange', resizeCanvas);
    }
  });
})(); 