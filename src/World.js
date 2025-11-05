import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.collisionObjects = [];
        this.buildWorld();
    }

    buildWorld() {
        // Ground
        this.createPlatform(0, -0.5, 0, 100, 1, 100, 0x333333);

        // Starting platform
        this.createPlatform(0, 0, 0, 20, 1, 20, 0x444444);

        // Jump platforms - create a course for practicing strafe jumping
        // Low platforms
        this.createPlatform(15, 2, 0, 8, 1, 8, 0x0066cc);
        this.createPlatform(30, 4, 0, 8, 1, 8, 0x0066cc);
        this.createPlatform(45, 6, 0, 8, 1, 8, 0x0066cc);

        // Side platforms for strafe practice
        this.createPlatform(20, 3, 15, 6, 1, 6, 0x00cc66);
        this.createPlatform(35, 5, -15, 6, 1, 6, 0x00cc66);

        // High platform for rocket jumping
        this.createPlatform(0, 15, 30, 10, 1, 10, 0xcc6600);

        // Tower platforms
        this.createPlatform(-20, 5, 10, 6, 1, 6, 0xcc0066);
        this.createPlatform(-20, 10, 10, 6, 1, 6, 0xcc0066);
        this.createPlatform(-20, 15, 10, 6, 1, 6, 0xcc0066);

        // Long platform for speed runs
        this.createPlatform(0, 8, -30, 40, 1, 8, 0x6600cc);

        // Walls for testing collision
        this.createWall(50, 5, 0, 1, 10, 40, 0x666666);
        this.createWall(-50, 5, 0, 1, 10, 40, 0x666666);
        this.createWall(0, 5, 50, 100, 10, 1, 0x666666);
        this.createWall(0, 5, -50, 100, 10, 1, 0x666666);

        // Add some obstacles
        this.createBox(10, 1, 10, 2, 2, 2, 0xff0000);
        this.createBox(-10, 1, -10, 2, 2, 2, 0xff0000);

        // Grid helper for reference
        const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
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
