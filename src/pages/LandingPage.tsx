import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Wallet, Zap, Bot, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AuroraBackground } from '@/components/ui/aurora-background';

const LandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const featureItems = [
    {
      icon: Zap,
      title: "Swift Expense Tracking",
      description: "Log your transactions in seconds with an intuitive and fast interface."
    },
    {
      icon: Bot,
      title: "AI-Powered Insights",
      description: "Receive smart recommendations to optimize spending and boost savings."
    },
    {
      icon: Users,
      title: "Seamless Group Finances",
      description: "Easily split bills, manage shared budgets, and track group goals."
    }
  ];

  return (
    <AuroraBackground className="aurora-image-background">
      <div className="relative z-10 w-full min-h-screen flex flex-col antialiased"> {/* Ensure min-h-screen here too */}
        {/* Navigation */}
        <nav className="sticky top-0 z-50 w-full bg-transparent"> {/* Ensure nav background is transparent or matches page */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center shadow-md"> {/* Solid cyan background for icon */}
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">DigiSamahārta</h1>
            </Link>
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm text-slate-200 hover:text-white">Sign In</Button> {/* Adjusted hover */}
              </Link>
              <Link to="/signup">
                {/* Use primary color for "Get Started" button as per image */}
                <Button size="sm" className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.section
          className="flex-grow flex items-center justify-center pt-12 pb-20 sm:pt-16 sm:pb-28 px-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="container mx-auto text-center">
            <motion.div
              variants={fadeInUp}
              // Pill badge style update
              className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-wide text-neutral-200 bg-neutral-700 rounded-full"
            >
              Your Personal Finance Co-Pilot
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Master Your Money,
              <br />
              {/* Updated text and gradient */}
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-green-400 bg-clip-text text-transparent">
                Live Your Life
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
            >
              DigiSamahārta helps you effortlessly track spending, manage group expenses, and achieve financial goals with AI-powered insights.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link to="/signup">
                {/* Updated button text and style */}
                <Button size="lg" className="px-8 py-3 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Sign Up For Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </AuroraBackground>
  );
};

export default LandingPage;