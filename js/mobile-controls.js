/**
 * Mobile Controls for Super Mario Bros
 * This file handles touch input for mobile devices
 */

(function() {
  // Check if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Only initialize mobile controls if on a mobile device
  if (!isMobile) return;
  
  // Get control elements
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');
  const btnJump = document.getElementById('btn-jump');
  const btnRun = document.getElementById('btn-run');
  
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
  
  // Disable zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
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
    }
  });
})(); 