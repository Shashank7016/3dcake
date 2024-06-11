import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useFrame, useThree } from 'react-three-fiber';
import { TextureLoader, Color, SphereBufferGeometry, MeshStandardMaterial, Mesh, Vector3 } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three-stdlib/loaders/FontLoader.js';
import { useSpring, a } from '@react-spring/three';

function isIntersectingBox(position, boxCenter, boxSize) {
    const halfSize = [boxSize[0] / 2, boxSize[1] / 2, boxSize[2] / 2];
    return position[0] < boxCenter[0] + halfSize[0] &&
           position[0] > boxCenter[0] - halfSize[0] &&
           position[1] < boxCenter[1] + halfSize[1] &&
           position[1] > boxCenter[1] - halfSize[1] &&
           position[2] < boxCenter[2] + halfSize[2] &&
           position[2] > boxCenter[2] - halfSize[2];
}

function Table() {
    const tableTopTexture = useLoader(TextureLoader, '/tableTopTexture.jpg');
    const tableLegTexture = useLoader(TextureLoader, '/tableLegTexture.jpg');

    return (
        <group>
            {/* Table Top */}
            <mesh position={[0, 0.25, 0]}>  {/* Adjusted to center the tabletop in Y axis */}
                <boxGeometry args={[20, 0.5, 20]} />
                <meshStandardMaterial map={tableTopTexture} />
            </mesh>

            {/* Table Legs */}
            {[-1, 1].map(x => {
                return [-1, 1].map(z => (
                    <mesh key={`${x}-${z}`} position={[x * 9.75, -2.5, z * 9.75]}> {/* Adjusted the legs' position */}
                        <boxGeometry args={[0.5, 5, 0.5]} />
                        <meshStandardMaterial map={tableLegTexture} />
                    </mesh>
                ));
            })}
        </group>
    );
}


function Cake() {
    const texture = useLoader(TextureLoader, '/penyton.jpeg');
    const cakeTexture = useLoader(TextureLoader, '/3.jpg');
    const { scene } = useThree();
    const flameRef = useRef();
    const cakeGroupRef = useRef(); // At the top of your Cake function
    const birthdayTextRef = useRef();
    const [textColor, setTextColor] = useState('pink');
    const [isCandleLit, setCandleLit] = useState(true);
    const [particles, setParticles] = useState([]);
    const [balloons, setBalloons] = useState([]);
    const cakeTopRef = useRef();
    const balloonColors = ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFFF00', '#00FFFF'];

    // For birthday message
    const fontLoader = new FontLoader();
    fontLoader.load('/1.json', (font) => {
        const geometry = new TextGeometry('Happy Birthday Penny \nHope you have a great one!! :)', {
            font: font,
            size: 1,
            height: 0.2,
        });
        const material = new MeshStandardMaterial({ color: new Color(textColor) });
        const textMesh = new Mesh(geometry, material);

        textMesh.position.set(-5, 5, -10); 
        textMesh.visible = false;
        birthdayTextRef.current = textMesh;
        scene.add(textMesh);
    });

    useEffect(() => {
    const particleInterval = setInterval(() => {
        if (isCandleLit) {
            const newParticle = {
                position: [0, 3.75, 0],
                opacity: 1,
                scale: 0.1,
            };
            setParticles((prev) => [...prev, newParticle]);
        }  else {
            const newBalloon = {
                position: [(Math.random() - 0.5) * 5, 0.75, (Math.random() - 0.5) * 5], // Adjusted the y-value to 0.75
                color: new Color(`hsl(${Math.random() * 360}, 100%, 50%)`),
                speed: 0.01 + Math.random() * 0.03
            };
            setBalloons((prev) => [...prev, newBalloon]);
        }
    }, 1000);

    return () => clearInterval(particleInterval);
}, [isCandleLit]);

useEffect(() => {
    const colors = ['pink', 'blue', 'green', 'yellow', 'red', 'purple'];
    let i = 0;
    const colorChangeInterval = setInterval(() => {
        setTextColor(colors[i]);
        i = (i + 1) % colors.length; // This ensures that we loop over the colors array.
    }, 1000); // This will change the color every second. Adjust the time if needed.

    return () => clearInterval(colorChangeInterval); // This clears the interval when the component is unmounted.
}, []);

useFrame(() => {
    if (flameRef.current) {
        const scale = 1 + Math.sin(Date.now() / 300) * 0.15;
        flameRef.current.scale.set(scale, scale, scale);
        
    }
    
    // Smoke particle animation
    setParticles((prev) => 
    prev.map(particle => ({
        ...particle,
        position: [particle.position[0], particle.position[1] + 0.004, particle.position[2]], // Averaged the change value
        opacity: Math.max(0, particle.opacity - 0.003), // Averaged the change value
        scale: particle.scale + 0.00125, // Averaged the change value
        }))
    );;

    // Balloon animation and collision detection
    setBalloons((prev) => {
        let updatedBalloons = [...prev];

        // Check for collisions with cake
        const cakeBoxCenter = [0, 1, 0]; // cake's center
        const cakeBoxSize = [5, 2, 5]; // cake's dimensions

        for (let balloon of updatedBalloons) {
            if (balloon.position[1] > 10) {  // Let's say 10 is our invisible ceiling.
                balloon.speed = -Math.abs(balloon.speed) * 0.7;  // Reverse direction and reduce speed (bounce effect).
            }
            if (balloon.position[1] < 2 && balloon.speed < 0) {  // It bounces back down to a certain level and then goes up again.
                balloon.speed = -balloon.speed;
            }
            // Check for collisions with cake
        if (isIntersectingBox(balloon.position, cakeBoxCenter, cakeBoxSize)) {
            if(balloon.position[0] > cakeBoxCenter[0]) {//collision from right
                balloon.position[0] += 0.1;//push it more right
            }
           else
            {//collision from left
             balloon.position[0] -= 0.1;//push it more left
            }
    }

    // Check for collisions with other balloons
    for (let otherBalloon of updatedBalloons) {
        if (balloon === otherBalloon) continue;

        if (isIntersectingBox(balloon.position, otherBalloon.position, [1, 1, 1])) {
            const diffX = balloon.position[0] - otherBalloon.position[0];
            const diffZ = balloon.position[2] - otherBalloon.position[2];

            if (Math.abs(diffX) > Math.abs(diffZ)) {
                balloon.position[0] += diffX > 0 ? 0.1 : -0.1;
            } else {
                balloon.position[2] += diffZ > 0 ? 0.1 : -0.1;
            }
        }
    }

            // Move the balloon upwards
            balloon.position[1] += balloon.speed;
        }

        return updatedBalloons;
    });


        if (!isCandleLit && flameRef.current) {
            flameRef.current.scale.set(0, 0, 0);
        }

        // Smoke particle animation
        setParticles((prev) => 
            prev.map(particle => ({
                ...particle,
                position: [particle.position[0], particle.position[1] + 0.003, particle.position[2]],
                opacity: Math.max(0, particle.opacity - 0.002),
                scale: particle.scale + 0.001,
            }))
        );

        // Balloon animation
        setBalloons((prev) =>
            prev.map(balloon => ({
                ...balloon,
                position: [balloon.position[0], balloon.position[1] + balloon.speed, balloon.position[2]]
            }))
        );
        
        if (cakeHover) {
        cakeGroupRef.current.rotation.y += 0.005; // Add this line for rotation
        }
        if (cakeTopRef.current) {
            cakeTopRef.current.position.y = cakeHover ? 2.11 : 2.01;
        }        
        
        if (birthdayTextRef.current) {
            birthdayTextRef.current.material.color.set(textColor);
        }        
        if (!isCandleLit && birthdayTextRef.current) {
            birthdayTextRef.current.visible = true;
        }
    });

    const handleCandleClick = () => {
        setCandleLit(false);
        setFlameClicked(true);
    setTimeout(() => setFlameClicked(false), 100);
    }
    const [cakeHover, setCakeHover] = useState(false);
    const flameProps = useSpring({
        scale: isCandleLit ? [1, 1, 1] : [0, 0, 0]
    });
    const [flameClicked, setFlameClicked] = useState(false);

    return (
        <group position={[0, 1.1, 0]}>
            {/* Background */}
            <Table />

            {/* Grouping the Cake, Candle & Image */}
            <group ref={cakeGroupRef} onPointerOver={(e) => { e.stopPropagation(); setCakeHover(true); }} onPointerOut={() => setCakeHover(false)}
                   scale={cakeHover ? [1.1, 1.1, 1.1] : [1, 1, 1]}>
                {/* Cake */}
                <mesh position={[0, 1, 0]}>
                    <cylinderGeometry args={[2.5, 2.5, 2, 32]} />
                    <meshStandardMaterial map={cakeTexture} />
                </mesh>
                {/* Image */}
                <mesh position={[0, 2.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0, 2.5, 32]} />
                    <meshStandardMaterial map={texture} side={2} />
                </mesh>
                {/* Candle */}
                <mesh position={[0, 2.5, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 2, 32]} />
                    <meshStandardMaterial color={new Color('#F3E5AB')} />
                </mesh>
                <mesh position={[0, 3.6, 0]}>
                    <cylinderGeometry args={[0.02, 0.05, 0.2, 32]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            {/* Flame */}
            <a.mesh position={[0, 3.7, 0]} ref={flameRef} onClick={handleCandleClick}  scale={flameClicked ? [0.9, 0.9, 0.9] : [1, 1, 1]} {...flameProps}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshStandardMaterial color={new Color('yellow')} emissive={new Color('orange')} emissiveIntensity={1} transparent opacity={0.8} />
            </a.mesh>

            {/* Particles (smoke) */}
            {particles.map((particle, index) => (
                <mesh key={index} position={particle.position} scale={[particle.scale, particle.scale, particle.scale]}>
                    <sphereGeometry args={[0.1, 16]} />
                    <meshStandardMaterial color={new Color('lightgray')} transparent opacity={particle.opacity} />
                </mesh>
            ))}
            </group>
            {/* Balloons */}
            {balloons.map((balloon, index) => (
                <mesh key={index} position={balloon.position}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color={new Color(balloon.color)} />
                </mesh>
            ))}
        </group>
    );
}

export default Cake;
