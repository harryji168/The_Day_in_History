import React from 'react';
import './EventCard.css';

const EventCard = ({ year, title, description, image, rotation }) => {
    const style = rotation ? { '--rot': `${rotation}deg` } : {};
    return (
        <div className="event-card animate-pop-in" style={style}>
            <div className="event-year">{year}</div>
            <div className="event-image-container">
                {image && <img src={image} alt={title} className="event-image" />}
            </div>
            <div className="event-content">
                <h3 className="event-title">{title}</h3>
                <p className="event-description">{description}</p>
            </div>
        </div>
    );
};

export default EventCard;
