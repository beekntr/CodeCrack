import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Code,
  Zap,
  Trophy,
  Users,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Terminal,
  Brain,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingParticles } from "@/components/floating-particles";
import { InteractiveCodePreview } from "@/components/interactive-code-preview";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { useState, useRef } from "react";

export default function Index() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const features = [
    {
      icon: Code,
      title: "Interactive Coding",
      description:
        "Write, test, and debug code directly in your browser with our powerful editor.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description:
        "Get immediate results and detailed explanations for your solutions.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Trophy,
      title: "Competitive Rankings",
      description: "Climb the leaderboard and showcase your coding prowess.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Users,
      title: "Learn Together",
      description: "Join a community of developers and learn from each other.",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const statsData = [
    { label: "Active Users", value: 50000, suffix: "+", icon: Users },
    { label: "Problems Solved", value: 2000000, suffix: "+", icon: Target },
    { label: "Code Submissions", value: 10000000, suffix: "+", icon: Terminal },
    { label: "Success Rate", value: 94, suffix: "%", icon: CheckCircle },
  ];

  function AnimatedStat({
    label,
    value,
    suffix,
    icon: Icon,
  }: {
    label: string;
    value: number;
    suffix: string;
    icon: any;
  }) {
    const { count, ref } = useAnimatedCounter(value, 2500);

    const formatValue = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(0) + "K";
      return num.toString();
    };

    return (
      <motion.div
        ref={ref}
        className="text-center group cursor-pointer"
        whileHover={{ scale: 1.05, y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3 group-hover:bg-primary/20 transition-all duration-300"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Icon className="h-6 w-6 text-primary" />
        </motion.div>
        <div className="text-2xl md:text-3xl font-bold text-foreground">
          {value < 100 ? count : formatValue(count)}
          {suffix}
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 min-h-screen flex items-center"
        onMouseMove={handleMouseMove}
      >
        <FloatingParticles />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

        {/* Interactive cursor glow */}
        <motion.div
          className="absolute pointer-events-none z-10 w-64 h-64 bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <motion.div
          style={{ y: y1 }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 z-20"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium mb-6 border border-primary/20"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(99, 102, 241, 0.1)",
                    "0 0 20px rgba(99, 102, 241, 0.3)",
                    "0 0 0px rgba(99, 102, 241, 0.1)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                </motion.div>
                Join thousands of developers
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.span
                  animate={{
                    backgroundPosition: ["0%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_100%] bg-clip-text"
                >
                  Master Coding
                </motion.span>
                <br />
                <motion.span
                  className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent relative"
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ backgroundSize: "200% 100%" }}
                >
                  One Challenge
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-lg -z-10"
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  at a Time
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Sharpen your programming skills with curated coding challenges,
                real-time feedback, and a vibrant community of developers. From
                beginner to expert, there's something for everyone.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateX: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
                  asChild
                >
                  <Link to="/auth?mode=signup">
                    <motion.span
                      className="flex items-center"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Start Coding Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, rotateX: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                  asChild
                >
                  <Link to="/problems">
                    <span className="flex items-center">
                      <Brain className="mr-2 h-5 w-5" />
                      Browse Problems
                    </span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {statsData.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <AnimatedStat {...stat} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Interactive Code Preview Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Experience Coding Like Never Before
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              See your code come to life with our interactive editor and
              real-time execution.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <InteractiveCodePreview />
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-muted/20 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%236366f1\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Developers Choose CodeCrack
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to improve your coding skills and land your
              dream job.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 300 },
                }}
                style={{ perspective: 1000 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-500 relative overflow-hidden group border-0 bg-gradient-to-br from-card to-card/50">
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-br ${feature.gradient} transition-opacity duration-500`}
                  />
                  <CardContent className="p-6 text-center relative z-10">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
                      whileHover={{
                        rotate: [0, -10, 10, 0],
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
                      />
                      <feature.icon className="h-8 w-8 text-primary relative z-10" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] relative overflow-hidden">
        <motion.div
          animate={{
            backgroundPosition: ["0%", "100%", "0%"],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary"
        />

        {/* Animated background elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              animate={{
                textShadow: [
                  "0 0 10px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.8)",
                  "0 0 10px rgba(255,255,255,0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Ready to Level Up Your Coding?
            </motion.h2>
            <motion.p
              className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join the community and start solving challenges that will make you
              a better developer.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -2, 2, 0],
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg"
                  asChild
                >
                  <Link to="/auth?mode=signup">
                    <motion.span
                      className="flex items-center"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Get Started Now
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CheckCircle className="ml-2 h-5 w-5" />
                      </motion.div>
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: [0, 2, -2, 0],
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 shadow-lg"
                  asChild
                >
                  <Link to="/auth?mode=signin">Sign In</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
