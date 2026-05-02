// DemoAccess.tsx
import { Mail, Lock } from "lucide-react";
import "./DemoAccess.css";

const DemoAccess = () => {
  return (
    <div className="demo-container">
      
      {/* Header */}
      <div className="demo-header">
        <div className="demo-icon">⚡</div>
        <h3 className="demo-title">Demo Access</h3>
      </div>

      {/* Credentials */}
      <div className="demo-credentials">
        <div className="demo-item">
          <Mail size={14} />
          <span>Email:</span>
          <span className="highlight">demotokaiseho@gmail.com</span>
        </div>

        {/* <span className="divider">|</span> */}

        <div className="demo-item">
          <Lock size={14} />
          <span>Password:</span>
          <span className="highlight">Demo@123</span>
        </div>
      </div>

      {/* Helper Text */}
      <p className="demo-text">
        If you don’t want to use your personal Gmail, you can try this demo account.
        Credentials are created using database seeding and can be reset anytime.
      </p>
    </div>
  );
};

export default DemoAccess;