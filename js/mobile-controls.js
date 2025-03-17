/**
 * Mobile Controls for Super Mario Bros
 * This file handles touch input for mobile devices
 */

(function() {
  // Check if we're on a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Force mobile controls for testing (set to false in production)
  const forceMobile = true;
  
  // Only initialize mobile controls if on a mobile device or forced
  if (!isMobile && !forceMobile) return;
  
  // Wait for DOM to be fully loaded
  window.addEventListener('DOMContentLoaded', function() {
    console.log("Mobile controls initializing...");
    
    // Get control elements
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');
    const btnRun = document.getElementById('btn-run');
    const btnShoot = document.getElementById('btn-shoot');
    
    if (!btnLeft || !btnRight || !btnJump || !btnRun || !btnShoot) {
      console.error('Mobile controls not found in DOM');
      return;
    }
    
    // Key mapping
    const KEYS = {
      LEFT: 37,  // Left arrow
      RIGHT: 39, // Right arrow
      JUMP: 88,  // X key
      RUN: 90    // Z key
    };
    
    // Track active touches to handle multiple simultaneous button presses
    const activeTouches = {};
    
    // Simple function to set key state directly in the input module
    function setKey(keyName, isPressed) {
      console.log("Setting key:", keyName, isPressed);
      if (window.input && window.input._setKey) {
        window.input._setKey(keyName, isPressed);
      }
    }
    
    // Handle button press
    function buttonDown(button, keyName) {
      button.classList.add('active');
      setKey(keyName, true);
    }
    
    // Handle button release
    function buttonUp(button, keyName) {
      button.classList.remove('active');
      setKey(keyName, false);
    }
    
    // Map buttons to their corresponding keys
    const buttonMap = {
      'btn-left': 'LEFT',
      'btn-right': 'RIGHT',
      'btn-jump': 'JUMP',
      'btn-run': 'RUN',
      'btn-shoot': 'RUN'  // Shoot uses the same key as run
    };
    
    // Add touch event listeners to all control buttons
    document.querySelectorAll('.control-btn').forEach(button => {
      const keyName = buttonMap[button.id];
      if (!keyName) return;
      
      // Touch start
      button.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        activeTouches[touch.identifier] = { button: button, key: keyName };
        buttonDown(button, keyName);
      }, { passive: false });
      
      // Touch end
      button.addEventListener('touchend', function(e) {
        e.preventDefault();
        Array.from(e.changedTouches).forEach(touch => {
          if (activeTouches[touch.identifier] && 
              activeTouches[touch.identifier].button === button) {
            delete activeTouches[touch.identifier];
            buttonUp(button, keyName);
          }
        });
      }, { passive: false });
      
      // Touch cancel
      button.addEventListener('touchcancel', function(e) {
        e.preventDefault();
        Array.from(e.changedTouches).forEach(touch => {
          if (activeTouches[touch.identifier] && 
              activeTouches[touch.identifier].button === button) {
            delete activeTouches[touch.identifier];
            buttonUp(button, keyName);
          }
        });
      }, { passive: false });
    });
    
    // Prevent default touch actions to avoid scrolling
    document.addEventListener('touchmove', function(e) {
      if (e.target.classList.contains('control-btn')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    // Disable zoom on double tap
    document.addEventListener('touchend', function(e) {
      e.preventDefault();
    }, { passive: false });
    
    // Handle orientation changes
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
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', function() {
      setTimeout(checkOrientation, 100);
    });
    
    // Position the canvas in the container
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.querySelector('canvas');
    
    if (canvasContainer && canvas) {
      // Make sure the canvas is in the container
      if (canvas.parentNode !== canvasContainer) {
        canvasContainer.appendChild(canvas);
      }
      
      // Set canvas styles directly
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'contain';
      
      console.log("Canvas positioned in container");
    }
  });
})(); 