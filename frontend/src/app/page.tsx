'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  ChevronRight,
  Lock,
  Coins,
  BarChart3,
  CheckCircle,
  Star,
  Globe
} from 'lucide-react'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [tvl, setTvl] = useState(0)
  const [apy, setApy] = useState(10)
  const [totalStakers, setTotalStakers] = useState(0)

  useEffect(() => {
    setMounted(true)
    // Animated counter effect
    const tvlInterval = setInterval(() => {
      setTvl(prev => {
        if (prev >= 2450000) return 2450000
        return prev + 50000
      })
    }, 50)

    const stakersInterval = setInterval(() => {
      setTotalStakers(prev => {
        if (prev >= 1234) return 1234
        return prev + 20
      })
    }, 50)

    return () => {
      clearInterval(tvlInterval)
      clearInterval(stakersInterval)
    }
  }, [])

  if (!mounted) return null

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-indigo-200/20 to-transparent rounded-full blur-3xl" />
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                TipNest
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                How it Works
              </a>
              <a href="#stats" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Stats
              </a>
              <a href="#security" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Security
              </a>
            </div>

            <Link 
              href="/app"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2"
            >
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div {...fadeIn} className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4" />
              <span className="text-sm font-semibold">Trusted by 1,234+ Stakers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Maximize Your TIP Returns
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Stake your TIP tokens in the most secure and rewarding protocol on Polygon.
              Earn a guaranteed <span className="text-purple-600 dark:text-purple-400 font-bold">10% APR</span> with flexible staking options.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/app"
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Staking Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <a 
                href="#how-it-works"
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                Learn More
              </a>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <motion.div 
                {...fadeIn}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
              >
                <BarChart3 className="w-8 h-8 text-purple-600 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${tvl.toLocaleString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Total Value Locked</div>
              </motion.div>

              <motion.div 
                {...fadeIn}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
              >
                <TrendingUp className="w-8 h-8 text-green-600 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {apy}%
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Annual APR</div>
              </motion.div>

              <motion.div 
                {...fadeIn}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
              >
                <Users className="w-8 h-8 text-indigo-600 mb-2 mx-auto" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalStakers.toLocaleString()}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm">Active Stakers</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose TipNest?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The most advanced staking protocol with unmatched benefits
            </p>
          </motion.div>

          <motion.div 
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "10% Fixed APR",
                description: "Guaranteed returns on your staked TIP tokens, calculated per second"
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: "Audited & Secure",
                description: "Multi-audited smart contracts with proven security measures"
              },
              {
                icon: <Zap className="w-12 h-12" />,
                title: "Instant Rewards",
                description: "Claim your accumulated rewards anytime without unstaking"
              },
              {
                icon: <Lock className="w-12 h-12" />,
                title: "Flexible Lock",
                description: "7-day minimum lock with only 1% early withdrawal penalty"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="text-purple-600 dark:text-purple-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-purple-900/20">
        <div className="container mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start earning in just 3 simple steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Connect your MetaMask or any Web3 wallet to get started",
                icon: <Globe className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Stake TIP",
                description: "Choose your amount and stake your TIP tokens instantly",
                icon: <Coins className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Earn Rewards",
                description: "Watch your rewards grow at 10% APR and claim anytime",
                icon: <TrendingUp className="w-8 h-8" />
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl h-full flex flex-col">
                  <div className="text-6xl font-bold text-purple-100 dark:text-purple-900/50 absolute top-4 right-4">
                    {step.step}
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 mb-4 relative z-10">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white relative z-10">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 relative z-10 flex-grow">
                    {step.description}
                  </p>
                </div>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-purple-400" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div {...fadeIn} className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-white">
              <div className="text-center mb-8">
                <Shield className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-4xl font-bold mb-4">Bank-Grade Security</h2>
                <p className="text-xl opacity-90">
                  Your funds are protected by multiple layers of security
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Multi-signature treasury",
                  "Audited by CertiK",
                  "100% on-chain transparency",
                  "Non-custodial protocol",
                  "Emergency pause mechanism",
                  "Time-locked upgrades"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div 
          {...fadeIn}
          className="container mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of stakers earning passive income with TipNest.
            No minimum amount required.
          </p>
          <Link 
            href="/app"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300"
          >
            Launch App
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">TipNest</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                The premier staking protocol for TIP tokens on Polygon.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Protocol</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/app" className="hover:text-purple-600 dark:hover:text-purple-400">App</Link></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Docs</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Audits</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Community</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Twitter</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Discord</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Telegram</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Resources</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">GitHub</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Bug Bounty</a></li>
                <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400">Brand Kit</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
            <p>© 2024 TipNest Protocol. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}