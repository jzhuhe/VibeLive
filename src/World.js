import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.collisionObjects = [];
        this.buildWorld();
    }

    buildWorld() {
        // Ground - much larger arena
        this.createPlatform(0, -0.5, 0, 300, 1, 300, 0x333333);

        // Starting platform
        this.createPlatform(0, 0, 0, 25, 1, 25, 0x444444);

        // ========== STRAFE JUMPING COURSE ==========
        // Progressive jump platforms
        this.createPlatform(20, 2, 0, 10, 1, 10, 0x0066cc);
        this.createPlatform(40, 4, 0, 10, 1, 10, 0x0066cc);
        this.createPlatform(60, 6, 5, 10, 1, 10, 0x0066cc);
        this.createPlatform(80, 8, -5, 10, 1, 10, 0x0066cc);
        this.createPlatform(100, 10, 0, 12, 1, 12, 0x0066cc);

        // Side platforms for strafe practice
        this.createPlatform(30, 3, 20, 8, 1, 8, 0x00cc66);
        this.createPlatform(50, 5, -20, 8, 1, 8, 0x00cc66);
        this.createPlatform(70, 7, 25, 8, 1, 8, 0x00cc66);
        this.createPlatform(90, 9, -25, 8, 1, 8, 0x00cc66);

        // ========== ROCKET JUMPING TOWERS ==========
        // Tower 1 - Left side
        this.createPlatform(-30, 5, 20, 8, 1, 8, 0xcc0066);
        this.createPlatform(-30, 10, 20, 8, 1, 8, 0xcc0066);
        this.createPlatform(-30, 15, 20, 8, 1, 8, 0xcc0066);
        this.createPlatform(-30, 20, 20, 8, 1, 8, 0xcc0066);
        this.createPlatform(-30, 25, 20, 10, 1, 10, 0xcc0066);

        // Tower 2 - Right side
        this.createPlatform(30, 5, -20, 8, 1, 8, 0xcc0066);
        this.createPlatform(30, 10, -20, 8, 1, 8, 0xcc0066);
        this.createPlatform(30, 15, -20, 8, 1, 8, 0xcc0066);
        this.createPlatform(30, 20, -20, 8, 1, 8, 0xcc0066);

        // Tower 3 - Far side
        this.createPlatform(-50, 7, -50, 8, 1, 8, 0xcc0066);
        this.createPlatform(-50, 14, -50, 8, 1, 8, 0xcc0066);
        this.createPlatform(-50, 21, -50, 10, 1, 10, 0xcc0066);

        // ========== ELEVATED PLATFORMS ==========
        // High platforms for advanced rocket jumping
        this.createPlatform(0, 18, 50, 15, 1, 15, 0xcc6600);
        this.createPlatform(0, 22, -60, 15, 1, 15, 0xcc6600);
        this.createPlatform(60, 16, 50, 12, 1, 12, 0xcc6600);
        this.createPlatform(-60, 18, -60, 12, 1, 12, 0xcc6600);

        // Mid-height platforms
        this.createPlatform(40, 12, 40, 10, 1, 10, 0x9966cc);
        this.createPlatform(-40, 12, 40, 10, 1, 10, 0x9966cc);
        this.createPlatform(40, 12, -40, 10, 1, 10, 0x9966cc);
        this.createPlatform(-40, 12, -40, 10, 1, 10, 0x9966cc);

        // ========== SPEED RUN PLATFORMS ==========
        // Long platforms for maintaining speed
        this.createPlatform(0, 8, -80, 50, 1, 10, 0x6600cc);
        this.createPlatform(0, 10, 80, 50, 1, 10, 0x6600cc);
        this.createPlatform(80, 8, 0, 10, 1, 50, 0x6600cc);
        this.createPlatform(-80, 8, 0, 10, 1, 50, 0x6600cc);

        // ========== WALLS FOR ROCKET JUMPING ==========
        // Outer boundary walls (taller)
        this.createWall(150, 10, 0, 1, 20, 300, 0x666666);
        this.createWall(-150, 10, 0, 1, 20, 300, 0x666666);
        this.createWall(0, 10, 150, 300, 20, 1, 0x666666);
        this.createWall(0, 10, -150, 300, 20, 1, 0x666666);

        // Interior walls for rocket bouncing
        this.createWall(25, 8, 35, 20, 16, 2, 0x888888);
        this.createWall(-25, 8, -35, 20, 16, 2, 0x888888);
        this.createWall(35, 8, 25, 2, 16, 20, 0x888888);
        this.createWall(-35, 8, -25, 2, 16, 20, 0x888888);

        // Corner walls
        this.createWall(70, 6, 70, 15, 12, 2, 0x888888);
        this.createWall(-70, 6, 70, 15, 12, 2, 0x888888);
        this.createWall(70, 6, -70, 15, 12, 2, 0x888888);
        this.createWall(-70, 6, -70, 15, 12, 2, 0x888888);

        // Angled walls for trick shots
        this.createWall(0, 12, 0, 15, 24, 2, 0x888888);
        this.createWall(50, 8, 0, 2, 16, 25, 0x888888);
        this.createWall(-50, 8, 0, 2, 16, 25, 0x888888);

        // ========== ROCKET JUMP PRACTICE STRUCTURES ==========
        // Small platforms around starting area
        this.createPlatform(15, 3, 15, 6, 1, 6, 0xff8800);
        this.createPlatform(-15, 3, 15, 6, 1, 6, 0xff8800);
        this.createPlatform(15, 3, -15, 6, 1, 6, 0xff8800);
        this.createPlatform(-15, 3, -15, 6, 1, 6, 0xff8800);

        this.createPlatform(15, 8, 15, 6, 1, 6, 0xff8800);
        this.createPlatform(-15, 8, 15, 6, 1, 6, 0xff8800);
        this.createPlatform(15, 8, -15, 6, 1, 6, 0xff8800);
        this.createPlatform(-15, 8, -15, 6, 1, 6, 0xff8800);

        // Pillars for practicing rocket jumps
        this.createBox(50, 2, 50, 3, 4, 3, 0xff0000);
        this.createBox(-50, 2, 50, 3, 4, 3, 0xff0000);
        this.createBox(50, 2, -50, 3, 4, 3, 0xff0000);
        this.createBox(-50, 2, -50, 3, 4, 3, 0xff0000);

        this.createBox(35, 2, 0, 3, 4, 3, 0xff0000);
        this.createBox(-35, 2, 0, 3, 4, 3, 0xff0000);
        this.createBox(0, 2, 35, 3, 4, 3, 0xff0000);
        this.createBox(0, 2, -35, 3, 4, 3, 0xff0000);

        // Floating platforms cluster
        this.createPlatform(100, 14, 80, 8, 1, 8, 0x00ffff);
        this.createPlatform(110, 17, 85, 8, 1, 8, 0x00ffff);
        this.createPlatform(120, 20, 80, 10, 1, 10, 0x00ffff);

        this.createPlatform(-100, 14, -80, 8, 1, 8, 0x00ffff);
        this.createPlatform(-110, 17, -85, 8, 1, 8, 0x00ffff);
        this.createPlatform(-120, 20, -80, 10, 1, 10, 0x00ffff);

        // Central high platform (ultimate challenge)
        this.createPlatform(0, 30, 0, 15, 1, 15, 0xffff00);

        // Grid helper for reference (larger)
        const gridHelper = new THREE.GridHelper(300, 60, 0x444444, 0x222222);
        gridHelper.position.y = 0;
        this.scene.add(gridHelper);
    }

    createPlatform(x, y, z, width, height, depth, color) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.7,
            metalness: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.scene.add(mesh);
        this.collisionObjects.push(mesh);

        // Add edge highlight
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
        );
        line.position.copy(mesh.position);
        this.scene.add(line);

        return mesh;
    }

    createWall(x, y, z, width, height, depth, color) {
        return this.createPlatform(x, y, z, width, height, depth, color);
    }

    createBox(x, y, z, width, height, depth, color) {
        return this.createPlatform(x, y, z, width, height, depth, color);
    }

    checkRayCollision(origin, direction, maxDistance) {
        const raycaster = new THREE.Raycaster(origin, direction, 0, maxDistance);
        const intersects = raycaster.intersectObjects(this.collisionObjects, true);

        if (intersects.length > 0) {
            return {
                hit: true,
                point: intersects[0].point,
                distance: intersects[0].distance,
                object: intersects[0].object,
                normal: intersects[0].face ? intersects[0].face.normal : new THREE.Vector3(0, 1, 0)
            };
        }

        return { hit: false };
    }

    getObjectsInRadius(position, radius) {
        const objects = [];

        for (const obj of this.collisionObjects) {
            const distance = position.distanceTo(obj.position);
            if (distance <= radius) {
                objects.push({
                    object: obj,
                    distance: distance
                });
            }
        }

        return objects;
    }
}
