// ─────────────────────────────────────────────────────────────
// HERO: Floating coffee beans + steam particles (Three.js)
// ─────────────────────────────────────────────────────────────
(function initHero() {
    const canvas = document.getElementById('canvas-hero');
    const W = window.innerWidth, H = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    cam.position.set(0, 0, 14);

    // Lights
    scene.add(new THREE.AmbientLight(0xc4813a, 0.6));
    const pL1 = new THREE.PointLight(0xd4a96a, 3, 40);
    pL1.position.set(5, 5, 5);
    scene.add(pL1);
    const pL2 = new THREE.PointLight(0x3b1f0c, 2, 30);
    pL2.position.set(-6, -3, 3);
    scene.add(pL2);

    // Coffee beans (ellipsoid approximation)
    const beans = [];
    const beanGeo = new THREE.SphereGeometry(0.18, 10, 8);
    beanGeo.scale(1, 0.6, 0.5);
    for (let i = 0; i < 60; i++) {
        const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.06, 0.7, 0.15 + Math.random() * 0.2),
            roughness: 0.6, metalness: 0.1
        });
        const bean = new THREE.Mesh(beanGeo, mat);
        bean.position.set(
            (Math.random() - 0.5) * 28,
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 8 - 4
        );
        bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        bean.userData = {
            vx: (Math.random() - 0.5) * 0.008,
            vy: (Math.random() - 0.5) * 0.008,
            vz: (Math.random() - 0.5) * 0.003,
            rx: (Math.random() - 0.5) * 0.01,
            ry: (Math.random() - 0.5) * 0.01,
        };
        scene.add(bean);
        beans.push(bean);
    }

    // Steam particles
    const steamCount = 200;
    const steamGeo = new THREE.BufferGeometry();
    const steamPos = new Float32Array(steamCount * 3);
    const steamVel = [];
    for (let i = 0; i < steamCount; i++) {
        steamPos[i * 3] = (Math.random() - 0.5) * 20;
        steamPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
        steamPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
        steamVel.push({ vy: 0.01 + Math.random() * 0.02 });
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPos, 3));
    const steamMat = new THREE.PointsMaterial({
        color: 0xd4a96a, size: 0.08, transparent: true, opacity: 0.3
    });
    const steam = new THREE.Points(steamGeo, steamMat);
    scene.add(steam);

    // Large bg torus (decorative)
    const bgTorus = new THREE.Mesh(
        new THREE.TorusGeometry(7, 0.04, 8, 120),
        new THREE.MeshBasicMaterial({ color: 0xc4813a, transparent: true, opacity: 0.07 })
    );
    scene.add(bgTorus);
    const bgTorus2 = new THREE.Mesh(
        new THREE.TorusGeometry(11, 0.02, 8, 160),
        new THREE.MeshBasicMaterial({ color: 0xd4a96a, transparent: true, opacity: 0.04 })
    );
    scene.add(bgTorus2);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);
    });

    let t = 0;
    function loop() {
        requestAnimationFrame(loop);
        t += 0.005;

        beans.forEach((b, i) => {
            b.position.x += b.userData.vx + mouseX * 0.004;
            b.position.y += b.userData.vy - mouseY * 0.003;
            b.rotation.x += b.userData.rx;
            b.rotation.y += b.userData.ry;
            // wrap
            if (b.position.x > 15) b.position.x = -15;
            if (b.position.x < -15) b.position.x = 15;
            if (b.position.y > 10) b.position.y = -10;
            if (b.position.y < -10) b.position.y = 10;
        });

        // Steam rise
        const sp = steamGeo.attributes.position.array;
        for (let i = 0; i < steamCount; i++) {
            sp[i * 3 + 1] += steamVel[i].vy;
            sp[i * 3] += Math.sin(t + i) * 0.003;
            if (sp[i * 3 + 1] > 9) {
                sp[i * 3 + 1] = -9;
                sp[i * 3] = (Math.random() - 0.5) * 20;
            }
        }
        steamGeo.attributes.position.needsUpdate = true;

        bgTorus.rotation.x = t * 0.2;
        bgTorus.rotation.y = t * 0.15;
        bgTorus2.rotation.x = -t * 0.1;
        bgTorus2.rotation.z = t * 0.08;

        cam.position.x += (mouseX * 1.5 - cam.position.x) * 0.04;
        cam.position.y += (-mouseY * 1.0 - cam.position.y) * 0.04;
        cam.lookAt(0, 0, 0);

        pL1.position.x = Math.sin(t * 0.7) * 8;
        pL1.position.y = Math.cos(t * 0.5) * 6;

        renderer.render(scene, cam);
    }
    loop();

    window.addEventListener('resize', () => {
        const W = window.innerWidth, H = window.innerHeight;
        cam.aspect = W / H; cam.updateProjectionMatrix();
        renderer.setSize(W, H);
    });
})();

// ─────────────────────────────────────────────────────────────
// MENU BG: Rotating coffee ring particle system
// ─────────────────────────────────────────────────────────────
(function initMenu() {
    const canvas = document.getElementById('canvas-menu');
    const sect = document.getElementById('menu');
    const W = sect.offsetWidth, H = sect.offsetHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    cam.position.z = 8;

    // Ring of particles
    const count = 3000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = 3.5 + (Math.random() - 0.5) * 1.5;
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = Math.sin(angle) * r + (Math.random() - 0.5) * 2;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
        const t = Math.random();
        pos[i * 3] += (Math.random() - 0.5) * 0.5;
        col[i * 3] = 0.77 + t * 0.2;
        col[i * 3 + 1] = 0.51 + t * 0.15;
        col[i * 3 + 2] = 0.23 - t * 0.1;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.6 });
    const ring = new THREE.Points(geo, mat);
    scene.add(ring);

    // Center glow sphere
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x3b1f0c, transparent: true, opacity: 0.5 })
    );
    scene.add(glow);

    let t = 0;
    function loop() {
        requestAnimationFrame(loop);
        t += 0.004;
        ring.rotation.z = t * 0.3;
        ring.rotation.x = Math.sin(t * 0.2) * 0.3;
        glow.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
        renderer.render(scene, cam);
    }
    loop();
})();

// ─────────────────────────────────────────────────────────────
// CONTACT: 3D cup wireframe
// ─────────────────────────────────────────────────────────────
(function initContact() {
    const canvas = document.getElementById('canvas-contact');
    const W = canvas.parentElement.offsetWidth;
    const H = 400;
    canvas.width = W; canvas.height = H;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x1a0a02, 1);

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    cam.position.set(0, 1, 7);
    cam.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xc4813a, 0.8));
    const pL = new THREE.PointLight(0xd4a96a, 4, 20);
    pL.position.set(3, 4, 3);
    scene.add(pL);
    const pL2 = new THREE.PointLight(0x3b1f0c, 2, 15);
    pL2.position.set(-3, -2, 2);
    scene.add(pL2);

    // Cup body (cylinder)
    const cupGeo = new THREE.CylinderGeometry(1.2, 0.9, 2.2, 32, 1, true);
    const cupMat = new THREE.MeshStandardMaterial({
        color: 0xc4813a, roughness: 0.3, metalness: 0.6, side: THREE.DoubleSide
    });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    scene.add(cup);

    // Cup bottom disc
    const bottom = new THREE.Mesh(
        new THREE.CircleGeometry(0.9, 32),
        cupMat
    );
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -1.1;
    scene.add(bottom);

    // Wireframe overlay
    const cupWire = new THREE.Mesh(cupGeo, new THREE.MeshBasicMaterial({
        color: 0xd4a96a, wireframe: true, transparent: true, opacity: 0.12
    }));
    scene.add(cupWire);

    // Handle (torus)
    const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.08, 8, 24, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xc4813a, roughness: 0.3, metalness: 0.6 })
    );
    handle.position.set(1.2, 0, 0);
    handle.rotation.y = Math.PI / 2;
    handle.rotation.z = Math.PI / 2;
    scene.add(handle);

    // Saucer
    const saucer = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.6, 0.12, 32),
        new THREE.MeshStandardMaterial({ color: 0xb07030, roughness: 0.4, metalness: 0.5 })
    );
    saucer.position.y = -1.3;
    scene.add(saucer);

    // Coffee surface (top circle)
    const coffee = new THREE.Mesh(
        new THREE.CircleGeometry(1.15, 32),
        new THREE.MeshStandardMaterial({ color: 0x2a0e02, roughness: 0.8 })
    );
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 1.0;
    scene.add(coffee);

    // Foam swirl (ring)
    const foam = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.09, 6, 40),
        new THREE.MeshBasicMaterial({ color: 0xf5ede0, transparent: true, opacity: 0.7 })
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.y = 1.05;
    scene.add(foam);

    // Steam particles
    const stCount = 80;
    const stGeo = new THREE.BufferGeometry();
    const stPos = new Float32Array(stCount * 3);
    const stAge = [];
    for (let i = 0; i < stCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.8;
        stPos[i * 3] = Math.cos(a) * r * 0.6;
        stPos[i * 3 + 1] = 1 + Math.random() * 2;
        stPos[i * 3 + 2] = Math.sin(a) * r * 0.6;
        stAge.push(Math.random());
    }
    stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
    const stMat = new THREE.PointsMaterial({ color: 0xfdf6ec, size: 0.06, transparent: true, opacity: 0.35 });
    const stPoints = new THREE.Points(stGeo, stMat);
    scene.add(stPoints);

    let t = 0;
    function loop() {
        requestAnimationFrame(loop);
        t += 0.008;
        const group = [cup, cupWire, handle, saucer, coffee, foam, stPoints, bottom];
        group.forEach(m => {
            m.rotation.y = Math.sin(t * 0.4) * 0.5;
        });

        // animate steam
        const sp2 = stGeo.attributes.position.array;
        for (let i = 0; i < stCount; i++) {
            stAge[i] += 0.005;
            sp2[i * 3 + 1] += 0.015;
            sp2[i * 3] += Math.sin(t + i * 0.5) * 0.003;
            if (sp2[i * 3 + 1] > 3.5) {
                const a = Math.random() * Math.PI * 2;
                const r = Math.random() * 0.6;
                sp2[i * 3] = Math.cos(a) * r;
                sp2[i * 3 + 1] = 1.0;
                sp2[i * 3 + 2] = Math.sin(a) * r;
                stAge[i] = 0;
            }
        }
        stGeo.attributes.position.needsUpdate = true;

        foam.rotation.z = t * 0.4;
        pL.position.x = Math.sin(t) * 4;
        pL.position.z = Math.cos(t) * 4;

        renderer.render(scene, cam);
    }
    loop();
})();

// ─────────────────────────────────────────────────────────────
// NAV SCROLL
// ─────────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ─────────────────────────────────────────────────────────────
// TESTIMONIAL SLIDER
// ─────────────────────────────────────────────────────────────
let slide = 0;
const total = 3;
function updateSlider() {
    document.getElementById('testiTrack').style.transform = `translateX(-${slide * 100}%)`;
    document.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === slide));
}
function changeSlide(dir) {
    slide = (slide + dir + total) % total;
    updateSlider();
}
function goSlide(i) {
    slide = i; updateSlider();
}
// auto
setInterval(() => changeSlide(1), 5000);

// ─────────────────────────────────────────────────────────────
// REVEAL ON SCROLL
// ─────────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));