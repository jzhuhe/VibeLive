# VibeLive - Quake Live Clone

A web-based Quake Live clone featuring authentic strafe jumping and rocket jumping mechanics built with Three.js.

## Features

- **Authentic Quake Physics Engine**
  - Air acceleration for speed preservation
  - Ground friction and acceleration
  - Proper momentum physics

- **Strafe Jumping (Bunny Hopping)**
  - Gain speed by jumping while strafing and turning
  - Air control allows for continuous acceleration
  - No hard speed cap - chain jumps for maximum velocity

- **Rocket Jumping**
  - Self-propulsion using rocket explosions
  - Directional control based on aim
  - Self-damage system
  - Explosion force scales with distance

- **Parkour-Style Level**
  - Multiple platforms at varying heights
  - Jump course for practicing movement
  - High platforms requiring rocket jumps
  - Open arena for speed runs

## Controls

### Basic Movement
- **W** - Move forward
- **S** - Move backward
- **A** - Strafe left
- **D** - Strafe right
- **Space** - Jump
- **Mouse** - Look around
- **Left Click** - Fire rocket

### Advanced Techniques

#### Strafe Jumping (Bunny Hopping)
1. While in the air, hold **A** or **D** to strafe
2. Move your mouse in the same direction you're strafing
3. Time your jumps right as you land to maintain speed
4. Chain multiple jumps together to build velocity

**Tips:**
- Don't hold forward (W) while strafe jumping
- Smooth mouse movements work better than jerky ones
- The angle matters - about 45 degrees is optimal
- Watch your speedometer to track your acceleration

#### Rocket Jumping
1. Look straight down or at an angle
2. Jump (**Space**)
3. Fire a rocket (**Left Click**) right after jumping
4. The explosion will propel you upward and forward

**Tips:**
- Timing is crucial - fire right after jumping
- Angle your view to control direction
- Costs health - use strategically
- Combine with strafe jumping for maximum distance

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How It Works

### Physics Engine

The game implements authentic Quake-style physics:

**Ground Movement** (`src/Player.js:145-154`)
- Friction applied each frame
- High ground acceleration for responsive control

**Air Movement** (`src/Player.js:156-175`)
- Special air acceleration allows speed gain
- Velocity added perpendicular to current movement
- This is what enables strafe jumping

**Collision Detection** (`src/Player.js:213-236`)
- AABB collision with platforms
- Raycasting for ground detection
- Proper collision resolution

### Rocket Physics

**Projectile** (`src/Rocket.js`)
- Constant velocity rockets
- Collision detection with world geometry
- Trail rendering for visual feedback

**Explosion** (`src/Rocket.js:98-123`)
- Radius-based damage and force
- Distance-based falloff
- Upward force component for jumping
- Visual effects with particles and lighting

## Technical Details

### Key Physics Constants

Located in `src/Player.js:26-38`:

```javascript
gravity = -25                    // Downward acceleration
jumpSpeed = 8.5                  // Initial jump velocity
maxGroundSpeed = 10              // Base ground speed
groundAcceleration = 100         // How fast you accelerate on ground
airStrafeAcceleration = 70       // Air control strength (key for strafe jumping)
friction = 8                     // Ground friction
```

### Architecture

```
src/
├── main.js       - Game loop, scene setup, input handling
├── Player.js     - Player physics, movement, controls
├── World.js      - Level geometry, collision objects
└── Rocket.js     - Projectile physics, explosions
```

## Browser Requirements

- Modern browser with WebGL support
- Pointer Lock API support
- Recommended: Chrome, Firefox, Edge (latest versions)

## Performance

The game runs at 60 FPS on most modern hardware. The physics simulation is frame-rate independent using delta time.

## Credits

Inspired by id Software's Quake series and the timeless movement mechanics that define arena shooters.

## License

MIT
