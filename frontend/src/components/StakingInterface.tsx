'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Lock, 
  Coins, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  BarChart3,
  Shield,
  Info,
  Wallet
} from 'lucide-react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { useToast } from '@/components/ui/use-toast'
import { stakingAbi } from '@/abi/stakingAbi'
import { erc20Abi } from '@/abi/erc20Abi'
import { formatAmount, formatTimeRemaining } from '@/lib/utils'

const STAKING_CONTRACT = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}`
const TIP_TOKEN = process.env.NEXT_PUBLIC_TIP_TOKEN_ADDRESS as `0x${string}`

export default function StakingInterface() {
  const { address } = useAccount()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake' | 'rewards'>('stake')
  const [amount, setAmount] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Read contract data with auto-refresh
  const { data: tipBalance, refetch: refetchBalance } = useReadContract({
    address: TIP_TOKEN,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address!],
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TIP_TOKEN,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, STAKING_CONTRACT],
  })

  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingAbi,
    functionName: 'getUserInfo',
    args: [address!],
  })

  const { data: stats } = useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingAbi,
    functionName: 'getStats',
  })

  const { data: canUnstakeWithoutPenalty } = useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingAbi,
    functionName: 'canUnstakeWithoutPenalty',
    args: [address!],
  })

  const { data: penalty } = useReadContract({
    address: STAKING_CONTRACT,
    abi: stakingAbi,
    functionName: 'calculatePenalty',
    args: [address!, userInfo?.[0] || BigInt(0)],
  })

  // Write functions
  const { data: approveHash, writeContract: approve } = useWriteContract()
  const { data: stakeHash, writeContract: stake } = useWriteContract()
  const { data: unstakeHash, writeContract: unstake } = useWriteContract()
  const { data: claimHash, writeContract: claim } = useWriteContract()

  // Wait for transactions
  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  const { isLoading: isStaking, isSuccess: stakeSuccess } = useWaitForTransactionReceipt({
    hash: stakeHash,
  })

  const { isLoading: isUnstaking, isSuccess: unstakeSuccess } = useWaitForTransactionReceipt({
    hash: unstakeHash,
  })

  const { isLoading: isClaiming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  })

  // Handle transaction success
  useEffect(() => {
    if (approveSuccess) {
      toast({ 
        title: 'Approval Successful', 
        description: 'You can now stake your TIP tokens',
        className: 'bg-green-50 border-green-200'
      })
      refetchAllowance()
    }
  }, [approveSuccess, refetchAllowance, toast])

  useEffect(() => {
    if (stakeSuccess) {
      toast({ 
        title: 'Staking Successful', 
        description: 'Your tokens are now earning rewards!',
        className: 'bg-green-50 border-green-200'
      })
      refetchUserInfo()
      refetchBalance()
      setAmount('')
    }
  }, [stakeSuccess, refetchUserInfo, refetchBalance, toast])

  useEffect(() => {
    if (unstakeSuccess) {
      toast({ 
        title: 'Unstaking Successful', 
        description: 'Your tokens have been returned to your wallet',
        className: 'bg-green-50 border-green-200'
      })
      refetchUserInfo()
      refetchBalance()
      setAmount('')
    }
  }, [unstakeSuccess, refetchUserInfo, refetchBalance, toast])

  useEffect(() => {
    if (claimSuccess) {
      toast({ 
        title: 'Rewards Claimed!', 
        description: 'Your rewards have been sent to your wallet',
        className: 'bg-green-50 border-green-200'
      })
      refetchUserInfo()
      refetchBalance()
    }
  }, [claimSuccess, refetchUserInfo, refetchBalance, toast])

  // Update countdown timer and refresh rewards
  useEffect(() => {
    if (!userInfo || !userInfo[3]) return

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = Number(userInfo[3]) - now
      setTimeRemaining(remaining > 0 ? remaining : 0)
    }, 1000)

    return () => clearInterval(interval)
  }, [userInfo])

  // Auto-refresh rewards every 5 seconds
  useEffect(() => {
    if (!address || !userInfo || userInfo[0] === 0n) return

    const rewardsInterval = setInterval(() => {
      refetchUserInfo()
    }, 5000)

    return () => clearInterval(rewardsInterval)
  }, [address, userInfo, refetchUserInfo])

  const handleApprove = () => {
    const parsedAmount = parseUnits(amount, 18)
    approve({
      address: TIP_TOKEN,
      abi: erc20Abi,
      functionName: 'approve',
      args: [STAKING_CONTRACT, parsedAmount],
    })
  }

  const handleStake = () => {
    const parsedAmount = parseUnits(amount, 18)
    stake({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: 'stake',
      args: [parsedAmount],
    })
  }

  const handleUnstake = () => {
    const parsedAmount = parseUnits(amount, 18)
    unstake({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: 'unstake',
      args: [parsedAmount],
    })
  }

  const handleClaim = () => {
    claim({
      address: STAKING_CONTRACT,
      abi: stakingAbi,
      functionName: 'claimRewards',
    })
  }

  const needsApproval = allowance !== undefined && 
    amount && 
    parseUnits(amount, 18) > allowance

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Stats Cards */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <motion.div 
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 text-purple-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Balance</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tipBalance ? formatAmount(tipBalance) : '0'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">TIP Available</div>
        </motion.div>

        <motion.div 
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Staked</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userInfo ? formatAmount(userInfo[0]) : '0'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">TIP Locked</div>
        </motion.div>

        <motion.div 
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <Gift className="w-8 h-8 text-green-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Rewards</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {userInfo ? formatAmount(userInfo[1]) : '0'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">TIP Earned</div>
        </motion.div>

        <motion.div 
          variants={fadeIn}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-xl text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <span className="text-xs opacity-90">APR</span>
          </div>
          <div className="text-3xl font-bold">10%</div>
          <div className="text-sm opacity-90 mt-1">Annual Returns</div>
        </motion.div>
      </motion.div>

      {/* Main Staking Card */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'stake', label: 'Stake', icon: <ArrowUpRight className="w-4 h-4" /> },
            { id: 'unstake', label: 'Unstake', icon: <ArrowDownRight className="w-4 h-4" /> },
            { id: 'rewards', label: 'Rewards', icon: <Gift className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <AnimatePresence>
            {activeTab === 'stake' && (
              <motion.div
                key="stake"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Stake TIP Tokens
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Lock your tokens for a minimum of 7 days and earn 10% APR
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount to Stake
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-4 py-3 pr-20 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => tipBalance && setAmount(formatUnits(tipBalance, 18))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Available: {tipBalance ? formatAmount(tipBalance) : '0'} TIP</span>
                      <span>Min lock: 7 days</span>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <p className="font-semibold mb-1">Staking Benefits:</p>
                      <ul className="space-y-1">
                        <li>• Earn 10% APR calculated per second</li>
                        <li>• Claim rewards anytime without unstaking</li>
                        <li>• 1% early withdrawal penalty if unstaking before 7 days</li>
                      </ul>
                    </div>
                  </div>

                  {needsApproval ? (
                    <button
                      onClick={handleApprove}
                      disabled={isApproving || !amount}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isApproving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Approve TIP
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleStake}
                      disabled={isStaking || !amount || parseFloat(amount) <= 0}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isStaking ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Staking...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Stake TIP
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'unstake' && (
              <motion.div
                key="unstake"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Unstake TIP Tokens
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Withdraw your staked tokens back to your wallet
                  </p>
                </div>

                {/* Lock Status */}
                {userInfo && userInfo[0] > 0n && (
                  <div className={`rounded-xl p-4 flex items-center justify-between ${
                    canUnstakeWithoutPenalty 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Clock className={`w-5 h-5 ${
                        canUnstakeWithoutPenalty 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`} />
                      <div>
                        <p className={`font-semibold ${
                          canUnstakeWithoutPenalty 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {canUnstakeWithoutPenalty ? 'Unlocked' : 'Lock Period Active'}
                        </p>
                        <p className={`text-sm ${
                          canUnstakeWithoutPenalty 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {canUnstakeWithoutPenalty 
                            ? 'You can unstake without penalty' 
                            : `Time remaining: ${formatTimeRemaining(timeRemaining)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount to Unstake
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        className="w-full px-4 py-3 pr-20 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => userInfo && setAmount(formatUnits(userInfo[0], 18))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Staked: {userInfo ? formatAmount(userInfo[0]) : '0'} TIP</span>
                    </div>
                  </div>

                  {/* Penalty Warning */}
                  {!canUnstakeWithoutPenalty && penalty && penalty > 0n && amount && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p className="font-semibold">Early Withdrawal Penalty</p>
                        <p>You will lose {formatAmount(penalty)} TIP (1% penalty)</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleUnstake}
                    disabled={isUnstaking || !amount || parseFloat(amount) <= 0}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      !canUnstakeWithoutPenalty && penalty && penalty > 0n
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-xl hover:shadow-red-500/25'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-xl hover:shadow-purple-500/25'
                    }`}
                  >
                    {isUnstaking ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Unstaking...
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-5 h-5" />
                        {!canUnstakeWithoutPenalty && penalty && penalty > 0n ? 'Unstake (with penalty)' : 'Unstake TIP'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    Your Rewards
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Claim your earned rewards anytime
                  </p>
                </div>

                {/* Rewards Display */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center">
                  <Gift className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {userInfo ? formatAmount(userInfo[1]) : '0'} TIP
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Available to claim
                  </p>

                  <button
                    onClick={handleClaim}
                    disabled={isClaiming || !userInfo || userInfo[1] === 0n}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {isClaiming ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Claim Rewards
                      </>
                    )}
                  </button>
                </div>

                {/* Rewards Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">Earning Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">10% APR</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Calculated per second</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">Total Staked</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userInfo ? formatAmount(userInfo[0]) : '0'} TIP
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your staked balance</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Protocol Info */}
      <motion.div 
        {...fadeIn}
        transition={{ delay: 0.6 }}
        className="mt-8 grid md:grid-cols-3 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <Shield className="w-8 h-8 text-purple-600 mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Protocol</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Audited smart contracts with multi-sig treasury and emergency pause mechanism
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <Zap className="w-8 h-8 text-yellow-600 mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Rewards</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Claim your rewards anytime without affecting your staked principal
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
          <Clock className="w-8 h-8 text-indigo-600 mb-3" />
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Flexible Staking</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            7-day minimum lock with only 1% penalty for early withdrawal
          </p>
        </div>
      </motion.div>
    </div>
  )
}