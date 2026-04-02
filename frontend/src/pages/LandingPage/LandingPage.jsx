import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Terminal, Zap, Cloud, Share2, ArrowRight, Code } from "lucide-react";

const LandingPage = () => {
  const [typedText, setTypedText] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  const handleGitHubLogin = () => {
    const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri =
      import.meta.env.VITE_GITHUB_CALLBACK_URL || "http://localhost:5173/auth/callback";
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email,repo`;

    if (!GITHUB_CLIENT_ID) {
      console.error("GitHub Client ID not configured");
      alert("GitHub authentication not configured. Please check environment variables.");
      return;
    }

    window.location.href = githubAuthUrl;
  };

  const command = "devpod launch --template python";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= command.length) {
        setTypedText(command.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowOutput(true), 300);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const fade = {
    hidden: { opacity: 0, y: 12 },
    show: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    }),
  };

  const outputLines = [
    { text: "Pulling python:3.10-slim...", delay: 0 },
    { text: "Installing code-server v4.96.4", delay: 0.4 },
    { text: "Creating volume devpod-workspace-a1b2c3", delay: 0.8 },
    { text: "Starting container on port 32768", delay: 1.2 },
    { text: "Workspace ready — opening editor", color: "#f0b429", delay: 1.6 },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#111114", color: "#e8e8ed" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 w-full z-50"
        style={{ background: "rgba(17,17,20,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e1e24" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "#f0b429" }}>
              <Terminal className="w-3.5 h-3.5" style={{ color: "#111114" }} />
            </div>
            <span className="font-semibold text-sm tracking-tight">DevPod</span>
          </div>
          <button
            onClick={handleGitHubLogin}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 hover:brightness-110"
            style={{ background: "#f0b429", color: "#111114" }}
          >
            <Github className="w-3.5 h-3.5" />
            Sign in
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="dot-grid relative overflow-hidden">
        {/* Subtle radial glow behind hero */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(240,180,41,0.06) 0%, transparent 70%)" }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left — Copy */}
            <div className="max-w-xl">
              <motion.div
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <motion.div variants={fade} custom={0}>
                  <span
                    className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase px-3 py-1 rounded-full"
                    style={{ background: "rgba(240,180,41,0.1)", color: "#f0b429", border: "1px solid rgba(240,180,41,0.15)" }}
                  >
                    Cloud dev environments
                  </span>
                </motion.div>

                <motion.h1
                  variants={fade}
                  custom={1}
                  className="text-[3.25rem] sm:text-[3.75rem] font-bold leading-[1.05] tracking-[-0.035em]"
                >
                  Code from your browser.{" "}
                  <span style={{ color: "#6b6b80" }}>Deploy from anywhere.</span>
                </motion.h1>

                <motion.p
                  variants={fade}
                  custom={2}
                  className="text-base leading-relaxed max-w-md"
                  style={{ color: "#7a7a8e" }}
                >
                  DevPod spins up isolated, pre-configured development environments
                  from templates. Python, Node, MERN, Java — pick one and start
                  building in seconds.
                </motion.p>

                <motion.div variants={fade} custom={3} className="flex items-center gap-4 pt-2">
                  <button
                    onClick={handleGitHubLogin}
                    className="flex items-center gap-2.5 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                    style={{ background: "#f0b429", color: "#111114" }}
                  >
                    <Github className="w-4 h-4" />
                    Continue with GitHub
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#features"
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: "#6b6b80" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#e8e8ed")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b80")}
                  >
                    See how it works
                  </a>
                </motion.div>

                {/* Capability strip */}
                <motion.div
                  variants={fade}
                  custom={4}
                  className="flex items-center gap-3 pt-6 text-xs"
                  style={{ color: "#4a4a58" }}
                >
                  <span>4 templates</span>
                  <span style={{ color: "#2a2a35" }}>|</span>
                  <span>Browser IDE</span>
                  <span style={{ color: "#2a2a35" }}>|</span>
                  <span>GitHub auth</span>
                  <span style={{ color: "#2a2a35" }}>|</span>
                  <span>Workspace sharing</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Right — Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-xl overflow-hidden"
              style={{ background: "#16161a", border: "1px solid #22222a", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}
            >
              {/* Title bar */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1e1e24" }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-[10px] h-[10px] rounded-full" style={{ background: "#ff5f57" }} />
                    <div className="w-[10px] h-[10px] rounded-full" style={{ background: "#febc2e" }} />
                    <div className="w-[10px] h-[10px] rounded-full" style={{ background: "#28c840" }} />
                  </div>
                </div>
                <span className="text-[11px] font-mono" style={{ color: "#4a4a58" }}>terminal</span>
                <div className="w-16" />
              </div>

              {/* Terminal content */}
              <div className="p-5 font-mono text-[13px] leading-relaxed min-h-[220px]">
                <div className="flex">
                  <span style={{ color: "#f0b429" }}>~</span>
                  <span style={{ color: "#4a4a58" }} className="mx-2">$</span>
                  <span style={{ color: "#c8c8d0" }}>{typedText}</span>
                  {!showOutput && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                      className="ml-0.5 inline-block w-[7px] h-[18px]"
                      style={{ background: "#f0b429", verticalAlign: "text-bottom" }}
                    />
                  )}
                </div>

                {showOutput && (
                  <div className="mt-3 space-y-1">
                    {outputLines.map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: line.delay, duration: 0.3 }}
                        style={{ color: line.color || "#5a5a6a" }}
                      >
                        {line.text}
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.2 }}
                      className="flex mt-2"
                    >
                      <span style={{ color: "#f0b429" }}>~</span>
                      <span style={{ color: "#4a4a58" }} className="mx-2">$</span>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                        className="inline-block w-[7px] h-[18px]"
                        style={{ background: "#f0b429", verticalAlign: "text-bottom" }}
                      />
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6" style={{ borderTop: "1px solid #1e1e24" }}>
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold tracking-[0.15em] uppercase mb-12"
            style={{ color: "#4a4a58" }}
          >
            What you get
          </motion.p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "#1e1e24", borderRadius: 12, overflow: "hidden" }}>
            {[
              { icon: <Zap className="w-4 h-4" />, title: "One-click launch", desc: "Pick a template, click launch. Your browser-based IDE is ready in seconds with all dependencies installed." },
              { icon: <Code className="w-4 h-4" />, title: "Full IDE in browser", desc: "code-server gives you VS Code with terminal, extensions, and file management. No local install needed." },
              { icon: <Share2 className="w-4 h-4" />, title: "Share workspaces", desc: "Generate a link to share your environment. Others can clone it with one click and start collaborating." },
              { icon: <Cloud className="w-4 h-4" />, title: "Persistent storage", desc: "Docker volumes keep your work safe between sessions. Close the tab, come back tomorrow, files are there." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-7 transition-colors duration-300 group"
                style={{ background: "#111114" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#16161a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#111114")}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "rgba(240,180,41,0.08)", color: "#f0b429" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#e8e8ed" }}>{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "#5a5a6a" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates preview ── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid #1e1e24" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl font-bold tracking-tight mb-3" style={{ color: "#e8e8ed" }}>
              Start with a template
            </h2>
            <p className="text-sm" style={{ color: "#5a5a6a" }}>
              Pre-configured environments for popular stacks. Ready in seconds.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "Python", tag: "python:3.10", color: "#3572A5" },
              { name: "Node.js", tag: "node:20-slim", color: "#68A063" },
              { name: "MERN Stack", tag: "mongo + react", color: "#4DB33D" },
              { name: "Java", tag: "jdk-17 + maven", color: "#ED8B00" },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-lg p-5 cursor-pointer transition-all duration-200"
                style={{
                  background: "#16161a",
                  border: "1px solid #22222a",
                  borderTop: `2px solid ${t.color}`,
                }}
                onClick={handleGitHubLogin}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#33333d")}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#22222a";
                  e.currentTarget.style.borderTopColor = t.color;
                }}
              >
                <h3 className="font-mono text-sm font-medium mb-1" style={{ color: "#e8e8ed" }}>{t.name}</h3>
                <p className="text-xs font-mono" style={{ color: "#4a4a58" }}>{t.tag}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6" style={{ borderTop: "1px solid #1e1e24" }}>
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4" style={{ color: "#e8e8ed" }}>
              Stop configuring.<br />Start building.
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#5a5a6a" }}>
              One click to a working dev environment. No credit card, no local setup.
            </p>
            <button
              onClick={handleGitHubLogin}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{ background: "#f0b429", color: "#111114" }}
            >
              <Github className="w-4 h-4" />
              Get started free
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid #1e1e24" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "#f0b429" }}>
              <Terminal className="w-3 h-3" style={{ color: "#111114" }} />
            </div>
            <span className="text-xs" style={{ color: "#3a3a45" }}>DevPod {new Date().getFullYear()}</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#3a3a45" }}
            className="transition-colors hover:text-[#6b6b80]"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
