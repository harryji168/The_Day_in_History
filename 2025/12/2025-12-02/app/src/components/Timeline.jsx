import React from 'react';
import EventCard from './EventCard';
import './Timeline.css';

const eventsBase = [
    {
        id: 99,
        year: '2023', // Using current era for demo
        title: 'Abolition of Slavery',
        description: 'International Day for the Abolition of Slavery. Creating a world where everyone is free.',
        image: 'https://images.unsplash.com/photo-1596276122653-651a3898309f?q=80&w=2000&auto=format&fit=crop' // Placeholder cute/toy style if available, or generic
    },
    {
        id: 1,
        year: '1969',
        title: 'Moon Landing',
        description: 'Apollo 11 mission lands the first humans on the Moon. global audience watched as Neil Armstrong took his "one small step".',
        image: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 2,
        year: '1989',
        title: 'Fall of the Berlin Wall',
        description: 'The Berlin Wall falls, marking the end of the Cold War division in Germany.',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 3,
        year: '2001',
        title: 'Wikipedia Launched',
        description: 'Jimmy Wales and Larry Sanger launch Wikipedia, changing how the world accesses information.',
        image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800'
    }
];

const Timeline = () => {
    // Duplicate events to simulate a longer timeline for demo
    const events = [...eventsBase, ...eventsBase.map(e => ({ ...e, id: e.id + 10 }))];

    return (
        <section className="timeline-section">
            <div className="container">
                <h2 className="section-title">Timeline of Events</h2>
                <div className="timeline-grid">
                    {events.map((event, index) => (
                        <EventCard
                            key={event.id}
                            {...event}
                            rotation={index % 2 === 0 ? -2 : 2} // Very subtle random-like rotation
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Timeline;
