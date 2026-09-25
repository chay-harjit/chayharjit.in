const topbar = document.querySelector('.topbar');
const updateTopbar = () => {
  if (window.scrollY > 40) {
    topbar.classList.add('is-scrolled');
  } else {
    topbar.classList.remove('is-scrolled');
  }
};
window.addEventListener('scroll', updateTopbar, { passive: true });
updateTopbar();

window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';

      const path = window.location.pathname.substring(1).replace(/\/$/, '');
      if (path) {
        const target = document.getElementById(path);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 600);
  }
});

const heroCard = document.querySelector('.hero-card');

if (heroCard) {
  const heroImage = heroCard.querySelector('.hero-image');

  if (heroImage) {
    heroCard.addEventListener('pointermove', (event) => {
      const bounds = heroCard.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      heroImage.style.transform = `scale(1.03) translate(${x * -4}px, ${y * -3}px)`;
    });

    heroCard.addEventListener('pointerleave', () => {
      heroImage.style.transform = 'scale(1.015)';
    });
  }
}

const projectsCard = document.querySelector('.projects-card');
const skillsCard = document.querySelector('.skills-card');

if (window.THREE && document.getElementById('scroll-canvas') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const canvas = document.getElementById('scroll-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03060d, 0.038);

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 150);
  camera.position.set(0, 0, 10);

  const ambientLight = new THREE.AmbientLight(0x8bc9ff, 0.65);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x76e8ff, 16, 35, 2);
  keyLight.position.set(3, 4, 6);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xcb7fff, 13, 28, 2);
  rimLight.position.set(-4, -2, -20);
  scene.add(rimLight);

  const tunnel = new THREE.Group();
  scene.add(tunnel);

  const gateways = [];
  const gatewayGeometry = new THREE.TorusGeometry(4.9, 0.028, 8, 96);
  for (let i = 0; i < 19; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: i % 2 ? 0x8ee7ff : 0xdb9dff,
      transparent: true,
      opacity: 0.48
    });
    const gateway = new THREE.Mesh(gatewayGeometry, material);
    gateway.position.set(Math.sin(i * 1.7) * 0.4, Math.cos(i * 1.25) * 0.3, -i * 4.2);
    gateway.rotation.z = i * 0.47;
    gateway.userData = { spin: i % 2 ? 0.13 : -0.1, baseX: gateway.position.x, baseY: gateway.position.y };
    tunnel.add(gateway);
    gateways.push(gateway);
  }

  const nodeGeometry = new THREE.OctahedronGeometry(0.17, 0);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xb9f4ff, transparent: true, opacity: 0.75 });
  const nodes = [];
  for (let i = 0; i < 64; i++) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
    const angle = i * 2.399;
    const radius = 5.5 + (i % 5) * 0.52;
    node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.62, -2 - i * 1.25);
    node.material.color.setHex(i % 3 === 0 ? 0xe3a6ff : 0x8ee7ff);
    node.userData = { angle, radius, offset: i * 0.37 };
    tunnel.add(node);
    nodes.push(node);
  }

  const starPositions = new Float32Array(360 * 3);
  for (let i = 0; i < 360; i++) {
    const angle = i * 2.4;
    const radius = 3.8 + (i % 13) * 0.42;
    starPositions[i * 3] = Math.cos(angle) * radius;
    starPositions[i * 3 + 1] = Math.sin(angle) * radius * 0.67;
    starPositions[i * 3 + 2] = -i * 0.22;
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0x89dfff, size: 0.035, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false }));
  tunnel.add(stars);

  let scrollRatio = 0;
  let cameraZ = 10;

  function syncScrollRatio() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function animate() {
    const t = performance.now() * 0.001;

    syncScrollRatio();

    const targetZ = 10 - scrollRatio * 76;
    cameraZ += (targetZ - cameraZ) * 0.075;
    camera.position.set(Math.sin(cameraZ * 0.12) * 0.72, Math.cos(cameraZ * 0.09) * 0.42, cameraZ);
    camera.lookAt(Math.sin(cameraZ * 0.12 + 0.45) * 0.2, Math.cos(cameraZ * 0.09 + 0.45) * 0.16, cameraZ - 12);

    gateways.forEach((gateway, index) => {
      gateway.rotation.z += gateway.userData.spin * 0.01;
      gateway.position.x = gateway.userData.baseX + Math.sin(t * 0.7 + index) * 0.16;
      gateway.position.y = gateway.userData.baseY + Math.cos(t * 0.6 + index) * 0.12;
    });
    nodes.forEach((node) => {
      node.rotation.x = t * 0.8 + node.userData.offset;
      node.rotation.y = t * 1.15 + node.userData.offset;
      node.position.x = Math.cos(node.userData.angle + t * 0.08) * node.userData.radius;
      node.position.y = Math.sin(node.userData.angle + t * 0.08) * node.userData.radius * 0.62;
    });
    stars.rotation.z = t * 0.018;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', syncScrollRatio, { passive: true });

  animate();
}

function updateProjectsReveal() {
  if (!projectsCard || !skillsCard) return;
  const bounds = projectsCard.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / bounds.height));
  const skillsEntering = skillsCard.getBoundingClientRect().top < window.innerHeight * 0.6;
  projectsCard.style.setProperty('--reveal', progress.toFixed(3));
  projectsCard.style.setProperty('--project-depth', (progress * 72).toFixed(2) + 'px');
  projectsCard.style.backgroundColor = `rgb(${Math.round(progress * 255)}, ${Math.round(progress * 255)}, ${Math.round(progress * 255)})`;

  const heading = projectsCard.querySelector('h2');
  if (heading) {
    heading.style.color = `rgb(${Math.round((1 - progress) * 255)}, ${Math.round((1 - progress) * 255)}, ${Math.round((1 - progress) * 255)})`;
  }

  const whiteProjectState = progress >= 0.995 && !skillsEntering;
  document.body.classList.toggle('projects-finished', whiteProjectState);
  document.documentElement.classList.toggle('projects-finished', whiteProjectState);
}

function updateSkillsTransition() {
  if (!skillsCard) return;
  const bounds = skillsCard.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / window.innerHeight));
  skillsCard.style.setProperty('--skill-progress', progress.toFixed(3));
}

window.addEventListener('scroll', updateProjectsReveal, { passive: true });
window.addEventListener('resize', updateProjectsReveal);
window.addEventListener('scroll', updateSkillsTransition, { passive: true });
window.addEventListener('resize', updateSkillsTransition);
updateProjectsReveal();
updateSkillsTransition();

const projectBoxObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  });
}, { threshold: 0.18 });

document.querySelectorAll('.project-box').forEach((box) => projectBoxObserver.observe(box));

const footerCard = document.querySelector('.footer-card');
if (footerCard) {
  const footerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => document.body.classList.toggle('footer-in-view', entry.isIntersecting));
  }, { threshold: 0.12 });
  footerObserver.observe(footerCard);
}



document.querySelectorAll('.nav-links a').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetPath = this.getAttribute('href');

    if (!targetPath) return;

    try {
      const newUrl = targetPath.startsWith('#') ? '/' + targetPath.substring(1) : targetPath;
      history.pushState(null, null, newUrl);
    } catch (err) { }

    let targetId = null;
    if (targetPath.startsWith('#')) {
      targetId = targetPath.substring(1);
    } else if (targetPath.startsWith('/')) {
      targetId = targetPath.substring(1);
    }

    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});



// Lightbox Gallery
const lightbox = document.getElementById('lightbox');
let currentGallery = [];
let currentIndex = 0;

if (lightbox) {
  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const btnClose = lightbox.querySelector('.lightbox-close');
  const btnPrev = lightbox.querySelector('.lightbox-prev');
  const btnNext = lightbox.querySelector('.lightbox-next');

  window.openLightbox = (items, index = 0) => {
    if (!items || items.length === 0) return;
    currentGallery = items;
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const updateLightboxContent = () => {
    const item = currentGallery[currentIndex];
    lbImg.src = item.src;
    lbCaption.innerHTML = item.caption || '';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const showNext = (e) => {
    if (e) e.stopPropagation();
    if (currentGallery.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateLightboxContent();
  };

  const showPrev = (e) => {
    if (e) e.stopPropagation();
    if (currentGallery.length <= 1) return;
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightboxContent();
  };

  if (btnClose) btnClose.addEventListener('click', closeLightbox);
  if (btnNext) btnNext.addEventListener('click', showNext);
  if (btnPrev) btnPrev.addEventListener('click', showPrev);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || (e.target.classList && e.target.classList.contains('lightbox-content'))) {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Attach to certificates
  const certificateItems = document.querySelectorAll('.certificate-item');
  if (certificateItems.length > 0) {
    const certData = Array.from(certificateItems).map(item => {
      const img = item.querySelector('img');
      const figcaption = item.querySelector('figcaption');
      return {
        src: img ? img.src : '',
        caption: figcaption ? figcaption.innerHTML : ''
      };
    });
    certificateItems.forEach((item, index) => {
      item.addEventListener('click', () => window.openLightbox(certData, index));
    });
  }
}

// Link Modal Logic
const linkModal = document.getElementById('link-modal');
if (linkModal) {
  const linkModalBtn = document.getElementById('link-modal-btn');
  const linkModalSecondaryBtn = document.getElementById('link-modal-secondary-btn');
  const linkModalClose = linkModal.querySelector('.link-modal-close');
  const linkModalOverlay = linkModal.querySelector('.link-modal-overlay');

  const openLinkModal = (url, secondaryUrl) => {
    linkModalBtn.href = url;
    if (secondaryUrl) {
      linkModalSecondaryBtn.href = secondaryUrl;
      linkModalSecondaryBtn.style.display = 'inline-flex';
    } else {
      linkModalSecondaryBtn.style.display = 'none';
    }
    linkModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeLinkModal = () => {
    linkModal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (linkModalBtn) linkModalBtn.href = '#';
      if (linkModalSecondaryBtn) linkModalSecondaryBtn.href = '#';
    }, 300);
  };

  document.querySelectorAll('.learnsub-btn, .task-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.getAttribute('href');
      const secondaryUrl = btn.getAttribute('data-secondary-url');
      if (url && url !== '#') {
        openLinkModal(url, secondaryUrl);
      }
    });
  });

  if (linkModalSecondaryBtn) {
    linkModalSecondaryBtn.addEventListener('click', (e) => {
      const href = linkModalSecondaryBtn.getAttribute('href');
      if (href === '#gallery-phi4') {
        e.preventDefault();
        closeLinkModal();
        if (window.openLightbox) {
          window.openLightbox([
            { src: 'source/image/img1.jpg', caption: '<span>Phi-4-Reasoning 14B</span> Image 1' },
            { src: 'source/image/img2.jpg', caption: '<span>Phi-4-Reasoning 14B</span> Image 2' }
          ], 0);
        }
      } else if (href === '#gallery-wireless') {
        e.preventDefault();
        closeLinkModal();
        if (window.openLightbox) {
          window.openLightbox([
            { src: 'source/image/img3.jpg', caption: '<span>Wireless Security Assessment</span> Image 1' },
            { src: 'source/image/img4.jpg', caption: '<span>Wireless Security Assessment</span> Image 2' },
            { src: 'source/image/img5.jpg', caption: '<span>Wireless Security Assessment</span> Image 3' },
            { src: 'source/image/img6.jpg', caption: '<span>Wireless Security Assessment</span> Image 4' },
            { src: 'source/image/img7.jpg', caption: '<span>Wireless Security Assessment</span> Image 5' },
            { src: 'source/image/img8.jpg', caption: '<span>Wireless Security Assessment</span> Image 6' }
          ], 0);
        }
      } else if (href === '#gallery-hamster') {
        e.preventDefault();
        closeLinkModal();
        if (window.openLightbox) {
          window.openLightbox([
            { src: 'source/image/img9.jpg', caption: '<span>Hamster Object Detection</span> Image 1' },
            { src: 'source/image/img10.jpg', caption: '<span>Hamster Object Detection</span> Image 2' },
            { src: 'source/image/img11.jpg', caption: '<span>Hamster Object Detection</span> Image 3' },
            { src: 'source/image/img12.jpg', caption: '<span>Hamster Object Detection</span> Image 4' }
          ], 0);
        }
      }
    });
  }

  if (linkModalClose) linkModalClose.addEventListener('click', closeLinkModal);
  if (linkModalOverlay) linkModalOverlay.addEventListener('click', closeLinkModal);

  window.addEventListener('keydown', (e) => {
    if (linkModal.classList.contains('is-open') && e.key === 'Escape') {
      closeLinkModal();
    }
  });
}
