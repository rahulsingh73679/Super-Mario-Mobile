var requestAnimFrame = (function(){
  return window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();

//create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext('2d');
var updateables = [];
var fireballs = [];
var player = new Mario.Player([0,0]);

// Check if we're on a mobile device
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//we might have to get the size and calculate the scaling
//but this method should let us make it however big.
//Cool!
//TODO: Automatically scale the game to work and look good on widescreen.
//TODO: fiddling with scaled sprites looks BETTER, but not perfect. Hmm.
canvas.width = 762;
canvas.height = 720;
ctx.scale(3,3);
document.body.appendChild(canvas);

// Add mobile-friendly canvas attributes
if (isMobile) {
  // Optimize for landscape mode
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.maxHeight = '80vh';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.position = 'relative';
  canvas.style.top = '0';
  
  // Add touch-action none to prevent browser handling of touch events
  canvas.style.touchAction = 'none';
  
  // Add the canvas to the game container instead of body
  document.body.removeChild(canvas);
  
  // Wait for DOM to be fully loaded
  function addCanvasToContainer() {
    var gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.insertBefore(canvas, gameContainer.firstChild);
      
      // Set up resize handler
      function resizeCanvas() {
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var controlsHeight = 60; // Approximate height of controls
        
        // Calculate available height for canvas
        var availableHeight = windowHeight - controlsHeight;
        
        // Calculate dimensions maintaining aspect ratio
        var aspectRatio = canvas.width / canvas.height;
        var newWidth, newHeight;
        
        if (windowWidth / availableHeight > aspectRatio) {
          // Width is the limiting factor
          newHeight = availableHeight * 0.9; // 90% of available height
          newWidth = newHeight * aspectRatio;
        } else {
          // Height is the limiting factor
          newWidth = windowWidth * 0.95; // 95% of window width
          newHeight = newWidth / aspectRatio;
        }
        
        // Apply new dimensions
        canvas.style.width = newWidth + 'px';
        canvas.style.height = newHeight + 'px';
      }
      
      // Initial resize and add event listeners
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      window.addEventListener('orientationchange', resizeCanvas);
    } else {
      // If container not found yet, try again in a moment
      setTimeout(addCanvasToContainer, 100);
    }
  }
  
  // Start the process of adding canvas to container
  addCanvasToContainer();
}

//viewport
var vX = 0,
    vY = 0,
    vWidth = 256,
    vHeight = 240;

//load our images
resources.load([
  'sprites/player.png',
  'sprites/enemy.png',
  'sprites/tiles.png',
  'sprites/playerl.png',
  'sprites/items.png',
  'sprites/enemyr.png',
]);

resources.onReady(init);
var level;
var sounds;
var music;

//initialize
var lastTime;
function init() {
  music = {
    overworld: new Audio('sounds/aboveground_bgm.ogg'),
    underground: new Audio('sounds/underground_bgm.ogg'),
    clear: new Audio('sounds/stage_clear.wav'),
    death: new Audio('sounds/mariodie.wav')
  };
  sounds = {
    smallJump: new Audio('sounds/jump-small.wav'),
    bigJump: new Audio('sounds/jump-super.wav'),
    breakBlock: new Audio('sounds/breakblock.wav'),
    bump: new Audio('sounds/bump.wav'),
    coin: new Audio('sounds/coin.wav'),
    fireball: new Audio('sounds/fireball.wav'),
    flagpole: new Audio('sounds/flagpole.wav'),
    kick: new Audio('sounds/kick.wav'),
    pipe: new Audio('sounds/pipe.wav'),
    itemAppear: new Audio('sounds/itemAppear.wav'),
    powerup: new Audio('sounds/powerup.wav'),
    stomp: new Audio('sounds/stomp.wav')
  };
  
  // Initialize audio for mobile (needs user interaction)
  if (isMobile) {
    // Preload and set up audio for mobile
    Object.values(music).forEach(audio => {
      audio.load();
      audio.volume = 0.7;
    });
    
    Object.values(sounds).forEach(audio => {
      audio.load();
      audio.volume = 0.7;
    });
    
    // Add touch event to start audio
    document.addEventListener('touchstart', function initAudio() {
      // Play and immediately pause to enable audio
      music.overworld.play().then(() => {
        music.overworld.pause();
        music.overworld.currentTime = 0;
        
        // Start the game music after user interaction
        setTimeout(() => {
          music.overworld.play().catch(e => console.log("Audio play failed:", e));
        }, 1000);
      }).catch(e => console.log("Audio play failed:", e));
      
      // Remove the event listener after first touch
      document.removeEventListener('touchstart', initAudio);
    }, { once: true });
    
    // Handle visibility changes for audio
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // Pause all audio when game is not visible
        Object.values(music).forEach(audio => {
          if (!audio.paused) audio.pause();
        });
      } else {
        // Resume music when game becomes visible again
        if (music.overworld.paused && gameTime > 0) {
          music.overworld.play().catch(e => console.log("Audio resume failed:", e));
        }
      }
    });
  }
  
  Mario.oneone();
  lastTime = Date.now();
  main();
  
  // For mobile: check orientation on init
  if (isMobile) {
    checkOrientation();
  }
}

// Function to check and handle orientation for mobile
function checkOrientation() {
  if (!isMobile) return;
  
  const orientationMessage = document.querySelector('.orientation-message');
  const gameContainer = document.querySelector('.game-container');
  
  if (window.innerWidth < window.innerHeight) {
    // Portrait mode
    if (orientationMessage) orientationMessage.style.display = 'flex';
    if (gameContainer) gameContainer.style.display = 'none';
    
    // Pause game in portrait mode
    if (music && music.overworld && !music.overworld.paused) {
      music.overworld.pause();
    }
  } else {
    // Landscape mode
    if (orientationMessage) orientationMessage.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'block';
    
    // Resume game in landscape mode
    if (music && music.overworld && music.overworld.paused && gameTime > 0) {
      music.overworld.play().catch(e => {});
    }
  }
}

var gameTime = 0;

//set up the game loop
function main() {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt);
  render();

  lastTime = now;
  requestAnimFrame(main);
}

function update(dt) {
  gameTime += dt;

  handleInput(dt);
  updateEntities(dt, gameTime);

  checkCollisions();
}

function handleInput(dt) {
  if (player.piping || player.dying || player.noInput) return; //don't accept input

  if (input.isDown('RUN')){
    player.run();
  } else {
    player.noRun();
  }
  if (input.isDown('JUMP')) {
    player.jump();
  } else {
    //we need this to handle the timing for how long you hold it
    player.noJump();
  }

  if (input.isDown('DOWN')) {
    player.crouch();
  } else {
    player.noCrouch();
  }

  if (input.isDown('LEFT')) { // 'd' or left arrow
    player.moveLeft();
  }
  else if (input.isDown('RIGHT')) { // 'k' or right arrow
    player.moveRight();
  } else {
    player.noWalk();
  }
}

//update all the moving stuff
function updateEntities(dt, gameTime) {
  player.update(dt, vX);
  updateables.forEach (function(ent) {
    ent.update(dt, gameTime);
  });

  //This should stop the jump when he switches sides on the flag.
  if (player.exiting) {
    if (player.pos[0] > vX + 96)
      vX = player.pos[0] - 96
  }else if (level.scrolling && player.pos[0] > vX + 80) {
    vX = player.pos[0] - 80;
  }

  if (player.powering.length !== 0 || player.dying) { return; }
  level.items.forEach (function(ent) {
    ent.update(dt);
  });

  level.enemies.forEach (function(ent) {
    ent.update(dt, vX);
  });

  fireballs.forEach(function(fireball) {
    fireball.update(dt);
  });
  level.pipes.forEach (function(pipe) {
    pipe.update(dt);
  });
}

//scan for collisions
function checkCollisions() {
  if (player.powering.length !== 0 || player.dying) { return; }
  player.checkCollisions();

  //Apparently for each will just skip indices where things were deleted.
  level.items.forEach(function(item) {
    item.checkCollisions();
  });
  level.enemies.forEach (function(ent) {
    ent.checkCollisions();
  });
  fireballs.forEach(function(fireball){
    fireball.checkCollisions();
  });
  level.pipes.forEach (function(pipe) {
    pipe.checkCollisions();
  });
}

//draw the game!
function render() {
  updateables = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = level.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //scenery gets drawn first to get layering right.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (level.scenery[i][j]) {
        renderEntity(level.scenery[i][j]);
      }
    }
  }

  //then items
  level.items.forEach (function (item) {
    renderEntity(item);
  });

  level.enemies.forEach (function(enemy) {
    renderEntity(enemy);
  });



  fireballs.forEach(function(fireball) {
    renderEntity(fireball);
  })

  //then we draw every static object.
  for(var i = 0; i < 15; i++) {
    for (var j = Math.floor(vX / 16) - 1; j < Math.floor(vX / 16) + 20; j++){
      if (level.statics[i][j]) {
        renderEntity(level.statics[i][j]);
      }
      if (level.blocks[i][j]) {
        renderEntity(level.blocks[i][j]);
        updateables.push(level.blocks[i][j]);
      }
    }
  }

  //then the player
  if (player.invincibility % 2 === 0) {
    renderEntity(player);
  }

  //Mario goes INTO pipes, so naturally they go after.
  level.pipes.forEach (function(pipe) {
    renderEntity(pipe);
  });
}

function renderEntity(entity) {
  entity.render(ctx, vX, vY);
}
