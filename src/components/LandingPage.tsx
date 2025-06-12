
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Users, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LandingPage = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <motion.div 
          className="container mx-auto text-center"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold text-foreground mb-6"
          >
            Smart Finance Tracking
            <span className="gradient-primary bg-clip-text text-transparent"> Made Simple</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Split expenses, track spending, and achieve your financial goals with AI-powered insights and seamless group management.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="gradient-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <motion.div 
          className="container mx-auto"
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold text-center text-foreground mb-12"
          >
            Everything You Need to Manage Your Finances
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Bank-level security with end-to-end encryption"
              },
              {
                icon: Users,
                title: "Group Expenses",
                description: "Split bills and track who owes what effortlessly"
              },
              {
                icon: Target,
                title: "Smart Goals",
                description: "Set and achieve financial goals with AI guidance"
              },
              {
                icon: TrendingUp,
                title: "AI Insights",
                description: "Get personalized recommendations and spending insights"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 h-full">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div 
          className="container mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-12 gradient-primary text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Finances?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of users who are already managing their money smarter.</p>
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
