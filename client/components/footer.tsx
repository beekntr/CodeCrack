import { Link } from "react-router-dom";
import { Code, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

export function Footer() {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { name: "Problems", href: "/problems" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Contests", href: "/contests" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Tutorials", href: "/tutorials" },
        { name: "Blog", href: "/blog" },
        { name: "Community", href: "/community" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy", href: "/privacy" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "API Docs", href: "/api" },
        { name: "Status", href: "/status" },
        { name: "Terms", href: "/terms" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/codecrack", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com/codecrack", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/codecrack", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@codecrack.dev", label: "Email" },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Code className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CodeCrack</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              Master coding through interactive challenges. Join thousands of developers 
              improving their skills and landing dream jobs.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CodeCrack. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-4 md:mt-0 flex items-center">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for developers
          </p>
        </div>
      </div>
    </footer>
  );
}
