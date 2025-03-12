import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './ModelViewer.css'
import Stats from 'stats.js';

const ModelViewer = ({ filename }) => {
    const mountRef = useRef(null);
    const [model, setModel] = useState(null);
    const statsRef = useRef(new Stats());

    useEffect(() => {
        const stats = statsRef.current;
        stats.showPanel(0); // 0: FPS, 1: MS, 2: MB
        document.body.appendChild(stats.dom);

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Append the renderer's DOM element to the mountRef
        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        // Add OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Add smooth damping
        controls.dampingFactor = 0.05; // Adjust damping strength
        controls.screenSpacePanning = true; // Allow panning
        controls.minDistance = 1; // Minimum zoom distance
        controls.maxDistance = 100; // Maximum zoom distance

        // Load the model
        const loader = filename.endsWith('.stl') ? new STLLoader() : new OBJLoader();
        loader.load(`http://127.0.0.1:5000/models/${filename}`, (object) => {
            const mesh = filename.endsWith('.stl') 
                ? new THREE.Mesh(object, new THREE.MeshBasicMaterial({ color: 0x00ff00 })) 
                : object;
            scene.add(mesh);
            setModel(mesh);

            // Adjust camera position based on the model size
            const box = new THREE.Box3().setFromObject(mesh);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());

            camera.position.copy(center);
            camera.position.z += size * 1.5; // Move camera back to fit the model
            controls.target.copy(center); // Set controls target to the model center
        });

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        // Animation loop
        const animate = () => {
            stats.begin();
            requestAnimationFrame(animate);
            controls.update(); // Update controls in the animation loop
            renderer.render(scene, camera);
            stats.end();
        };
        animate();

        // Cleanup function
        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            document.body.removeChild(stats.dom);
        };
    }, [filename]);

    return <div ref={mountRef}></div>;
};

export default ModelViewer;