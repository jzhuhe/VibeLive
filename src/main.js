import * as THREE from 'three';
import { Player } from './Player.js';
import { World } from './World.js';
import { Rocket } from './Rocket.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.instructions = document.getElementById('instructions');

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 0, 750);

        this.camera = new THREE.PerspectiveCamera(
            90,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.clock = new THREE.Clock();
        this.player = new Player(this.camera, this.scene);
        this.world = new World(this.scene);
        this.rockets = [];

        this.setupLights();
        this.setupEventListeners();

        this.locked = false;
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.far = 500;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', () => {
            if (!this.locked) {
                this.canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.locked = document.pointerLockElement === this.canvas;
            if (this.locked) {
                this.instructions.classList.add('hidden');
            } else {
                this.instructions.classList.remove('hidden');
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (this.locked && e.button === 0) {
                this.fireRocket();
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    fireRocket() {
        if (this.player.ammo <= 0) return;

        this.player.ammo--;
        this.updateHUD();

        const rocket = new Rocket(
            this.player.position.clone(),
            this.camera.getWorldDirection(new THREE.Vector3()),
            this.scene,
            this.player
        );
        this.rockets.push(rocket);
    }

    updateHUD() {
        const speed = Math.sqrt(
            this.player.velocity.x ** 2 +
            this.player.velocity.z ** 2
        ).toFixed(0);

        document.getElementById('speed').textContent = `Speed: ${speed}`;
        document.getElementById('health').textContent = `Health: ${Math.max(0, Math.floor(this.player.health))}`;
        document.getElementById('ammo').textContent = `Ammo: ${this.player.ammo}`;
    }

    update() {
        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (this.locked) {
            this.player.update(delta, this.world);

            // Update rockets
            for (let i = this.rockets.length - 1; i >= 0; i--) {
                const rocket = this.rockets[i];
                rocket.update(delta, this.world);

                if (rocket.exploded) {
                    this.rockets.splice(i, 1);
                }
            }

            this.updateHUD();
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
    }

    start() {
        this.animate();
    }
}

const game = new Game();
game.start();
