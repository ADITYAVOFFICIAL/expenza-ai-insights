import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Users, Target, TrendingUp, Wallet, Zap, BarChartBig, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const LandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const featureItems = [
    {
      icon: Zap,
      title: "Effortless Tracking",
      description: "Log expenses in seconds with our intuitive interface."
    },
    {
      icon: Users,
      title: "Seamless Group Expenses",
      description: "Split bills and track shared finances with ease."
    },
    {
      icon: Target,
      title: "Achieve Your Goals",
      description: "Set, track, and reach financial milestones faster."
    },
    {
      icon: Bot, // Changed from TrendingUp for more direct AI feel
      title: "AI-Powered Insights",
      description: "Get smart recommendations to optimize your spending."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">DigiSamahārta</h1>
          </Link>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm sm:text-base">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="text-sm sm:text-base">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <motion.div 
          className="container mx-auto text-center"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wide text-primary bg-primary/10 rounded-full"
          >
            Your Personal Finance Co-Pilot
          </motion.div>
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground mb-6 leading-tight"
          >
            Master Your Money,
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Live Your Life
            </span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            DigiSamahārta helps you effortlessly track spending, manage group expenses, and achieve financial goals with AI-powered insights.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Sign Up For Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            {/* <Link to="/#features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link> */}
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-16">
            <img 
              src="/placeholder.svg" // Replace with an actual product screenshot or illustration
              alt="DigiSamahārta Dashboard Preview" 
              className="rounded-xl shadow-2xl mx-auto w-full max-w-3xl border border-border/20"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/40">
        <motion.div 
          className="container mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerChildren}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Smart Features for Smarter Finances
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Everything you need to take control of your financial well-being, all in one place.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featureItems.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 text-left hover:shadow-xl transition-all duration-300 h-full bg-card border-border/70">
                  <div className="mb-4 inline-flex items-center justify-center p-3 rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works / More Detailed Feature Section (Example) */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Focus on What Matters</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              DigiSamahārta simplifies complex financial tasks so you can focus on your goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/placeholder.svg" // Replace with relevant illustration/screenshot
                alt="Group Expense Splitting" 
                className="rounded-xl shadow-xl border border-border/20" 
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center p-3 mb-4 rounded-lg bg-accent/10 text-accent">
                <BarChartBig className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Visualize Your Spending</h3>
              <p className="text-muted-foreground mb-4">
                Gain clear insights into your financial habits with interactive charts and reports. Understand where your money goes and identify areas for improvement.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center"><Shield className="w-4 h-4 mr-2 text-primary" /> Secure Data Encryption</li>
                <li className="flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-primary" /> Personalized Budgeting Tips</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary to-accent">
        <motion.div 
          className="container mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-xl mx-auto">
            Join thousands of users who are already managing their money smarter with DigiSamahārta.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-transform duration-300">
              Get Started For Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border/60">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">DigiSamahārta</span>
          </div>
          <p>&copy; {new Date().getFullYear()} DigiSamahārta. All rights reserved.</p>
          <div className="mt-3 space-x-4">
            <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
