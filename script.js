window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
    }, 600);
  }
});

const heroCard = document.querySelector('.hero-card');

if (heroCard) {
  heroCard.addEventListener('pointermove', (event) => {
    const bounds = heroCard.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    heroCard.querySelector('.hero-image').style.transform = `scale(1.03) translate(${x * -4}px, ${y * -3}px)`;
  });

  heroCard.addEventListener('pointerleave', () => {
    heroCard.querySelector('.hero-image').style.transform = 'scale(1.015)';
  });
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
  const bounds = projectsCard.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / bounds.height));
  const skillsEntering = skillsCard.getBoundingClientRect().top < window.innerHeight * 0.6;
  projectsCard.style.setProperty('--reveal', progress.toFixed(3));
  projectsCard.style.setProperty('--project-depth', (progress * 72).toFixed(2) + 'px');
  projectsCard.style.backgroundColor = `rgb(${Math.round(progress * 255)}, ${Math.round(progress * 255)}, ${Math.round(progress * 255)})`;
  projectsCard.querySelector('h2').style.color = `rgb(${Math.round((1 - progress) * 255)}, ${Math.round((1 - progress) * 255)}, ${Math.round((1 - progress) * 255)})`;
  const whiteProjectState = progress >= 0.995 && !skillsEntering;
  document.body.classList.toggle('projects-finished', whiteProjectState);
  document.documentElement.classList.toggle('projects-finished', whiteProjectState);
}

function updateSkillsTransition() {
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

document.querySelectorAll('.wordmark, .footer-brand').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const terminalCard = document.getElementById('terminal');
if (terminalCard) {
  const terminalObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !terminalCard.dataset.started) {
      terminalCard.dataset.started = 'true';
      startTerminalAnimation();
    }
  }, { threshold: 0.5 });
  terminalObserver.observe(terminalCard);
}

async function startTerminalAnimation() {
  const container = document.getElementById('terminal-typewriter');
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const commands = [
    { cmd: "whoami", out: "chayharjit" },
    { cmd: "cat bio.md", out: "Ethical hacker and AI builder. Crafting the future with secure, intelligent systems." },
    { cmd: "cat skills.txt", out: "Artificial Intelligence, Cyber Security, Machine Learning, Python, Linux" },
    { cmd: "cat projects.md", out: "LearnSub, Conduct AI, Agrochemicals Predictor, Xaminr" },
    { cmd: "cat contact.md", out: "GitHub: chay-harjit | LinkedIn: chayharjit | X: chayharjit" }
  ];
  
  for (let i = 0; i < commands.length; i++) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="terminal-prompt">root@chay:~#</span> <span class="typing-text"></span><span class="terminal-cursor"></span>`;
    container.appendChild(line);
    
    const textSpan = line.querySelector('.typing-text');
    const cursor = line.querySelector('.terminal-cursor');
    
    for (let char of commands[i].cmd) {
      textSpan.textContent += char;
      await delay(Math.random() * 25 + 15);
    }
    
    await delay(200);
    cursor.style.display = 'none';
    
    const outputLine = document.createElement('span');
    outputLine.className = 'terminal-output';
    outputLine.textContent = commands[i].out;
    container.appendChild(outputLine);
    
    container.scrollTop = container.scrollHeight;
    await delay(350);
  }
  
  createInteractivePrompt(container);
  
  // Allow clicking anywhere to focus input
  container.parentElement.addEventListener('click', () => {
    const input = document.querySelector('.terminal-input');
    if (input) input.focus();
  });
}

function createInteractivePrompt(container) {
  const line = document.createElement('div');
  line.className = 'terminal-line terminal-input-wrapper';
  line.innerHTML = `<span class="terminal-prompt">root@chay:~#</span> <input type="text" class="terminal-input" autocomplete="off" spellcheck="false" autofocus />`;
  container.appendChild(line);
  
  const input = line.querySelector('.terminal-input');
  input.focus();
  container.scrollTop = container.scrollHeight;
  
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const val = this.value.trim();
      
      // Convert input to static text
      this.parentElement.innerHTML = `<span class="terminal-prompt">root@chay:~#</span> <span style="color:#00ff00">${this.value}</span>`;
      
      if (val) {
        processCommand(val, container);
      } else {
        createInteractivePrompt(container);
      }
    }
  });
}

function processCommand(cmd, container) {
  const outputLine = document.createElement('span');
  outputLine.className = 'terminal-output';
  
  const args = cmd.split(' ').filter(Boolean);
  const command = args[0].toLowerCase();
  
  const harmful = ['rm', 'sudo', 'su', 'mkfs', 'fdisk', 'reboot', 'shutdown', 'chmod', 'chown', 'del'];
  
  if (harmful.includes(command)) {
    outputLine.textContent = `bash: ${command}: permission denied. Nice try, hacker! 😉`;
  } else if (command === 'help') {
    outputLine.textContent = `Available commands: help, whoami, clear, ls, cat, date, echo, pwd`;
  } else if (command === 'clear') {
    container.innerHTML = '';
    createInteractivePrompt(container);
    return;
  } else if (command === 'whoami') {
    outputLine.textContent = 'chayharjit';
  } else if (command === 'pwd') {
    outputLine.textContent = '/home/chayharjit';
  } else if (command === 'ls') {
    outputLine.textContent = 'bio.md  contact.md  projects.md  skills.txt';
  } else if (command === 'date') {
    outputLine.textContent = new Date().toString();
  } else if (command === 'echo') {
    outputLine.textContent = args.slice(1).join(' ');
  } else if (command === 'cat') {
    const file = args[1];
    if (!file) outputLine.textContent = 'cat: missing file operand';
    else if (file === 'bio.md') outputLine.textContent = 'Ethical hacker and AI builder. Crafting the future with secure, intelligent systems.';
    else if (file === 'skills.txt') outputLine.textContent = 'Artificial Intelligence, Cyber Security, Machine Learning, Python, Linux';
    else if (file === 'projects.md') outputLine.textContent = 'LearnSub, Conduct AI, Agrochemicals Predictor, Xaminr';
    else if (file === 'contact.md') outputLine.textContent = 'GitHub: chay-harjit | LinkedIn: chayharjit | X: chayharjit';
    else outputLine.textContent = `cat: ${file}: No such file or directory`;
  } else {
    outputLine.textContent = `bash: ${command}: command not found`;
  }
  
  container.appendChild(outputLine);
  createInteractivePrompt(container);
}

