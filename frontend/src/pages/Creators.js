import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Github, Instagram, Globe, ArrowLeft } from 'lucide-react';

const Creators = ({ currentTheme }) => {
  const team = [
    { 
      name: "Shreyas Bhat Ujre", 
      role: "Main Developer", 
      color: "from-blue-400 to-blue-600",
      image: "/team/shreyas.jpg", // <--- PUT YOUR IMAGE PATH HERE
      socials: {
        github: "https://github.com/UjreShreyas/",
        instagram: "https://www.instagram.com/shreyas_ujre/",
        website: "" 
      }
    },
    { 
      name: "Santosh", 
      role: "Developer", 
      color: "from-purple-400 to-purple-600",
      image: "", // Leave empty to use the letter "S" fallback
      socials: { github: "#", instagram: "#" }
    },
    { 
      name: "Aaradhya", 
      role: "Documentation", 
      color: "from-green-400 to-green-600",
      image: "",
      socials: { github: "#", instagram: "#" }
    },
    { 
      name: "Rashi", 
      role: "Documentation", 
      color: "from-pink-400 to-pink-600",
      image: "",
      socials: { github: "#", instagram: "#" }
    },
  ];

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -100, opacity: 0 }} 
      className="min-h-screen p-8 font-sans text-theme-primary"
    >
      <nav className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors">
          <ArrowLeft size={20}/> Back to Home
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 title-text title-glow">The Minds Behind.</h1>
        <p className="text-xl text-theme-secondary mb-12">Built with passion by Group 3.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.map((member, index) => (
            <div key={index} className="relative bg-theme-secondary p-6 rounded-2xl border border-theme hover:border-[var(--accent-primary)] transition-all group overflow-hidden shadow-xl">
              
              {/* FIXED: Added 'pointer-events-none' so clicks go through this layer */}
              <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>
              
              {/* IMAGE LOGIC: Checks if 'image' exists, otherwise uses Initials */}
              <div className="mb-4">
                {member.image ? (
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-16 h-16 rounded-xl object-cover shadow-lg border border-theme"
                  />
                ) : (
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${member.color} shadow-lg flex items-center justify-center text-white font-bold text-xl`}>
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-theme-primary">{member.name}</h3>
              <p className="text-theme-secondary font-medium mb-6">{member.role}</p>
              
              <div className="flex gap-4 text-theme-secondary relative z-10">
                  {member.socials.github && (
                    <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-theme-primary hover:scale-110 transition-all">
                      <Github size={22} />
                    </a>
                  )}
                  {member.socials.instagram && (
                    <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-theme-primary hover:scale-110 transition-all">
                      <Instagram size={22} />
                    </a>
                  )}
                  {member.socials.website && (
                    <a href={member.socials.website} target="_blank" rel="noopener noreferrer" className="hover:text-theme-primary hover:scale-110 transition-all">
                      <Globe size={22} />
                    </a>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Creators;
