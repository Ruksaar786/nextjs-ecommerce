import React from "react";

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="p-5 flex-center">
        <p>{new Date().getFullYear()}. All Right reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
