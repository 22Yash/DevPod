import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Github, Monitor, Rocket, Zap, Eye, Code, ArrowRight, Menu, X, Share2, Settings, Cloud, Terminal, Globe } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMenuOpen(false);
  };

const handleGitHubLogin = () => {
  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GITHUB_CALLBACK_URL || 'http://localhost:5173/auth/callback';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email,repo`;
  
  if (!GITHUB_CLIENT_ID) {
    console.error('GitHub Client ID not configured');
    alert('GitHub authentication not configured. Please check environment variables.');
    return;
  }
  
  window.location.href = githubAuthUrl;
};


  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleOnHover = {
    scale: 1.05,
    transition: { duration: 0.2 }
  };

  return (
    <div className="bg-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">DevPod</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'How it Works', 'Try it', 'Docs'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className="text-slate-300 hover:text-emerald-400 transition-colors"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item}
                </motion.button>
              ))}
              <motion.button
                onClick={handleGitHubLogin}
                className="bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5" />
                <span>Login with GitHub</span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-800 border-t border-slate-700"
            >
              <div className="px-6 py-4 space-y-4">
                {['Features', 'How it Works', 'Try it', 'Docs'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                    className="block text-slate-300 hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        />

        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            className="space-y-8"
            style={{ opacity, scale }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-5xl lg:text-6xl font-bold leading-tight"
              >
                Your IDE. Your Terminal.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                  Your Cloud.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-slate-300 leading-relaxed"
              >
                Skip the installs. Skip the configs. Just code.
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.button
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all"
                  whileHover={scaleOnHover}
                  whileTap={{ scale: 0.95 }}
                >
                  <Rocket className="w-5 h-5" />
                  <span>Start Coding in 10 Seconds</span>
                </motion.button>

                <motion.button
                  className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all"
                  whileHover={scaleOnHover}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="w-5 h-5" />
                  <span>View Live Templates</span>
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            {/* Mac-style Window */}
            <div className="bg-gray-800 rounded-t-xl shadow-2xl border border-gray-700">
              {/* Mac Title Bar */}
              <div className="bg-gray-750 rounded-t-xl px-4 py-3 flex items-center border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-sm text-gray-300">main.js</span>
                </div>
              </div>

              {/* Code Editor Content */}
              <div className="bg-gray-850 p-6">
                <motion.div
                  className="font-mono text-sm space-y-3 leading-6"
                  initial="hidden"
                  animate="visible"
                  variants={stagger}
                >
                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">1</span>
                    <span className="text-purple-400">import</span>
                    <span className="text-white ml-2">React</span>
                    <span className="text-purple-400 ml-2">from</span>
                    <span className="text-green-400 ml-2">'react'</span>
                    <span className="text-white">;</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">2</span>
                    <span className="text-purple-400">import</span>
                    <span className="text-white ml-2">{'{ motion }'}</span>
                    <span className="text-purple-400 ml-2">from</span>
                    <span className="text-green-400 ml-2">'framer-motion'</span>
                    <span className="text-white">;</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">3</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">4</span>
                    <span className="text-gray-500">//</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">5</span>
                    <span className="text-blue-400">export</span>
                    <span className="text-blue-400 ml-2">default</span>
                    <span className="text-blue-400 ml-2">function</span>
                    <span className="text-yellow-400 ml-2">App</span>
                    <span className="text-white">() {'{'}</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">6</span>
                    <span className="text-blue-400 ml-4">return</span>
                    <span className="text-white ml-2">(</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">7</span>
                    <span className="text-white ml-8">{'<'}</span>
                    <span className="text-red-400">motion.div</span>
                    <span className="text-white">{'>'}</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">8</span>
                    <span className="text-white ml-12">Hello DevPod!</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">9</span>
                    <span className="text-white ml-8">{'</'}</span>
                    <span className="text-red-400">motion.div</span>
                    <span className="text-white">{'>'}</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">10</span>
                    <span className="text-white ml-4">);</span>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="flex items-center">
                    <span className="text-gray-500 mr-4 select-none w-6">11</span>
                    <span className="text-white"></span>
                    <motion.span
                      className="text-white ml-2"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      |
                    </motion.span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Status Bar */}
              <div className="bg-gray-750 px-4 py-2 text-xs text-gray-400 flex justify-between items-center border-t border-gray-700 rounded-b-xl">
                <div className="flex items-center space-x-4">
                  <span>JavaScript</span>
                  <span>UTF-8</span>
                  <span>LF</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Ln 11, Col 2</span>
                  <span>Spaces: 2</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              Stop waiting. Start building.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-300"
            >
              Everything you need to build, deploy, and collaborate - all in one powerful platform.
            </motion.p>
          </motion.div>

          {/* <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Instant Setup",
                description: "No downloads. No dependencies. One click, and you're in your workspace."
              },
              {
                icon: <Monitor className="w-8 h-8" />,
                title: "True Full-Stack Power",
                description: "Run Node, Python, Java — even React — right from your browser."
              },
              {
                icon: <Github className="w-8 h-8" />,
                title: "GitHub Native",
                description: "Fork, pull, branch, and merge without ever leaving your workspace."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300"
              >
                <div className="text-emerald-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div> */}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Main Feature - One-click Launch */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-3xl border border-slate-600 hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">One-click Launch</h3>
                </div>
                <p className="text-lg text-slate-300 mb-6">
                  Skip the installs. Skip the configs. One click, and you're in your fully pre-configured development environment.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>No downloads required</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>Instant setup</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Shareable Workspace */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Shareable Access</h3>
                <p className="text-slate-300 text-sm">
                  Share your workspace through unique links. Perfect for collaboration and code reviews.
                </p>
              </div>
            </motion.div>

            {/* Pre-installed Dependencies */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-purple-500/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-500/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Pre-configured</h3>
                <p className="text-slate-300 text-sm">
                  Dependencies installed and uniform environment ready for all users from day one.
                </p>
              </div>
            </motion.div>

            {/* Persistent Workspaces */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="md:col-span-2 lg:col-span-1 bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-orange-500/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-x-10 -translate-y-10"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Persistent Storage</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Your work is saved automatically using Docker volumes. Pick up exactly where you left off.
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                  <span>Auto-save enabled</span>
                </div>
              </div>
            </motion.div>

            {/* GitHub Integration */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-3xl border border-slate-700 hover:border-gray-500/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 rounded-full"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4">
                  <Github className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">GitHub Native</h3>
                <p className="text-slate-300 text-sm">
                  Fork, pull, branch, and merge without ever leaving your workspace.
                </p>
              </div>
            </motion.div>

            {/* Terminal & Preview */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="lg:col-span-3 bg-gradient-to-br from-slate-800 to-slate-700 p-8 rounded-3xl border border-slate-600 hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/5 rounded-full -translate-x-20 translate-y-20"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Terminal className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Full Development Suite</h3>
                    <p className="text-slate-400">Code + Terminal + Preview in one tab</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-300">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>VS Code Editor</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-300">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Full Terminal</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-300">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Live Preview</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Try It Section */}
      <section id="try-it" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              Don't Just Read About It — <span className="text-emerald-400">Try It</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-300"
            >
              Experience the power with this interactive demo. Yes, you can actually type!
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700 max-w-4xl mx-auto"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="ml-auto text-xs text-slate-500">interactive-terminal</div>
            </div>
            <div className="bg-black rounded-lg p-6 font-mono text-sm">
              <div className="space-y-2 mb-4">
                <div className="text-green-400">$ ls -la</div>
                <div className="text-slate-300">drwxr-xr-x 3 dev dev 4096 Aug 16 12:34 .</div>
                <div className="text-slate-300">drwxr-xr-x 5 dev dev 4096 Aug 16 12:33 ..</div>
                <div className="text-slate-300">-rw-r--r-- 1 dev dev  512 Aug 16 12:34 app.js</div>
                <div className="text-slate-300">-rw-r--r-- 1 dev dev  256 Aug 16 12:34 package.json</div>
                <div className="text-slate-300">drwxr-xr-x 2 dev dev 4096 Aug 16 12:34 src</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">$</span>
                <motion.span
                  className="text-white"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  _
                </motion.span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <motion.button
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-lg font-semibold transition-all"
                whileHover={scaleOnHover}
                whileTap={{ scale: 0.95 }}
              >
                Launch My Workspace
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              From GitHub to Running App in <span className="text-emerald-400">3 Steps</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-300"
            >
              Secure OAuth magic in seconds. No complexity, just results.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "1",
                icon: <Github className="w-8 h-8" />,
                title: "Login with GitHub",
                description: "Secure OAuth magic in seconds."
              },
              {
                step: "2",
                icon: <Monitor className="w-8 h-8" />,
                title: "Choose Your Start",
                description: "Pick a prebuild template or start from your repo."
              },
              {
                step: "3",
                icon: <Code className="w-8 h-8" />,
                title: "Start Building",
                description: "Code + Terminal + Preview — all in one tab."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="relative"
              >
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                    {item.step}
                  </div>
                  <div className="text-emerald-400 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-slate-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl lg:text-5xl font-bold mb-6"
            >
              You code. We handle the rest.
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-slate-300 mb-8"
            >
              Login now and start your first project before your coffee gets cold.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all"
                whileHover={scaleOnHover}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-5 h-5" />
                <span>Launch My Workspace</span>
              </motion.button>

              <motion.button
                className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all"
                whileHover={scaleOnHover}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">DevPod</span>
              </div>
              <p className="text-slate-400 text-sm">
                Your development environment, anywhere.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Templates</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Documentation</div>
                <div>Guides</div>
                <div>Blog</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div>About</div>
                <div>Contact</div>
                <div>Terms</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            © 2024 DevPod. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;