import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Github, Terminal, Zap, Cloud, GitBranch, ArrowRight } from "lucide-react";

const LandingPage = () => {
	const [typedText, setTypedText] = useState("");
	const { scrollY } = useScroll();
	const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

	const handleGitHubLogin = () => {
		const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
		const redirectUri =
			import.meta.env.VITE_GITHUB_CALLBACK_URL ||
			"http://localhost:5173/auth/callback";
		const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email,repo`;

		if (!GITHUB_CLIENT_ID) {
			console.error("GitHub Client ID not configured");
			alert(
				"GitHub authentication not configured. Please check environment variables.",
			);
			return;
		}

		window.location.href = githubAuthUrl;
	};

	const terminalLines = [
		{ prompt: true, text: "devpod create --template node" },
		{ prompt: false, text: "Pulling node:20-slim..." },
		{ prompt: false, text: "Installing dependencies..." },
		{ prompt: false, text: "Workspace ready. Opening editor." },
		{ prompt: true, text: "" },
	];

	const fullCommand = "devpod create --template node";

	useEffect(() => {
		let i = 0;
		const interval = setInterval(() => {
			if (i <= fullCommand.length) {
				setTypedText(fullCommand.slice(0, i));
				i++;
			} else {
				clearInterval(interval);
			}
		}, 60);
		return () => clearInterval(interval);
	}, []);

	const stagger = {
		visible: {
			transition: { staggerChildren: 0.08 },
		},
		hidden: {},
	};

	const fadeIn = {
		hidden: { opacity: 0, y: 8 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: "easeOut" },
		},
	};

	const features = [
		{
			icon: <Zap className="w-4 h-4" />,
			title: "Instant environments",
			description:
				"Pick a template. Click launch. Your workspace is running in seconds, not minutes.",
		},
		{
			icon: <GitBranch className="w-4 h-4" />,
			title: "GitHub-native workflow",
			description:
				"Authenticate with GitHub, clone any repo, push changes. No SSH keys to configure.",
		},
		{
			icon: <Cloud className="w-4 h-4" />,
			title: "Persistent workspaces",
			description:
				"Docker volumes keep your files between sessions. Close the tab, come back later, everything is there.",
		},
		{
			icon: <Terminal className="w-4 h-4" />,
			title: "Full terminal access",
			description:
				"A real terminal in your browser. Install packages, run servers, do whatever you need.",
		},
	];

	return (
		<div
			className="min-h-screen text-white"
			style={{
				backgroundColor: "#09090b",
				backgroundImage:
					"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
			}}
		>
			{/* Nav */}
			<motion.nav
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.4 }}
				className="fixed top-0 w-full z-50 border-b"
				style={{
					backgroundColor: "rgba(9, 9, 11, 0.8)",
					backdropFilter: "blur(12px)",
					borderColor: "#27272a",
				}}
			>
				<div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<div
							className="w-7 h-7 rounded-md flex items-center justify-center"
							style={{ backgroundColor: "#f59e0b" }}
						>
							<Terminal className="w-4 h-4 text-black" />
						</div>
						<span className="text-base font-semibold tracking-tight text-white">
							DevPod
						</span>
					</div>
					<motion.button
						onClick={handleGitHubLogin}
						className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors"
						style={{
							backgroundColor: "#f59e0b",
							color: "#09090b",
						}}
						whileHover={{ opacity: 0.9 }}
						whileTap={{ opacity: 0.8 }}
					>
						<Github className="w-4 h-4" />
						<span>Login with GitHub</span>
					</motion.button>
				</div>
			</motion.nav>

			{/* Hero */}
			<motion.section
				style={{ opacity: heroOpacity }}
				className="pt-32 pb-20 px-6"
			>
				<div className="max-w-5xl mx-auto">
					<motion.div
						initial="hidden"
						animate="visible"
						variants={stagger}
						className="max-w-2xl"
					>
						<motion.p
							variants={fadeIn}
							className="text-sm font-medium tracking-wide uppercase mb-5"
							style={{ color: "#f59e0b" }}
						>
							Cloud development environments
						</motion.p>
						<motion.h1
							variants={fadeIn}
							className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.08] mb-5"
							style={{ color: "#fafafa" }}
						>
							Write code in your browser.
							<br />
							<span style={{ color: "#a1a1aa" }}>
								Ship it from anywhere.
							</span>
						</motion.h1>
						<motion.p
							variants={fadeIn}
							className="text-lg leading-relaxed mb-8"
							style={{ color: "#71717a" }}
						>
							DevPod spins up pre-configured dev environments from
							templates. Python, Node, MERN, Java -- pick one and
							start coding. No local setup required.
						</motion.p>
						<motion.div variants={fadeIn}>
							<motion.button
								onClick={handleGitHubLogin}
								className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md text-sm font-semibold transition-colors"
								style={{
									backgroundColor: "#f59e0b",
									color: "#09090b",
								}}
								whileHover={{ opacity: 0.9 }}
								whileTap={{ opacity: 0.8 }}
							>
								<Github className="w-4 h-4" />
								Continue with GitHub
								<ArrowRight className="w-4 h-4" />
							</motion.button>
						</motion.div>
					</motion.div>

					{/* Terminal block */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="mt-16 max-w-2xl rounded-lg overflow-hidden border"
						style={{
							backgroundColor: "#18181b",
							borderColor: "#27272a",
						}}
					>
						<div
							className="flex items-center gap-2 px-4 py-2.5 border-b"
							style={{ borderColor: "#27272a" }}
						>
							<div className="flex gap-1.5">
								<div
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: "#3f3f46" }}
								/>
								<div
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: "#3f3f46" }}
								/>
								<div
									className="w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: "#3f3f46" }}
								/>
							</div>
							<span
								className="text-xs ml-2"
								style={{ color: "#52525b" }}
							>
								terminal
							</span>
						</div>
						<div className="p-5 font-mono text-sm leading-7">
							<div className="flex">
								<span style={{ color: "#f59e0b" }}>$</span>
								<span
									className="ml-2"
									style={{ color: "#d4d4d8" }}
								>
									{typedText}
								</span>
								<motion.span
									animate={{ opacity: [1, 0] }}
									transition={{
										duration: 0.8,
										repeat: Infinity,
										repeatType: "reverse",
									}}
									style={{ color: "#f59e0b" }}
								>
									_
								</motion.span>
							</div>
							{typedText === fullCommand && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.3 }}
								>
									{terminalLines.slice(1, 4).map((line, i) => (
										<motion.div
											key={i}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.3 + i * 0.4 }}
											style={{ color: "#71717a" }}
										>
											{line.text}
										</motion.div>
									))}
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 1.5 }}
										className="flex"
									>
										<span style={{ color: "#f59e0b" }}>
											$
										</span>
										<motion.span
											className="ml-2"
											animate={{ opacity: [1, 0] }}
											transition={{
												duration: 0.8,
												repeat: Infinity,
												repeatType: "reverse",
											}}
											style={{ color: "#f59e0b" }}
										>
											_
										</motion.span>
									</motion.div>
								</motion.div>
							)}
						</div>
					</motion.div>
				</div>
			</motion.section>

			{/* Features */}
			<section className="py-20 px-6">
				<div className="max-w-5xl mx-auto">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, margin: "-100px" }}
						variants={stagger}
						className="grid sm:grid-cols-2 gap-x-12 gap-y-10"
					>
						{features.map((feature, i) => (
							<motion.div key={i} variants={fadeIn}>
								<div
									className="flex items-center gap-2.5 mb-2.5"
									style={{ color: "#f59e0b" }}
								>
									{feature.icon}
									<h3
										className="text-sm font-semibold tracking-tight"
										style={{ color: "#fafafa" }}
									>
										{feature.title}
									</h3>
								</div>
								<p
									className="text-sm leading-relaxed"
									style={{ color: "#71717a" }}
								>
									{feature.description}
								</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Divider line */}
			<div className="max-w-5xl mx-auto px-6">
				<div style={{ borderTop: "1px solid #27272a" }} />
			</div>

			{/* Bottom CTA */}
			<section className="py-20 px-6">
				<div className="max-w-5xl mx-auto">
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={stagger}
					>
						<motion.h2
							variants={fadeIn}
							className="text-3xl font-bold tracking-tight mb-3"
							style={{ color: "#fafafa" }}
						>
							Stop configuring. Start building.
						</motion.h2>
						<motion.p
							variants={fadeIn}
							className="text-base mb-6"
							style={{ color: "#71717a" }}
						>
							One click to a working dev environment. Free while
							in beta.
						</motion.p>
						<motion.div variants={fadeIn}>
							<motion.button
								onClick={handleGitHubLogin}
								className="inline-flex items-center gap-2.5 px-6 py-3 rounded-md text-sm font-semibold transition-colors"
								style={{
									backgroundColor: "#f59e0b",
									color: "#09090b",
								}}
								whileHover={{ opacity: 0.9 }}
								whileTap={{ opacity: 0.8 }}
							>
								<Github className="w-4 h-4" />
								Continue with GitHub
								<ArrowRight className="w-4 h-4" />
							</motion.button>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer
				className="border-t py-8 px-6"
				style={{ borderColor: "#27272a" }}
			>
				<div className="max-w-5xl mx-auto flex items-center justify-between">
					<span
						className="text-xs"
						style={{ color: "#52525b" }}
					>
						DevPod {new Date().getFullYear()}
					</span>
					<a
						href="https://github.com"
						target="_blank"
						rel="noopener noreferrer"
						className="transition-colors"
						style={{ color: "#52525b" }}
						onMouseEnter={(e) =>
							(e.currentTarget.style.color = "#a1a1aa")
						}
						onMouseLeave={(e) =>
							(e.currentTarget.style.color = "#52525b")
						}
					>
						<Github className="w-4 h-4" />
					</a>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
