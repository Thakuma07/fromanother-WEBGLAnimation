import gsap from "gsap";
import SplitType from "split-type";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { slides } from "./slides.js";


// gsap.registerPlugin(SplitText); // Removed as SplitType doesn't need registration

let currentIndex = 0;
let isTransitioning = false;
let rippleTween = null;

const slider = document.querySelector(".slider");

function splitTitle(container) {
    const heading = container.querySelector(".slide-title h1");
    if (!heading) return null;

    return new SplitType(heading, {
        types: "words, chars",
        wordClass: "word",
        charClass: "char",
    });
}

function splitDescription(container) {
    const paragraphs = container.querySelectorAll(".slide-description p");
    const allLines = [];

    paragraphs.forEach((p) => {
        const split = new SplitType(p, {
            types: "lines",
            lineClass: "line",
        });
        allLines.push(...split.lines);
    });

    return allLines;
}

function buildSlideContent(slide) {
    const el = document.createElement("div");
    el.className = "slide-content";
    el.style.opacity = "0";

    el.innerHTML = `
    <div class="slide-title"><h1>${slide.title}</h1></div>
    <div class="slide-description">
        <p>${slide.description}</p>
    </div>
    `;

    return el;
}

function animateTextOut(container) {
    const titleSplit = splitTitle(container);
    const lines = splitDescription(container);

    const tl = gsap.timeline();

    if (titleSplit) {
        tl.to(titleSplit.chars, {
            y: "-100%",
            duration: 0.6,
            stagger: 0.02,
            ease: "power2.inOut",
        });
    }

    tl.to(
        lines,
        { y: "-100%", duration: 0.6, stagger: 0.02, ease: "power2.inOut" },
        0.1,
    );

    return tl;
}

function animateTextIn(container) {
    const titleSplit = splitTitle(container);
    const lines = splitDescription(container);

    const chars = titleSplit ? titleSplit.chars : [];

    gsap.set([chars, lines], { y: "100%" });
    gsap.set(container, { opacity: 1 });

    return gsap
        .timeline()
        .to(chars, {
            y: "0%",
            duration: 0.5,
            stagger: 0.02,
            ease: "power2.inOut",
        })
        .to(
            lines,
            { y: "0%", duration: 0.5, stagger: 0.05, ease: "power2.out" },
            0.1,
        );
}

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
slider.prepend(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const textures = [];

for (const slide of slides) {
    const texture = await new Promise((resolve) =>
        textureLoader.load(slide.image, resolve),
    );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    textures.push(texture);
}

const rippleConfig = {
    waveFreq: 25.0,
    wavePow: 0.035,
    waveWidth: 0.5,
    falloff: 10.0,
    boostStrength: 0.5,
    crossfadeWidth: 0.05,
    duration: 3.0,
    endValue: 1.0,
    ease: "power2.out",
};

const uniforms = {
    uTexCurrentRes: { value: new THREE.Vector2(textures[0].image.width, textures[0].image.height) },
    uTexNextRes: { value: new THREE.Vector2(textures[1].image.width, textures[1].image.height) },
    uProgress: { value: 0.0 },
    uResolution: { value: new THREE.Vector2() },
    uWaveFreq: { value: rippleConfig.waveFreq },
    uWavePow: { value: rippleConfig.wavePow },
    uWaveWidth: { value: rippleConfig.waveWidth },
    uFalloff: { value: rippleConfig.falloff },
    uBoostStrength: { value: rippleConfig.boostStrength },
    uCrossfadeWidth: { value: rippleConfig.crossfadeWidth },
    uMobile: { value: window.innerWidth <= 1000 ? 1.0 : 0.0 },  
};

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        ...uniforms,
        uTexCurrent: { value: textures[0] },
        uTexNext: { value: textures[1] },
    },
    transparent: true,
});

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
scene.add(plane);

function getMaxCornerDist() {
    const ratio = window.innerHeight / window.innerWidth;
    const cx = 0.5;
    const cy = 0.5 * ratio;
    return Math.sqrt(cx * cx + cy * cy);
}

function handleResize() {
    const width = slider.clientWidth;
    const height = slider.clientHeight;
    renderer.setSize(width, height);
    uniforms.uResolution.value.set(width, height);
    uniforms.uMobile.value = window.innerWidth <= 1000 ? 1.0 : 0.0;
    rippleConfig.endValue = getMaxCornerDist() + rippleConfig.waveWidth;
    rippleConfig.duration = window.innerWidth <= 1000 ? 1.5 : 3.0;
}

window.addEventListener("resize", handleResize);
handleResize();

const initialSlide = document.querySelector(".slide-content");
const initialTitle = splitTitle(initialSlide);
const initialLines = splitDescription(initialSlide);

gsap.fromTo(
    initialTitle.chars,
    { y: "100%" },
    { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out" },
);

gsap.fromTo(
    initialLines,
    { y: "100%" },
    { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out", delay: 0.2 },
);

function transition() {
    if (isTransitioning) return;
    isTransitioning = true;

    if (rippleTween) {
        rippleTween.kill();
        uniforms.uProgress.value = 0.0;
        rippleTween = null;
    }

    const nextIndex = (currentIndex + 1) % slides.length;
    const currentSlide = document.querySelector(".slide-content");

    const exitTimeline = animateTextOut(currentSlide);

    const currentTex = textures[currentIndex];
    const nextTex = textures[nextIndex];

    material.uniforms.uTexCurrent.value = currentTex;
    material.uniforms.uTexNext.value = nextTex;
    material.uniforms.uTexCurrentRes.value.set(currentTex.image.width, currentTex.image.height);
    material.uniforms.uTexNextRes.value.set(nextTex.image.width, nextTex.image.height);
    material.uniforms.uProgress.value = 0.0;

    let clickUnlocked = false;

    rippleTween = gsap.to(uniforms.uProgress, {
        value: rippleConfig.endValue,
        duration: rippleConfig.duration,
        ease: rippleConfig.ease,
        delay: 0.3,
        onUpdate() {
            if (!clickUnlocked && uniforms.uProgress.value > 0.7) {
                clickUnlocked = true;
                currentIndex = nextIndex;
                isTransitioning = false;
            }
        },
    });

    exitTimeline.then(() => {
        currentSlide.remove();

        const nextSlide = buildSlideContent(slides[nextIndex]);
        slider.appendChild(nextSlide);

        requestAnimationFrame(() => {
            animateTextIn(nextSlide);
        });
    });
}

slider.addEventListener("click", transition);

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render();