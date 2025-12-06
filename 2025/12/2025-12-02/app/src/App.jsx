import React from 'react';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import './App.css';

function App() {
  return (
    <div className="app">
      <Hero />
      <Timeline />
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 The Day in History. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
