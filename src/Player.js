import * as THREE from 'three';

export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;

        // Position and physics
        this.position = new THREE.Vector3(0, 10, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);

        // Player stats
        this.health = 100;
        this.ammo = 25;
        this.maxHealth = 100;

        // Player dimensions
        this.height = 1.8;
        this.radius = 0.5;
        this.eyeHeight = 1.6;

        // Quake physics constants
        this.gravity = -25;
        this.jumpSpeed = 8.5;
        this.maxGroundSpeed = 10;
        this.maxAirSpeed = 10;
        this.groundAcceleration = 100;
        this.airAcceleration = 2;
        this.friction = 8;
        this.stopSpeed = 1.5;

        // Air strafe settings (key to Quake movement)
        this.airStrafeAcceleration = 70;
        this.maxAirStrafeSpeed = 30; // No hard cap for bunny hopping

        // Movement state
        this.onGround = false;
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            crouch: false
        };

        // Camera control
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = 0.002;

        this.setupControls();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'KeyW': this.keys.forward = true; break;
                case 'KeyS': this.keys.backward = true; break;
                case 'KeyA': this.keys.left = true; break;
                case 'KeyD': this.keys.right = true; break;
                case 'Space': this.keys.jump = true; break;
                case 'ShiftLeft':
                case 'ShiftRight':
                case 'KeyC':
                    this.keys.crouch = true;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': this.keys.forward = false; break;
                case 'KeyS': this.keys.backward = false; break;
                case 'KeyA': this.keys.left = false; break;
                case 'KeyD': this.keys.right = false; break;
                case 'Space': this.keys.jump = false; break;
                case 'ShiftLeft':
                case 'ShiftRight':
                case 'KeyC':
                    this.keys.crouch = false;
                    break;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement) {
                this.yaw -= e.movementX * this.mouseSensitivity;
                this.pitch -= e.movementY * this.mouseSensitivity;
                this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (document.pointerLockElement && e.button === 2) {
                this.keys.jump = true;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.keys.jump = false;
            }
        });

        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => {
            if (document.pointerLockElement) {
                e.preventDefault();
            }
        });
    }

    update(delta, world) {
        this.updateMovement(delta, world);
        this.updateCamera();
    }

    updateMovement(delta, world) {
        // Get movement input
        const moveDirection = new THREE.Vector3();
        const forward = new THREE.Vector3(
            -Math.sin(this.yaw),
            0,
            -Math.cos(this.yaw)
        );
        const right = new THREE.Vector3(
            Math.cos(this.yaw),
            0,
            -Math.sin(this.yaw)
        );

        if (this.keys.forward) moveDirection.add(forward);
        if (this.keys.backward) moveDirection.sub(forward);
        if (this.keys.left) moveDirection.sub(right);
        if (this.keys.right) moveDirection.add(right);

        if (moveDirection.length() > 0) {
            moveDirection.normalize();
        }

        // Check if on ground
        this.onGround = this.checkGround(world);

        // Apply movement based on ground state
        if (this.onGround) {
            this.groundMove(moveDirection, delta);
        } else {
            this.airMove(moveDirection, delta);
        }

        // Apply gravity
        this.velocity.y += this.gravity * delta;

        // Move player
        const movement = this.velocity.clone().multiplyScalar(delta);
        this.position.add(movement);

        // Handle collisions
        this.handleCollisions(world);

        // Handle jump
        if (this.keys.jump && this.onGround) {
            this.velocity.y = this.jumpSpeed;
            this.onGround = false;
        }
    }

    groundMove(wishDir, delta) {
        // Apply friction
        const speed = this.velocity.length();
        if (speed !== 0) {
            const drop = speed * this.friction * delta;
            this.velocity.multiplyScalar(Math.max(speed - drop, 0) / speed);
        }

        // Apply acceleration
        this.accelerate(wishDir, this.maxGroundSpeed, this.groundAcceleration, delta);
    }

    airMove(wishDir, delta) {
        // This is the key to strafe jumping!
        // In Quake, air movement has special properties that allow speed gain

        const wishSpeed = wishDir.length() * this.maxAirSpeed;

        if (wishSpeed > 0) {
            // Project current velocity onto movement direction
            const currentSpeed = this.velocity.dot(wishDir);

            // Add velocity in the direction we want to go
            const addSpeed = wishSpeed - currentSpeed;

            if (addSpeed > 0) {
                // Air acceleration is proportional to angle between current velocity and desired direction
                const accelSpeed = Math.min(this.airStrafeAcceleration * wishSpeed * delta, addSpeed);

                this.velocity.x += wishDir.x * accelSpeed;
                this.velocity.z += wishDir.z * accelSpeed;
            }
        }
    }

    accelerate(wishDir, wishSpeed, accel, delta) {
        const currentSpeed = this.velocity.dot(wishDir);
        const addSpeed = wishSpeed - currentSpeed;

        if (addSpeed <= 0) {
            return;
        }

        let accelSpeed = accel * delta * wishSpeed;
        if (accelSpeed > addSpeed) {
            accelSpeed = addSpeed;
        }

        this.velocity.x += accelSpeed * wishDir.x;
        this.velocity.z += accelSpeed * wishDir.z;
    }

    checkGround(world) {
        // Ray cast down to check if on ground
        const origin = this.position.clone();
        const direction = new THREE.Vector3(0, -1, 0);
        const raycaster = new THREE.Raycaster(origin, direction, 0, this.height * 0.55);

        const intersects = raycaster.intersectObjects(world.collisionObjects, true);

        if (intersects.length > 0 && this.velocity.y <= 0) {
            return true;
        }

        return false;
    }

    handleCollisions(world) {
        // Check collision with ground
        if (this.position.y < this.height / 2) {
            this.position.y = this.height / 2;
            if (this.velocity.y < 0) {
                this.velocity.y = 0;
            }
            this.onGround = true;
        }

        // Check collision with world objects
        const playerBox = new THREE.Box3(
            new THREE.Vector3(
                this.position.x - this.radius,
                this.position.y - this.height / 2,
                this.position.z - this.radius
            ),
            new THREE.Vector3(
                this.position.x + this.radius,
                this.position.y + this.height / 2,
                this.position.z + this.radius
            )
        );

        for (const obj of world.collisionObjects) {
            if (obj.geometry) {
                const objBox = new THREE.Box3().setFromObject(obj);

                if (playerBox.intersectsBox(objBox)) {
                    this.resolveCollision(objBox);
                }
            }
        }
    }

    resolveCollision(box) {
        const center = this.position;

        // Calculate overlap on each axis
        const overlapX = Math.min(
            Math.abs(center.x + this.radius - box.min.x),
            Math.abs(center.x - this.radius - box.max.x)
        );
        const overlapY = Math.min(
            Math.abs(center.y + this.height / 2 - box.min.y),
            Math.abs(center.y - this.height / 2 - box.max.y)
        );
        const overlapZ = Math.min(
            Math.abs(center.z + this.radius - box.min.z),
            Math.abs(center.z - this.radius - box.max.z)
        );

        // Push out on the axis with least overlap
        if (overlapX < overlapY && overlapX < overlapZ) {
            if (center.x < (box.min.x + box.max.x) / 2) {
                this.position.x = box.min.x - this.radius - 0.01;
            } else {
                this.position.x = box.max.x + this.radius + 0.01;
            }
            this.velocity.x = 0;
        } else if (overlapY < overlapZ) {
            if (center.y < (box.min.y + box.max.y) / 2) {
                this.position.y = box.min.y - this.height / 2 - 0.01;
                if (this.velocity.y < 0) {
                    this.velocity.y = 0;
                }
            } else {
                this.position.y = box.max.y + this.height / 2 + 0.01;
                if (this.velocity.y > 0) {
                    this.velocity.y = 0;
                }
            }
        } else {
            if (center.z < (box.min.z + box.max.z) / 2) {
                this.position.z = box.min.z - this.radius - 0.01;
            } else {
                this.position.z = box.max.z + this.radius + 0.01;
            }
            this.velocity.z = 0;
        }
    }

    updateCamera() {
        this.camera.position.copy(this.position);
        this.camera.position.y += this.eyeHeight - this.height / 2;

        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    applyExplosionForce(force) {
        this.velocity.add(force);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    }
}
