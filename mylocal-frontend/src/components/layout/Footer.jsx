// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    EnvelopeFill,
    GeoAltFill,
    TelephoneFill
} from 'react-bootstrap-icons';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer shadow-lg">
            <div className="container">
                <div className="grid grid-cols-1 grid-cols-4 gap-8 py-12">
                    {/* Brand Section */}
                    <div className="col-span-1">

                        <p className="mt-4 text-secondary leading-relaxed">
                            Discover the best local gems, hidden treasures, and popular spots in your city.
                            Join our community of explorers today.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <a href="#" className="social-icon-link" aria-label="Facebook">
                                <Facebook />
                            </a>
                            <a href="#" className="social-icon-link" aria-label="Twitter">
                                <Twitter />
                            </a>
                            <a href="#" className="social-icon-link" aria-label="Instagram">
                                <Instagram />
                            </a>
                            <a href="#" className="social-icon-link" aria-label="LinkedIn">
                                <Linkedin />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-menu">
                            <li><Link to="/home">Home</Link></li>
                            <li><Link to="/places">Explore Places</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/blog">Latest Blog</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="col-span-1">
                        <h4 className="footer-title">Support</h4>
                        <ul className="footer-menu">
                            <li><Link to="/help">Help Center</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-1">
                        <h4 className="footer-title">Contact Us</h4>
                        <ul className="contact-info-list">
                            <li>
                                <GeoAltFill className="contact-icon" />
                                <span>123 Explorer Lane, Adventure City</span>
                            </li>
                            <li>
                                <TelephoneFill className="contact-icon" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li>
                                <EnvelopeFill className="contact-icon" />
                                <span>hello@mylocal.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-divider"></div>

                <div className="footer-bottom py-6 flex justify-between items-center flex-wrap gap-4">
                    <p className="copyright text-sm">
                        &copy; {currentYear} <span className="font-semibold">MyLocal</span>. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
                        <Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;