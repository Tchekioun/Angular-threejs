import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Stats from 'three/examples/jsm/libs/stats.module';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min';

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss'],
})
export class CubeComponent implements OnInit {
  @ViewChild('container', { static: true }) containerRef!: ElementRef;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  bulbLight!: THREE.PointLight;
  bulbMat!: THREE.MeshStandardMaterial;
  hemiLight!: THREE.HemisphereLight;
  stats!: Stats;
  ballMat!: THREE.MeshStandardMaterial;
  cubeMat!: THREE.MeshStandardMaterial;
  floorMat!: THREE.MeshStandardMaterial;
  previousShadowMap = false;
  params: any;

  bulbLuminousPowers: any = {
    '110000 lm (1000W)': 110000,
    '3500 lm (300W)': 3500,
    '1700 lm (100W)': 1700,
    '800 lm (60W)': 800,
    '400 lm (40W)': 400,
    '180 lm (25W)': 180,
    '20 lm (4W)': 20,
    Off: 0,
  };

  hemiLuminousIrradiances: any = {
    '0.0001 lx (Moonless Night)': 0.0001,
    '0.002 lx (Night Airglow)': 0.002,
    '0.5 lx (Full Moon)': 0.5,
    '3.4 lx (City Twilight)': 3.4,
    '50 lx (Living Room)': 50,
    '100 lx (Very Overcast)': 100,
    '350 lx (Office Room)': 350,
    '400 lx (Sunrise/Sunset)': 400,
    '1000 lx (Overcast)': 1000,
    '18000 lx (Daylight)': 18000,
    '50000 lx (Direct Sun)': 50000,
  };

  ngOnInit(): void {
    this.initThree();
    this.animate();
  }

  initThree() {
    this.params = {
      shadows: true,
      exposure: 0.5,
      bulbPower: Object.keys(this.bulbLuminousPowers)[5],
      hemiIrradiance: Object.keys(this.hemiLuminousIrradiances)[6],
    };

    const container = this.containerRef.nativeElement;

    this.stats = new Stats();
    container.appendChild(this.stats.dom);

    this.scene = new THREE.Scene();

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.x = -4;
    this.camera.position.z = 4;
    this.camera.position.y = 2;

    const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);
    this.bulbLight = new THREE.PointLight(0xffee88, 1, 100, 2);

    this.bulbMat = new THREE.MeshStandardMaterial({
      emissive: 0xffffee,
      emissiveIntensity: 1,
      color: 0x000000,
    });

    this.bulbLight.add(new THREE.Mesh(bulbGeometry, this.bulbMat));
    this.bulbLight.position.set(0, 2, 0);
    this.bulbLight.castShadow = true;
    this.scene.add(this.bulbLight);

    this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.02);
    this.scene.add(this.hemiLight);

    this.floorMat = new THREE.MeshStandardMaterial();
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/textures/Tile_BaseColor.jpg', (map) => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(30, 30);
      map.colorSpace = THREE.SRGBColorSpace;
      this.floorMat.map = map;
      this.floorMat.needsUpdate = true;
    });
    textureLoader.load('assets/textures/Tile_Normal.jpg', (map) => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(30, 30);
      this.floorMat.normalMap = map;
      this.floorMat.needsUpdate = true;
    });
    textureLoader.load('assets/textures/Tile_Roughness.jpg', (map) => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(30, 30);
      this.floorMat.roughnessMap = map;
      this.floorMat.needsUpdate = true;
    });

    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    this.cubeMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      color: 0xffffff,
      bumpScale: 0.002,
      metalness: 0.2,
    });
    textureLoader.load('assets/textures/brick_diffuse.jpg', (map) => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(1, 1);
      map.colorSpace = THREE.SRGBColorSpace;
      this.cubeMat.map = map;
      this.cubeMat.needsUpdate = true;
    });
    textureLoader.load('assets/textures/brick_bump.jpg', (map) => {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(1, 1);
      this.cubeMat.bumpMap = map;
      this.cubeMat.needsUpdate = true;
    });

    const ballGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    this.ballMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 1.0,
    });
    textureLoader.load('assets/textures/earth_atmos_2048.jpg', (map) => {
      map.anisotropy = 4;
      map.colorSpace = THREE.SRGBColorSpace;
      this.ballMat.map = map;
      this.ballMat.needsUpdate = true;
    });
    textureLoader.load('assets/textures/earth_specular_2048.jpg', (map) => {
      map.anisotropy = 4;
      map.colorSpace = THREE.SRGBColorSpace;
      this.ballMat.metalnessMap = map;
      this.ballMat.needsUpdate = true;
    });

    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMesh = new THREE.Mesh(floorGeometry, this.floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;
    this.scene.add(floorMesh);

    const ballMesh = new THREE.Mesh(ballGeometry, this.ballMat);
    ballMesh.position.set(1, 0.25, 1);
    ballMesh.rotation.y = Math.PI;
    ballMesh.castShadow = true;
    this.scene.add(ballMesh);

    const cubeMesh = new THREE.Mesh(cubeGeometry, this.cubeMat);
    cubeMesh.position.set(-0.5, 0.25, -1);
    cubeMesh.castShadow = true;
    this.scene.add(cubeMesh);

    const cubeMesh2 = new THREE.Mesh(cubeGeometry, this.cubeMat);
    cubeMesh2.position.set(0, 0.25, -5);
    cubeMesh2.castShadow = true;
    this.scene.add(cubeMesh2);

    const cubeMesh3 = new THREE.Mesh(cubeGeometry, this.cubeMat);
    cubeMesh2.position.set(7, 0.25, 0);
    cubeMesh2.castShadow = true;
    this.scene.add(cubeMesh3);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 20;

    window.addEventListener('resize', this.onWindowResize.bind(this));

    const gui = new GUI();

    gui.add(
      this.params,
      'hemiIrradiance',
      Object.keys(this.hemiLuminousIrradiances)
    );
    gui.add(this.params, 'bulbPower', Object.keys(this.bulbLuminousPowers));
    gui.add(this.params, 'exposure', 0, 1);
    gui.add(this.params, 'shadows');
    gui.open();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }

  render() {
    this.renderer.toneMappingExposure = Math.pow(this.params.exposure, 5.0); // to allow for very bright scenes.
    this.renderer.shadowMap.enabled = this.params.shadows;
    this.bulbLight.castShadow = this.params.shadows;

    if (this.params.shadows !== this.previousShadowMap) {
      this.ballMat.needsUpdate = true;
      this.cubeMat.needsUpdate = true;
      this.floorMat.needsUpdate = true;
      this.previousShadowMap = this.params.shadows;
    }

    this.bulbLight.power = this.bulbLuminousPowers[this.params.bulbPower];
    this.bulbMat.emissiveIntensity =
      this.bulbLight.intensity / Math.pow(0.02, 2.0); // convert from intensity to irradiance at bulb surface

    this.hemiLight.intensity =
      this.hemiLuminousIrradiances[this.params.hemiIrradiance];
    const time = Date.now() * 0.0005;

    this.bulbLight.position.y = Math.cos(time) * 0.75 + 1.25;

    this.renderer.render(this.scene, this.camera);

    this.stats.update();
  }
}
