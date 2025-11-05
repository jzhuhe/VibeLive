import * as THREE from 'three';

export class Rocket {
    constructor(position, direction, scene, player) {
        this.scene = scene;
        this.player = player;
        this.position = position.clone();
        this.direction = direction.clone().normalize();
        this.velocity = this.direction.clone().multiplyScalar(40);

        this.speed = 40;
        this.lifetime = 5;
        this.age = 0;
        this.exploded = false;

        // Explosion properties
        this.explosionRadius = 8;
        this.explosionDamage = 100;
        this.explosionForce = 20;

        this.createMesh();
        this.createTrail();
    }

    createMesh() {
        // Rocket body
        const geometry = new THREE.CylinderGeometry(0.1, 0.15, 0.6, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = Math.PI / 2;

        // Point light for glow
        this.light = new THREE.PointLight(0xff4444, 2, 10);
        this.mesh.add(this.light);

        this.scene.add(this.mesh);
    }

    createTrail() {
        this.trail = [];
        this.trailLength = 20;

        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({
            color: 0xff8844,
            transparent: true,
            opacity: 0.6
        });

        this.trailLine = new THREE.Line(geometry, material);
        this.scene.add(this.trailLine);
    }

    update(delta, world) {
        if (this.exploded) return;

        this.age += delta;

        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(delta));

        // Update mesh
        if (this.mesh) {
            this.mesh.position.copy(this.position);

            // Rotate rocket to face direction
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 0, 1),
                this.direction
            );
            this.mesh.setRotationFromQuaternion(quaternion);
        }

        // Update trail
        this.trail.push(this.position.clone());
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        const positions = [];
        for (const pos of this.trail) {
            positions.push(pos.x, pos.y, pos.z);
        }
        this.trailLine.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        );

        // Check collision
        const collision = world.checkRayCollision(
            this.position,
            this.velocity.clone().normalize(),
            this.velocity.length() * delta + 0.2
        );

        if (collision.hit || this.age >= this.lifetime) {
            if (collision.hit) {
                this.position.copy(collision.point);
            }
            this.explode(world);
        }
    }

    explode(world) {
        this.exploded = true;

        // Create explosion visual effect
        this.createExplosion();

        // Apply damage and force to player
        const distanceToPlayer = this.position.distanceTo(this.player.position);

        if (distanceToPlayer <= this.explosionRadius) {
            // Calculate damage falloff
            const damageScale = 1 - (distanceToPlayer / this.explosionRadius);
            const damage = this.explosionDamage * damageScale * 0.5; // Reduced self-damage

            // Apply damage
            this.player.takeDamage(damage);

            // Calculate explosion force direction (away from explosion)
            const forceDirection = this.player.position.clone()
                .sub(this.position)
                .normalize();

            // Add upward component for rocket jumping
            forceDirection.y = Math.max(forceDirection.y, 0.3);
            forceDirection.normalize();

            // Apply force (stronger when closer)
            const force = forceDirection.multiplyScalar(
                this.explosionForce * damageScale
            );

            this.player.applyExplosionForce(force);
        }

        // Clean up
        this.cleanup();
    }

    createExplosion() {
        // Create explosion sphere
        const sphereGeometry = new THREE.SphereGeometry(this.explosionRadius, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const explosionSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        explosionSphere.position.copy(this.position);
        this.scene.add(explosionSphere);

        // Create explosion light
        const explosionLight = new THREE.PointLight(0xff6600, 10, this.explosionRadius * 3);
        explosionLight.position.copy(this.position);
        this.scene.add(explosionLight);

        // Create particles
        const particleCount = 30;
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = [];
        const particleVelocities = [];

        for (let i = 0; i < particleCount; i++) {
            particlePositions.push(
                this.position.x,
                this.position.y,
                this.position.z
            );

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize().multiplyScalar(5 + Math.random() * 10);

            particleVelocities.push(velocity);
        }

        particleGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(particlePositions, 3)
        );

        const particleMaterial = new THREE.PointsMaterial({
            color: 0xff8800,
            size: 0.3,
            transparent: true,
            opacity: 1
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);

        // Animate explosion
        let time = 0;
        const maxTime = 0.5;

        const animateExplosion = () => {
            time += 0.016;

            if (time >= maxTime) {
                this.scene.remove(explosionSphere);
                this.scene.remove(explosionLight);
                this.scene.remove(particles);
                return;
            }

            // Fade out
            const progress = time / maxTime;
            sphereMaterial.opacity = 0.6 * (1 - progress);
            particleMaterial.opacity = 1 - progress;
            explosionLight.intensity = 10 * (1 - progress);

            // Expand sphere
            explosionSphere.scale.setScalar(1 + progress * 2);

            // Update particles
            const positions = particleGeometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const velocity = particleVelocities[i];
                positions[i * 3] += velocity.x * 0.016;
                positions[i * 3 + 1] += velocity.y * 0.016 - 5 * 0.016;
                positions[i * 3 + 2] += velocity.z * 0.016;
            }
            particleGeometry.attributes.position.needsUpdate = true;

            requestAnimationFrame(animateExplosion);
        };

        animateExplosion();
    }

    cleanup() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        if (this.trailLine) {
            this.scene.remove(this.trailLine);
        }
    }
}
