// Footer.tsx
import "./PortfolioFooter.css";
// import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className=" flex-between">
        {/* Left Section */}
        <div className="footer-left">
          <div className="avatar">AK</div>
          <div>
            <h4>Anjali Kumari</h4>
            <p>Full Stack Developer</p>
          </div>
        </div>

        {/* Middle Section */}
        {/* <div className="footer-links">
          <h4>CONTACT</h4>
          <div className="icons">
            <Github size={18} />
          <Linkedin size={18} />
          <Mail size={18} />
          </div>
        </div> */}

        {/* Right Section */}
        <div className="footer-portfolio">
          {/* <h4>PORTFOLIO</h4>
        <p className="portfolio-text">
          Explore my work including custom reusable components, 
          scalable UI designs, and full-stack MERN applications.
        </p> */}
          <button
            className="portfolio-btn"
            onClick={() =>
              window.open(
                "https://anjali-portfolio-wheat.vercel.app/",
                "_blank",
              )
            }
          >
            Check my Portfolio →
          </button>
        </div>
      </div>
      <p className="portfolio-text">
        Explore my work including custom reusable components, scalable UI
        designs, and full-stack MERN applications.
      </p>
    </div>
  );
};

export default Footer;
