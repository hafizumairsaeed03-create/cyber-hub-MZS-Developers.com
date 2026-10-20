// 3D Scene Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3.2, 10);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Advanced Cinematic Lighting for Silver & Neon Glow
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.0);
    mainLight.position.set(6, 15, 8);
    scene.add(mainLight);

    const cyanLight = new THREE.PointLight(0x00e5ff, 5, 12);
    cyanLight.position.set(-1.2, -0.4, 1);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xd900ff, 5, 12);
    purpleLight.position.set(1.2, -0.4, 1);
    scene.add(purpleLight);

    // Ultra-Modern Machined Silver Device Group
    const deviceGroup = new THREE.Group();

    // High Gloss Bright Silver Material
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe8edf4,
      metalness: 0.96,
      roughness: 0.15,
      emissive: 0x111928
    });

    const darkInnerMat = new THREE.MeshStandardMaterial({
      color: 0x05080f,
      metalness: 0.9,
      roughness: 0.3
    });

    // 1. Sleek Beveled Main Base
    const baseGeo = new THREE.RoundedBoxGeometry(3.6, 0.35, 3.0, 6, 0.08);
    const baseMesh = new THREE.Mesh(baseGeo, silverMat);
    baseMesh.position.y = -1.6;
    deviceGroup.add(baseMesh);

    // 2. Inner Dark Carbon Console Plate
    const innerGeo = new THREE.RoundedBoxGeometry(3.1, 0.12, 2.5, 4, 0.04);
    const innerMesh = new THREE.Mesh(innerGeo, darkInnerMat);
    innerMesh.position.y = -1.40;
    deviceGroup.add(innerMesh);

    // 3. Central Emitter Ring Housing
    const housingGeo = new THREE.CylinderGeometry(0.95, 1.05, 0.2, 48);
    const housingMesh = new THREE.Mesh(housingGeo, silverMat);
    housingMesh.position.y = -1.28;
    deviceGroup.add(housingMesh);

    // Inner Glowing Core Aperture (Light source)
    const holeRingGeo = new THREE.RingGeometry(0.32, 0.78, 36);
    const holeRingMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide });
    const holeRingMesh = new THREE.Mesh(holeRingGeo, holeRingMat);
    holeRingMesh.rotation.x = Math.PI / 2;
    holeRingMesh.position.set(0, -1.17, 0);
    deviceGroup.add(holeRingMesh);

    // 4. Modern Side Neon LED Strips (Cyan & Magenta) with strong glow
    const cyanBarGeo = new THREE.BoxGeometry(0.9, 0.06, 0.12);
    const cyanBarMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const cyanBar = new THREE.Mesh(cyanBarGeo, cyanBarMat);
    cyanBar.position.set(-0.9, -1.32, 1.05);
    deviceGroup.add(cyanBar);

    const purpleBarGeo = new THREE.BoxGeometry(0.9, 0.06, 0.12);
    const purpleBarMat = new THREE.MeshBasicMaterial({ color: 0xd900ff });
    const purpleBar = new THREE.Mesh(purpleBarGeo, purpleBarMat);
    purpleBar.position.set(0.9, -1.32, 1.05);
    deviceGroup.add(purpleBar);

    scene.add(deviceGroup);

    // 5. Volumetric 3D Light Projection Cone (Device se nikalti hui roshni)
    const coneGeo = new THREE.CylinderGeometry(1.7, 0.5, 3.8, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    lightCone.position.set(0, 0.7, 0);
    scene.add(lightCone);

    // 6. Glowing Light Particles Flowing Upward
    const particleCount = 450;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      let radius = Math.random() * 0.9;
      let angle = Math.random() * Math.PI * 2;
      let y = (Math.random() * 3.8) - 1.2;

      positions[i * 3] = Math.cos(angle) * (radius * (y + 2) / 4);
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * (radius * (y + 2) / 4);
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.055,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particleSystem);

    // Render Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      // Particle Upward Motion
      const pos = particleSystem.geometry.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        pos[i] += 0.024;
        if (pos[i] > 2.6) {
          pos[i] = -1.2;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // Smooth pulsing light effect
      lightCone.material.opacity = 0.28 + Math.sin(Date.now() * 0.0035) * 0.08;

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Code Stream Update
    const codeLines = [
      '<span class="kw">async function</span> <span class="fn">decrypt_packet</span>(data) {',
      '&nbsp;&nbsp;<span class="kw">let</span> threat_state = <span class="str">"ANALYZING"</span>;',
      '&nbsp;&nbsp;<span class="kw">if</span> (threat_size > 1024) {',
      '&nbsp;&nbsp;&nbsp;&nbsp;<span class="fn">isolate_node</span>();',
      '&nbsp;&nbsp;}',
      '}'
    ];

    const codeContainer = document.getElementById('codeStream');
    setInterval(() => {
      const randomLine = codeLines[Math.floor(Math.random() * codeLines.length)];
      const p = document.createElement('p');
      p.innerHTML = randomLine;
      codeContainer.appendChild(p);

      if (codeContainer.children.length > 5) {
        codeContainer.removeChild(codeContainer.children[0]);
      }
    }, 1200);