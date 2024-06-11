import React from 'react';
import { Canvas } from 'react-three-fiber';
import { OrbitControls } from '@react-three/drei';
import Cake from './Cake';
import './App.css';
function App() {
  return (
      <div className="App">
          <Canvas camera={{ position: [0, 5, 10] }}> {/* Adjusted camera position */}
              <ambientLight />
              <pointLight position={[0, 10, 10]} />
              <OrbitControls />
              <Cake />
          </Canvas>
      </div>
  );
}

export default App;
