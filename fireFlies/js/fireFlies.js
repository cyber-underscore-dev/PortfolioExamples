function init() {
    
    // Get a reference to the canvas element
    canvas = document.querySelector('.fireFlies');
    
    // Get the canvas' context object which is what we'll use to draw on the canvas.
    ctx = canvas.getContext('2d');
    
    // initialize variables
    fireFlies = []; // fireFlies = new Array();
    numFlies = 250;
    angleX = 0;
    angleY = 0;
    range = 1.2;
    xSpeed = .7;
    ySpeed = .1;
    fps = 15;
    
    // Create a batch of particle objects (FireFly)
    // and add each new Firefly object to the fireFlies array
    
    for (var i = 0; i < numFlies; i++) {
        
        xVelocity = randRange(-4, 2);
        yVelocity = randRange(-4, 2);
        
        // We don't ever want our velocity values to be near 0
        if(xVelocity < 1 && xVelocity > -1) {
            xVelocity = -1;
        }
        
        if(yVelocity < 1 && yVelocity > -1) {
            yVelocity = -1;
        }
        
        // Create a new Firefly particle object instance and add it to the end of the fireFlies array for later use.
        
        fireFlies.push(new FireFly(10, canvas.height - 10, 10, canvas.width - 10, xVelocity, yVelocity));
    }
    
    // Get the animation started using a timer to kick off the heartbeat (animation loop). Have it run repeatedly framerate times per second until the user leaves the app.
    requestAnimationFrame(update);
    
}


function randRange(min, max) {
    return Math.random() * (max - min) + min;
}
    
    
// Constructor function for our Firefly class

function FireFly(topEdge, bottomEdge, leftEdge, rightEdge, xVel, yVel) {
    
    // save the passed-in parameter values in properties of our new Firefly object for later access.
    this.top = topEdge;
    this.bottom = bottomEdge;
    this.left = leftEdge;
    this.right = rightEdge;
    this.xVelocity = xVel;
    this.yVelocity = yVel;
    
    // initial position of this Firefly object
    this.x = Math.random() * canvas.width/2;
    this.y = Math.random() * canvas.height;
    
    this.alpha = randRange(.2, .9);
    this.color = 'rgba(152, 255, 5, ' + this.alpha + ')';
    this.radius = randRange(.5, 1.5);
    this.blink = false;
    this.maxBlinkRate = 15;
    this.blinkRate = Math.floor(randRange(0, this.maxBlinkRate));
    
      
}

// Hearbeat (ticker) (animation loop)
// Draw and animate the Firefly particle objects on our canvas

// This function will be called framerate times per second (fps)

function update() {
    
    // Use a hack using setTimeout() to reset the framerate
    setTimeout(function() {
        
         // clear the canvas
         ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw the Firefly particles that are in our fireFlies array on the canvas
        fireFlies.forEach(function(fly, index) {
            
            ctx.beginPath();
            
            ctx.fillStyle = fly.color;
            
            // Based on the blinkRate property reset the blink property.
            
            if (fly.blinkRate >= fly.maxBlinkRate) {
                fly.blinkRate = 0;
                fly.blink = false;
            } else {
                
                fly.blinkRate+= 1
                
                if (fly.blinkRate >= 1) {
                    fly.blink = true;
                }
                
            }
            
            if (fly.blink) {
                
                ctx.arc(fly.x, fly.y, fly.radius, 0, Math.PI * 2, false);
            
                ctx.fill();
                
            }
            
            // Start drawing the circle
            
            
            ctx.closePath();
            
            // Animate our fly by applying a velocity to change the fly's x and y properties.
            
            fly.x += fly.xVelocity + Math.cos(angleX) * range;
            fly.y += fly.yVelocity + Math.sin(angleY) * range;
            
            // Alter the angle values for sine and cosine
            angleX += xSpeed;
            angleY += ySpeed;
            
            // Collision detection at our boundaries to keep our fireflies visible.
            
            // Check bottom edge
            if (fly.y >= fly.bottom + 25 && fly.yVelocity > 0) {
                
                    fly.y = fly.bottom + 5;
                    fly.yVelocity *= -1;
                
                } else if (fly.y <= fly.top - 25 && fly.yVelocity < 0) {
                    
                    fly.y = 5;
                    fly.yVelocity *= -1;
                    
                }
            
            // right and left edges
            if (fly.x >= fly.right + 25 && fly.xVelocity > 0) {
                
                    fly.x = fly.right + 5;
                    fly.xVelocity *= -1;
                
                } else if (fly.x <= fly.left - 25 && fly.xVelocity < 0) {
                    
                    fly.x = 5;
                    fly.xVelocity *= -1;
                    
                }
             
        });
        
        
        requestAnimationFrame(update);
        
    }, 1000/fps);
   
}
