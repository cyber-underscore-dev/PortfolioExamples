var canvas = document.querySelector('.fireworks'),
    ctx = canvas.getContext('2d'),
    
    // full screen dimension
    canvasWidth = window.innerWidth,
    canvasHeight = window.innerHeight,
    
    // particle object arrays
    fireworks = [],
    particles = [],
    smokePuffs = [],
    
    maxSmokeVelocity = 1,
    
    hue = 120,
    
    
    // use this to limit to one launch per 5 loop ticks.
    limiterTotal = 5,
    limiterTick = 0,
    
    // also need to time auto launches of fireworks
    // to see one launch per 80 loop ticks.
    timerTotal = 80,
    timerTick = 0,

    mouseDown = false,
    mouseXPosition,
    mouseYPosition,
    
    smokeImage = new Image();

// Preload the smoke image
smokeImage.src = 'smokeImages/smoke.png';

// Set canvas dimensions to match the dimensions
// of browser's inner window (viewport).
canvas.width = canvasWidth;
canvas.height = canvasHeight;

//
// Helper functions
//
function randRange(min, max) {
    return Math.random() * (max - min) + min;
}


// Calculate the distance between two given points
function calculateDistance(point1X, point1Y, point2X, point2Y) {
    
    var xDistance = point1X - point2X,
        yDistance = point1Y - point2Y;
    
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    
}


//
// Create a Firework particle class constructor function
//
function Firework(startX, startY, targetX, targetY) {
    
    this.x = startX;
    this.y = startY;
    
    this.startX = startX;
    this.startY = startY;
    
    this.targetX = targetX;
    this.targetY = targetY;
    
    // distance between starting and ending points
    this.distanceToTarget = calculateDistance(startX, startY, targetX, targetY);
    
    this.distanceTraveled = 0;
    
    // Track the coordinates of where the Firework
    // particle has been as it is flying toward the 
    // target so we can create a trail effect.
    this.coordinates = [];
    this.coordinateCount = 5;
    
    // Populate the initial coordinates collection
    // with the current coordinates of the Firework particle.
    while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    
    this.angle = Math.atan2(targetY - startY, targetX - startX);
    
    this.speed = 2;
    
    this.acceleration = 1.05;
    
    this.brightness = randRange(50, 70);
    
    // circle target indicator radius
    this.targetRadius = 1;
    
}


//
// Draw the Firework particle - method of the Firework class
//
Firework.prototype.draw = function() {
    
    ctx.beginPath();
    
    // Move to the last tracked coordinate (last element)
    // in this.coordinates array property.
    ctx.moveTo(this.coordinates[this.coordinates.length-1][0], this.coordinates[this.coordinates.length-1][1]);
    
    // specify the ending point of the line to be drawn
    ctx.lineTo(this.x, this.y);
    
    // ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
    
     ctx.strokeStyle = 'hsl(10, 0%, 28%)';
    
    ctx.stroke();   // draw the line
    
    // Draw the pulsing circle for this firework's target
    ctx.beginPath();
    ctx.arc(this.targetX, this.targetY, this.targetRadius, 0, Math.PI * 2);
    ctx.stroke();
    
}


//
// Update (animate) the Firework particle
//
Firework.prototype.update = function(index) {
    
    // Remove the last element in the coordinates array property
    this.coordinates.pop();
    
    // Now, add the point the firework is now at to the beginning of the coordinates property (insert)
    this.coordinates.unshift([this.x, this.y]);
    
    // Make the target circle pulsate by adjusting its radius
    if (this.targetRadius < 8) {
        this.targetRadius += .3;
    } else {
        this.targetRadius = 1;
    }
    
    // speed up the firework
    this.speed *= this.acceleration;
    
    // Calculate the current velocities based on angle and speed
    var velocityX = Math.cos(this.angle) * this.speed,
        velocityY = Math.sin(this.angle) * this.speed;
    
    this.distanceTraveled = calculateDistance(this.startX, this.startY, this.x + velocityX, this.y + velocityY);
    
    // If the distance traveled, including velocities is greater than the initial distance to target, then the target is reached
    if (this.distanceTraveled >= this.distanceToTarget) {
        
        createExplosion(this.targetX, this.targetY);
        
        // create smoke (another particle)
        createSmoke(this.targetX, this.targetY);
        
        
        // Cleanup firework particle by removing it from the array
        fireworks.splice(index, 1);
        
    } else { 
        
        this.x += velocityX;
        this.y += velocityY;
        
    }
    
}


// Create Explosion Paticles


function createExplosion(x, y) {

    var particleCount = 80;
    
    while (particleCount--) {
        particles.push(new ExplosionParticle(x, y));
    }
    
}

// ExplosionParticle Constructor function
function ExplosionParticle(x, y) {
    
    this.x = x;
    this.y = y;
    
    // Track the past coordinates of each explosion particle to create a trail effect
    this.coordinates = [];
    this.coordinateCount = Math.round(randRange(10, 20));
    
    // populate the initial coordinate collection with the current coordinates
    while (this.coordinateCount--) {
        this.coordinates.push([this.x, this.y]);
    }
    
    this.angle = randRange(0, Math.PI*2);
    
    this.speed = randRange(1, 10);
    
    this.friction = .95;
    
    this.gravity = 1;
    
    this.hue = randRange(hue - 20, hue + 20);
    this.brightness = randRange(50, 80);
    this.alpha = 1;
    
    this.decay = randRange(.003, .006);
}


// Draw the Explosion Particle
ExplosionParticle.prototype.draw = function() {
    
    ctx.beginPath();
    
    // Move to the last tracked coordinate (last element) in the this.coordinates array
    // and the draw a curve to the current x,y coordinate
    ctx.moveTo(this.coordinates[this.coordinates.length-1][0], this.coordinates[this.coordinates.length-1][1]);
    
    // Now, specify the curve to be drawn
    ctx.quadraticCurveTo(this.x + 1, this.y - Math.round(randRange(5, 10)), this.x, this.y);
    
    ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
    
    // Do the drawing
    ctx.stroke(); 
}


// Update (animate) the Explosion particle
ExplosionParticle.prototype.update = function(index) {
    
    // Remove the last element in the coordinates array property
    this.coordinates.pop();
    
    // Insert the current location
    this.coordinates.unshift([this.x, this.y]);
    
    // Slow down the explosion particle slightly
    this.speed *= this.friction;
    
    // Calculate the current velocities based on angle and speed to reset the current particle location
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    
    this.alpha -= this.decay;
    
    if (this.alpha <= this.decay) {
        particles.splice(index, 1); // Remove this particle
    }
    
}

// Create smoke for the explosion
function createSmoke(x, y) {
    
    var puffCount = 1;
    
    for (var i = 0; i < puffCount; i++) {
        smokePuffs.push(new SmokeParticle(x, y));
    }
    
}


// SmokeParticle constructor function
function SmokeParticle(x, y) {
    
    this.x = randRange(x - 25, x + 25);
    this.y = randRange(y - 15, y + 15);
    
    this.xVelocity = randRange(.2, maxSmokeVelocity);
    this.yVelocity = randRange(-.1, -maxSmokeVelocity);
    
    this.alpha = 1;
    
}

SmokeParticle.prototype.draw = function() {
    
    if(smokeImage) {
        
        // draw the smoke image on the canvas
        ctx.save();
        
        ctx.globalAlpha = 0.3;
        
        ctx.drawImage(smokeImage, this.x - smokeImage.width/2, this.y - smokeImage.height/2);
        
        ctx.restore();
        
    }
    
}


SmokeParticle.prototype.update = function(index) {
    
    this.x += this.xVelocity;
    this.y += this.yVelocity;
    
    this.alpha -= .01;
    
    if (this.alpha <= 0) {
        smokePuffs.splice(index, 1);
    }
    
}


//
// heartBeat will be called framerate times per second
//
function heartBeat() {
    
    // Call this function recursively framerate times per second
    requestAnimationFrame(heartBeat);
    
    // increase the hue value slightly to get different
    // firework colors over time.
    
    
        hue += randRange(0.5, 360);
     // hue += 0.5;
    
    
    ctx.globalCompositeOperation = 'destination-out';
    
    // Note: Decrease the alpha value to create more 
    //       prominent trails.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.globalCompositeOperation = 'lighter';
    
    
    // Loop over each Firework particle, draw it, and animate it
    var i = fireworks.length;
    
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    
    
    // Loop over each Explosion particle, draw it, and animate it
    var i = particles.length;
    
    while (i--) {
        particles[i].draw();
        particles[i].update(i);
    }
    
    
    // Loop over each Smoke particle, draw it, and animate it
    var i = smokePuffs.length;
    
    while (i--) {
        smokePuffs[i].draw();
        smokePuffs[i].update(i);
    }
    
    
    // Launch firework automatically to random target coordinates
    // when the mouse is not pressed down.
    if (timerTick >= timerTotal) {
        
        if (!mouseDown) {   // if mouse is not pressed down
            
            // launch a firework particle from bottom-middle
            // of screen (ground), then set random target 
            // coordinates.  Note: target y-position should 
            // always be in top half of screen - safety is important!
            fireworks.push(new Firework(canvasWidth/2, canvasHeight, randRange(0, canvasWidth), randRange(0, canvasHeight/2)));
            
            timerTick = 0;
            
        }
        
    } else {
        timerTick++;
    }
    
    
    // Limit the rate at which fireworks get launched when user presses mouse down over canvas
    
    if (limiterTick >= limiterTotal) {
        
        if (mouseDown) {   // if mouse is not pressed down
            
            // launch a firework particle from bottom-middle
            // of screen (ground), then set random target 
            // coordinates. 
            fireworks.push(new Firework(canvasWidth/2, canvasHeight, mouseXPosition, mouseYPosition));
            
            limiterTick = 0;
            
        }
        
    } else {
        limiterTick++;
    }
    
}


canvas.addEventListener('mousemove', function(e) {
    
    mouseXPosition = e.pageX - canvas.offsetLeft;
    mouseYPosition = e.pageY - canvas.offsetTop;
    
});

canvas.addEventListener('mousedown', function(e) {
    
    e.preventDefault();
    mouseDown = true;
    
});


canvas.addEventListener('mouseup', function(e) {
    
    e.preventDefault();
    mouseDown = false;
    
});


window.onload = heartBeat;





