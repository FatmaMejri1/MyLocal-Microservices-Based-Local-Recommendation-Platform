// src/pages/About/AboutUs.jsx
import './AboutUs.css';
import {
    PeopleFill,
    GeoAltFill,
    HeartFill,
    ShieldCheck,
    LightbulbFill
} from 'react-bootstrap-icons';

const AboutUs = () => {
    return (
        <div className="about-page">
            {/* HERO */}
            <header className="about-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Connecting You to Local Gems</h1>
                    <p className="hero-subtitle">
                        MyLocal is more than a guide; it's a community-driven platform dedicated to uncovering and sharing the best local experiences your city has to offer.
                    </p>
                </div>
            </header>

            {/* MISSION SECTION */}
            <section className="about-section">
                <div className="container-narrow">
                    <div className="grid-2">
                        <div>
                            <h2 className="section-title">Our Mission</h2>
                            <p className="section-text">
                                We believe that the best experiences often hide in plain sight. Our mission is to empower locals and travelers alike to discover, share, and support small businesses, hidden parks, charming cafes, and unique cultural spots.
                            </p>
                            <p className="section-text">
                                Whether you're looking for the perfect workspace, a quiet reading nook, or the best artisanal coffee, MyLocal connects you with genuine recommendations from people who know the city best.
                            </p>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"
                            alt="Friends discovering places"
                            className="about-image"
                        />
                    </div>
                </div>
            </section>

            {/* VALUES SECTION */}
            <section className="about-section" style={{ background: '#F1F5F9' }}>
                <div className="container-narrow">
                    <div className="text-center max-w-2xl mx-auto mb-5">
                        <h2 className="section-title">Why We Do It</h2>
                        <p className="section-text">
                            Our core values drive every decision we make, ensuring a platform that is trustworthy, inclusive, and fun.
                        </p>
                    </div>

                    <div className="values-grid">
                        <div className="value-card">
                            <GeoAltFill className="value-icon" />
                            <h3 className="value-title">Local First</h3>
                            <p className="text-muted">
                                We champion local businesses and authentic spots over generic chains.
                            </p>
                        </div>
                        <div className="value-card">
                            <PeopleFill className="value-icon" />
                            <h3 className="value-title">Community Driven</h3>
                            <p className="text-muted">
                                Real recommendations from real people. No paid placements, just honest love.
                            </p>
                        </div>
                        <div className="value-card">
                            <ShieldCheck className="value-icon" />
                            <h3 className="value-title">Trust & Quality</h3>
                            <p className="text-muted">
                                Verified reviews and curated listings ensure you always find quality.
                            </p>
                        </div>
                        <div className="value-card">
                            <LightbulbFill className="value-icon" />
                            <h3 className="value-title">Innovation</h3>
                            <p className="text-muted">
                                We're constantly building better tools to help you explore your world.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM SECTION */}
            <section className="about-section team-section">
                <div className="container-narrow text-center">
                    <h2 className="section-title">Meet the Team</h2>
                    <p className="section-text max-w-xl mx-auto">
                        We are a passionate group of explorers, developers, and designers based in Tunis.
                    </p>

                    <div className="team-grid">
                        <div className="team-member">
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"
                                alt="Founder"
                                className="member-photo"
                            />
                            <h4 className="member-name">Adam Smith</h4>
                            <span className="member-role">Co-Founder & CEO</span>
                        </div>
                        <div className="team-member">
                            <img
                                src="https://images.unsplash.com/photo-1573496359-0773db4bcb83?w=400&q=80"
                                alt="Lead Design"
                                className="member-photo"
                            />
                            <h4 className="member-name">Sarah Doe</h4>
                            <span className="member-role">Head of Design</span>
                        </div>
                        <div className="team-member">
                            <img
                                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80"
                                alt="Lead Dev"
                                className="member-photo"
                            />
                            <h4 className="member-name">John Lee</h4>
                            <span className="member-role">Lead Developer</span>
                        </div>
                        <div className="team-member">
                            <img
                                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80"
                                alt="Marketing"
                                className="member-photo"
                            />
                            <h4 className="member-name">Emily Chen</h4>
                            <span className="member-role">Community Manager</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
