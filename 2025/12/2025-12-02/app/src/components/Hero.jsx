import React from 'react';
import './Hero.css';
import Scene3D from './Scene3D';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-background"></div>
            <div className="container hero-content flex-center">
                {/* 3D Scene Background */}
                <Scene3D />

                <div className="hero-text animate-pop-in" style={{ zIndex: 20, pointerEvents: 'none' }}>
                    {/* Make text click-through so user can orbit scene if they want, but button needs pointer events */}
                    {/* Title and Subtitle removed as per request */}
                    {/* Button removed as per request */}
                </div>
            </div>
        </section>
    );
};

export default Hero;
