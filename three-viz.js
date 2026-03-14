// 3D TRANSMISSION NETWORK (Three.js)
// ==========================================
(function() {
    const container = document.getElementById('three-container');
    const tooltip = document.getElementById('vizTooltip');
    if (!container) return;

    const W = container.clientWidth;
    const H = container.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1b1f22);
    scene.fog = new THREE.FogExp2(0x1b1f22, 0.0012);

    const camera = new THREE.PerspectiveCamera(55, W / H, 1, 2000);
    camera.position.set(0, 90, 420);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.6, 800);
    pointLight.position.set(100, 200, 200);
    scene.add(pointLight);

    const COLORS = { healthy: 0x8a8a8a, infected: 0xff073a, wardA: 0x6496ff, wardB: 0xff9664, wardC: 0x96ff64, edge: 0x555555, edgeInfected: 0xff073a, particle: 0xff073a };

    const nodeData = [
        { id: 1, label: 'P0', ward: 'A', type: 'patient' }, { id: 2, label: 'S1', ward: 'A', type: 'staff' },
        { id: 3, label: 'S2', ward: 'B', type: 'staff' }, { id: 4, label: 'P3', ward: 'A', type: 'patient' },
        { id: 5, label: 'P4', ward: 'A', type: 'patient' }, { id: 6, label: 'P5', ward: 'B', type: 'patient' },
        { id: 7, label: 'P6', ward: 'B', type: 'patient' }, { id: 8, label: 'P7', ward: 'C', type: 'patient' },
        { id: 10, label: 'S3', ward: 'B', type: 'staff' }, { id: 9, label: 'P2', ward: 'A', type: 'patient' },
        { id: 11, label: 'S4', ward: 'A', type: 'staff' }, { id: 12, label: 'P10', ward: 'B', type: 'patient' },
        { id: 13, label: 'S5', ward: 'B', type: 'staff' }, { id: 14, label: 'P12', ward: 'B', type: 'patient' },
        { id: 15, label: 'P13', ward: 'B', type: 'patient' }, { id: 16, label: 'S6', ward: 'C', type: 'staff' },
        { id: 18, label: 'S7', ward: 'C', type: 'staff' }, { id: 19, label: 'P17', ward: 'C', type: 'patient' },
        { id: 20, label: 'P18', ward: 'C', type: 'patient' }, { id: 21, label: 'S8', ward: 'A', type: 'staff' },
        { id: 17, label: 'P15', ward: 'C', type: 'patient' }, { id: 22, label: 'P20', ward: 'A', type: 'patient' },
        { id: 23, label: 'P21', ward: 'A', type: 'patient' },
    ];

    const edgeData = [
        { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 2, to: 4 }, { from: 2, to: 5 },
        { from: 3, to: 6 }, { from: 3, to: 7 }, { from: 3, to: 8 }, { from: 6, to: 10 },
        { from: 10, to: 9 }, { from: 10, to: 11 }, { from: 10, to: 12 }, { from: 10, to: 13 },
        { from: 10, to: 14 }, { from: 10, to: 15 }, { from: 10, to: 16 }, { from: 10, to: 18 },
        { from: 18, to: 19 }, { from: 18, to: 20 }, { from: 9, to: 21 }, { from: 21, to: 22 },
        { from: 21, to: 23 }, { from: 16, to: 17 },
    ];

    const nodeMap = {};
    const wardCenters = { A: { x: -180, z: -80 }, B: { x: 0, z: 90 }, C: { x: 180, z: -40 } };

    nodeData.forEach(n => {
        const wc = wardCenters[n.ward];
        nodeMap[n.id] = { ...n, x: wc.x + (Math.random()-0.5)*100, y: (Math.random()-0.5)*80, z: wc.z + (Math.random()-0.5)*100, vx:0, vy:0, vz:0, infected: false, mesh: null, glow: null };
    });

    function simulateForces(iterations) {
        const nodes = Object.values(nodeMap);
        for (let iter = 0; iter < iterations; iter++) {
            for (let i = 0; i < nodes.length; i++) { for (let j = i+1; j < nodes.length; j++) { const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y, dz = nodes[i].z-nodes[j].z; const dist = Math.sqrt(dx*dx+dy*dy+dz*dz)+0.1; const force = 800/(dist*dist); nodes[i].vx += (dx/dist)*force; nodes[i].vy += (dy/dist)*force; nodes[i].vz += (dz/dist)*force; nodes[j].vx -= (dx/dist)*force; nodes[j].vy -= (dy/dist)*force; nodes[j].vz -= (dz/dist)*force; } }
            edgeData.forEach(e => { const a = nodeMap[e.from], b = nodeMap[e.to]; const dx = b.x-a.x, dy = b.y-a.y, dz = b.z-a.z; const dist = Math.sqrt(dx*dx+dy*dy+dz*dz)+0.1; const force = (dist-50)*0.04; a.vx += (dx/dist)*force; a.vy += (dy/dist)*force; a.vz += (dz/dist)*force; b.vx -= (dx/dist)*force; b.vy -= (dy/dist)*force; b.vz -= (dz/dist)*force; });
            nodes.forEach(n => { const wc = wardCenters[n.ward]; n.vx += (wc.x-n.x)*0.025; n.vz += (wc.z-n.z)*0.025; n.vy += (0-n.y)*0.012; });
            nodes.forEach(n => { n.vx *= 0.85; n.vy *= 0.85; n.vz *= 0.85; n.x += n.vx; n.y += n.vy; n.z += n.vz; });
        }
    }
    simulateForces(200);

    const wardConfig = { A: { color: COLORS.wardA, radius: 80 }, B: { color: COLORS.wardB, radius: 90 }, C: { color: COLORS.wardC, radius: 75 } };
    Object.entries(wardCenters).forEach(([ward, center]) => {
        const cfg = wardConfig[ward];
        const discGeo = new THREE.CircleGeometry(cfg.radius, 64);
        const discMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false });
        const disc = new THREE.Mesh(discGeo, discMat); disc.rotation.x = -Math.PI/2; disc.position.set(center.x, -45, center.z); scene.add(disc);
        const ringGeo = new THREE.RingGeometry(cfg.radius-1.5, cfg.radius, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false });
        const ring = new THREE.Mesh(ringGeo, ringMat); ring.rotation.x = -Math.PI/2; ring.position.set(center.x, -44.5, center.z); scene.add(ring);
    });

    function createWardLabel(text, color) {
        const c = document.createElement('canvas'); c.width = 256; c.height = 64;
        const cx = c.getContext('2d'); cx.font = '500 28px "JetBrains Mono", monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillStyle = '#' + new THREE.Color(color).getHexString(); cx.globalAlpha = 0.7; cx.fillText(text, 128, 32);
        const texture = new THREE.CanvasTexture(c);
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(mat); sprite.scale.set(80, 20, 1); return sprite;
    }
    Object.entries(wardCenters).forEach(([ward, center]) => { const label = createWardLabel('Ward ' + ward, wardConfig[ward].color); label.position.set(center.x, 55, center.z); scene.add(label); });

    const nodeMeshes = [], glowMeshes = [];
    Object.values(nodeMap).forEach(n => {
        const wardColor = COLORS['ward' + n.ward]; const isStaff = n.type === 'staff'; const size = n.id === 10 ? 7 : (isStaff ? 4.5 : 5);
        const geometry = isStaff ? new THREE.OctahedronGeometry(size, 0) : new THREE.SphereGeometry(size, 16, 16);
        const material = new THREE.MeshPhongMaterial({ color: COLORS.healthy, emissive: 0x111111, shininess: 60, transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(geometry, material); mesh.position.set(n.x, n.y, n.z);
        mesh.userData = { nodeId: n.id, label: n.label, ward: n.ward, type: n.type, wardColor }; scene.add(mesh); n.mesh = mesh; nodeMeshes.push(mesh);
        const glowGeo = new THREE.SphereGeometry(size * 2.5, 12, 12);
        const glowMat = new THREE.MeshBasicMaterial({ color: COLORS.infected, transparent: true, opacity: 0 });
        const glow = new THREE.Mesh(glowGeo, glowMat); glow.position.copy(mesh.position); scene.add(glow); n.glow = glow; glowMeshes.push(glow);
    });

    const edgeMeshes = [];
    edgeData.forEach(e => {
        const a = nodeMap[e.from], b = nodeMap[e.to];
        const points = [new THREE.Vector3(a.x, a.y, a.z), new THREE.Vector3(b.x, b.y, b.z)];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: COLORS.edge, transparent: true, opacity: 0.4 });
        const line = new THREE.Line(geometry, material); line.userData = { from: e.from, to: e.to }; scene.add(line); edgeMeshes.push(line);
    });

    const transmissionParticles = [];
    const SWARM_COUNT = 18; // particles per transmission
    function createTransmissionParticle(fromId, toId) {
        const a = nodeMap[fromId], b = nodeMap[toId];
        const from = new THREE.Vector3(a.x, a.y, a.z);
        const to = new THREE.Vector3(b.x, b.y, b.z);
        const swarm = [];
        for (let i = 0; i < SWARM_COUNT; i++) {
            const size = 0.4 + Math.random() * 0.8;
            const geo = new THREE.SphereGeometry(size, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ color: COLORS.particle, transparent: true, opacity: 0.8 + Math.random() * 0.2 });
            const mesh = new THREE.Mesh(geo, mat); mesh.position.copy(from); scene.add(mesh);
            // Each particle has its own offset, speed variation, and drift
            swarm.push({
                mesh, delay: i * 0.012 + Math.random() * 0.04,
                drift: new THREE.Vector3((Math.random()-0.5)*12, (Math.random()-0.5)*12, (Math.random()-0.5)*12),
                speedVar: 0.85 + Math.random() * 0.3,
                baseOpacity: 0.5 + Math.random() * 0.5
            });
        }
        // Add a faint glow line along the edge that builds up
        const edgeGlowGeo = new THREE.BufferGeometry().setFromPoints([from.clone(), from.clone()]);
        const edgeGlowMat = new THREE.LineBasicMaterial({ color: COLORS.particle, transparent: true, opacity: 0.15 });
        const edgeGlow = new THREE.Line(edgeGlowGeo, edgeGlowMat); scene.add(edgeGlow);
        transmissionParticles.push({ swarm, edgeGlow, edgeGlowGeo, from: from.clone(), to: to.clone(), progress: 0, targetId: toId, speed: 0.01 + Math.random() * 0.006 });
    }

    const infectedSet = new Set();
    let simQueue = [], simTimer = 0;
    const SIM_INTERVAL = 80;

    function resetSimulation() {
        infectedSet.clear();
        transmissionParticles.forEach(p => { p.swarm.forEach(s => scene.remove(s.mesh)); scene.remove(p.edgeGlow); }); transmissionParticles.length = 0;
        Object.values(nodeMap).forEach(n => { n.infected = false; n.mesh.material.color.setHex(COLORS.healthy); n.mesh.material.emissive.setHex(0x000000); n.glow.material.opacity = 0; });
        edgeMeshes.forEach(e => { e.material.color.setHex(COLORS.edge); e.material.opacity = 0.4; });
        simQueue = [];
        const visited = new Set(); const queue = [1]; visited.add(1); infectNode(1);
        while (queue.length > 0) { const current = queue.shift(); const downstream = edgeData.filter(e => e.from === current && !visited.has(e.to)); downstream.forEach(e => { visited.add(e.to); simQueue.push({ from: current, to: e.to }); queue.push(e.to); }); }
    }

    function infectNode(id) { const n = nodeMap[id]; if (!n) return; n.infected = true; infectedSet.add(id); n.mesh.material.color.setHex(COLORS.infected); n.mesh.material.emissive.setHex(0x7a031b); }
    resetSimulation();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredNode = null;

    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshes);
        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (hoveredNode !== obj) { if (hoveredNode) resetHighlight(); hoveredNode = obj; highlightConnections(obj.userData.nodeId); tooltip.style.display = 'block'; tooltip.textContent = `${obj.userData.label} (${obj.userData.type}) — Ward ${obj.userData.ward}`; }
            tooltip.style.left = (event.clientX - container.getBoundingClientRect().left + 12) + 'px';
            tooltip.style.top = (event.clientY - container.getBoundingClientRect().top - 12) + 'px';
            container.style.cursor = 'pointer';
        } else { if (hoveredNode) { resetHighlight(); hoveredNode = null; } tooltip.style.display = 'none'; container.style.cursor = 'default'; }
    });
    container.addEventListener('mouseleave', () => { if (hoveredNode) { resetHighlight(); hoveredNode = null; } tooltip.style.display = 'none'; });

    function highlightConnections(nodeId) {
        nodeMeshes.forEach(m => { m.material.opacity = 0.2; }); edgeMeshes.forEach(e => { e.material.opacity = 0.05; });
        const connectedIds = new Set([nodeId]); edgeData.forEach(e => { if (e.from === nodeId) connectedIds.add(e.to); if (e.to === nodeId) connectedIds.add(e.from); });
        nodeMeshes.forEach(m => { if (connectedIds.has(m.userData.nodeId)) m.material.opacity = 1; });
        edgeMeshes.forEach(e => { if (e.userData.from === nodeId || e.userData.to === nodeId) { e.material.opacity = 0.8; e.material.color.setHex(0xffffff); } });
    }

    function resetHighlight() {
        nodeMeshes.forEach(m => { m.material.opacity = 0.9; });
        edgeMeshes.forEach(e => { const fi = nodeMap[e.userData.from].infected, ti = nodeMap[e.userData.to].infected; if (fi && ti) { e.material.color.setHex(COLORS.edgeInfected); e.material.opacity = 0.5; } else { e.material.color.setHex(COLORS.edge); e.material.opacity = 0.4; } });
    }

    let time = 0, orbitAngle = 0;
    function animateViz() {
        requestAnimationFrame(animateViz);
        time++; orbitAngle += 0.002;
        camera.position.x = Math.sin(orbitAngle) * 420;
        camera.position.z = Math.cos(orbitAngle) * 420;
        camera.position.y = 90 + Math.sin(orbitAngle * 0.5) * 40;
        camera.lookAt(0, 0, 0);
        nodeMeshes.forEach(m => { const s = 1 + Math.sin(time * 0.03 + m.userData.nodeId) * 0.05; m.scale.set(s, s, s); });
        glowMeshes.forEach((g, i) => { const n = Object.values(nodeMap)[i]; if (n.infected) { g.material.opacity = 0.12 + Math.sin(time * 0.05 + n.id) * 0.06; g.position.copy(n.mesh.position); } else { g.material.opacity = 0; } });
        simTimer++;
        if (simTimer > SIM_INTERVAL && simQueue.length > 0) {
            simTimer = 0;
            const next = simQueue[0];
            if (next.from === 10) { const batch = []; while (simQueue.length > 0 && simQueue[0].from === 10) batch.push(simQueue.shift()); batch.forEach(t => createTransmissionParticle(t.from, t.to)); }
            else { simQueue.shift(); createTransmissionParticle(next.from, next.to); }
        }
        if (simQueue.length === 0 && transmissionParticles.length === 0 && infectedSet.size > 1) { simTimer = -200; if (simTimer === -200) { setTimeout(() => resetSimulation(), 4000); simQueue.push({}); } }
        for (let i = transmissionParticles.length - 1; i >= 0; i--) {
            const p = transmissionParticles[i]; p.progress += p.speed;
            // Check if all particles have arrived
            const allArrived = p.progress >= 1.15;
            if (allArrived) {
                infectNode(p.targetId);
                edgeData.forEach((ed, idx) => { if ((ed.from === p.targetId || ed.to === p.targetId) && nodeMap[ed.from].infected && nodeMap[ed.to].infected) { edgeMeshes[idx].material.color.setHex(COLORS.edgeInfected); edgeMeshes[idx].material.opacity = 0.5; } });
                p.swarm.forEach(s => scene.remove(s.mesh));
                scene.remove(p.edgeGlow); transmissionParticles.splice(i, 1); continue;
            }
            // Update edge glow line to show progress
            const glowEnd = new THREE.Vector3().lerpVectors(p.from, p.to, Math.min(p.progress * 1.1, 1));
            const glowPositions = p.edgeGlowGeo.attributes.position.array;
            glowPositions[3] = glowEnd.x; glowPositions[4] = glowEnd.y; glowPositions[5] = glowEnd.z;
            p.edgeGlowGeo.attributes.position.needsUpdate = true;
            p.edgeGlow.material.opacity = 0.2 + Math.sin(time * 0.1) * 0.05;
            // Animate each swarm particle
            p.swarm.forEach(s => {
                const particleProgress = Math.max(0, Math.min(1, (p.progress - s.delay) * s.speedVar));
                if (particleProgress <= 0) { s.mesh.visible = false; return; }
                s.mesh.visible = true;
                const basePos = new THREE.Vector3().lerpVectors(p.from, p.to, particleProgress);
                // Add arc and drift
                const arcHeight = Math.sin(particleProgress * Math.PI) * 12;
                basePos.y += arcHeight;
                // Drift diminishes as particle approaches target
                const driftScale = Math.sin(particleProgress * Math.PI) * 0.8;
                basePos.x += s.drift.x * driftScale;
                basePos.y += s.drift.y * driftScale;
                basePos.z += s.drift.z * driftScale;
                s.mesh.position.copy(basePos);
                // Fade: bright in middle, fade at arrival
                const fadeIn = Math.min(1, particleProgress * 4);
                const fadeOut = particleProgress > 0.8 ? 1 - (particleProgress - 0.8) / 0.2 : 1;
                s.mesh.material.opacity = s.baseOpacity * fadeIn * fadeOut;
                // Slight pulse
                const pulse = 1 + Math.sin(time * 0.15 + s.delay * 20) * 0.15;
                s.mesh.scale.setScalar(pulse);
            });
        }
        renderer.render(scene, camera);
    }
    animateViz();

    window.addEventListener('resize', () => {
        const w = container.clientWidth, h = container.clientHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    });
})();
