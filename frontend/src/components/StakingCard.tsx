'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { stakingAbi } from '@/abi/stakingAbi'
import { erc20Abi } from '@/abi/erc20Abi'
import { formatAmount, parseAmount, formatTimeRemaining } from '@/lib/utils'
import { Loader2, TrendingUp, Clock, AlertCircle } from 'lucide-react'

const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}`
const TIP_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TIP_TOKEN_ADDRESS as `0x${string}`

export default function StakingCard() {
  const { address } = useAccount()
  const { toast } = useToast()
  const [amount, setAmount] = useState('')
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Read user balance
  const { data: balance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read user staking info
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingAbi,
    functionName: 'getUserInfo',
    args: address ? [address] : undefined,
  })

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TIP_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, STAKING_ADDRESS] : undefined,
  })

  // Check if can unstake without penalty
  const { data: canUnstakeWithoutPenalty } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingAbi,
    functionName: 'canUnstakeWithoutPenalty',
    args: address ? [address] : undefined,
  })

  // Check if can claim rewards
  const { data: canClaimRewards } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingAbi,
    functionName: 'canClaimRewards',
    args: address ? [address] : undefined,
  })

  // Calculate penalty
  const { data: penalty } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingAbi,
    functionName: 'calculatePenalty',
    args: address && amount ? [address, parseAmount(amount)] : undefined,
  })

  // Contract write hooks
  const { data: approveHash, writeContract: approve } = useWriteContract()
  const { data: stakeHash, writeContract: stake } = useWriteContract()
  const { data: unstakeHash, writeContract: unstake } = useWriteContract()
  const { data: claimHash, writeContract: claim } = useWriteContract()

  // Wait for transaction confirmations
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

  // Handle transaction success with useEffect (wagmi v2 pattern)
  useEffect(() => {
    if (approveSuccess) {
      toast({ title: 'Approval successful', description: 'You can now stake your tokens' })
      refetchAllowance()
    }
  }, [approveSuccess, refetchAllowance, toast])

  useEffect(() => {
    if (stakeSuccess) {
      toast({ title: 'Stake successful', description: 'Your tokens have been staked' })
      refetchUserInfo()
      refetchAllowance()
      setAmount('')
    }
  }, [stakeSuccess, refetchUserInfo, refetchAllowance, toast])

  useEffect(() => {
    if (unstakeSuccess) {
      toast({ title: 'Unstake successful', description: 'Your tokens have been unstaked' })
      refetchUserInfo()
      setAmount('')
    }
  }, [unstakeSuccess, refetchUserInfo, toast])

  useEffect(() => {
    if (claimSuccess) {
      toast({ title: 'Claim successful', description: 'Your rewards have been claimed' })
      refetchUserInfo()
    }
  }, [claimSuccess, refetchUserInfo, toast])

  // Update countdown timer
  useEffect(() => {
    if (!userInfo || !userInfo[2] || userInfo[2] === 0n) return

    const interval = setInterval(() => {
      const unlockTime = Number(userInfo[3])
      const now = Math.floor(Date.now() / 1000)
      setTimeRemaining(Math.max(0, unlockTime - now))
    }, 1000)

    return () => clearInterval(interval)
  }, [userInfo])

  const handleApprove = () => {
    if (!amount) return
    const parsedAmount = parseAmount(amount)
    approve({
      address: TIP_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [STAKING_ADDRESS, parsedAmount],
    })
  }

  const handleStake = () => {
    if (!amount) return
    const parsedAmount = parseAmount(amount)
    stake({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: 'stake',
      args: [parsedAmount],
    })
  }

  const handleUnstake = () => {
    if (!amount) return
    const parsedAmount = parseAmount(amount)
    unstake({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: 'unstake',
      args: [parsedAmount],
    })
  }

  const handleClaim = () => {
    claim({
      address: STAKING_ADDRESS,
      abi: stakingAbi,
      functionName: 'claimRewards',
    })
  }

  const handleMax = () => {
    if (activeTab === 'stake' && balance) {
      setAmount(formatAmount(balance))
    } else if (activeTab === 'unstake' && userInfo) {
      setAmount(formatAmount(userInfo[0]))
    }
  }

  const needsApproval = allowance !== undefined && amount && parseAmount(amount) > allowance
  const isLoading = isApproving || isStaking || isUnstaking || isClaiming

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Stake TIP Tokens</CardTitle>
        <CardDescription>Earn 10% APR by staking your TIP tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Wallet Balance</Label>
            <p className="text-2xl font-bold">{balance ? formatAmount(balance) : '0'} TIP</p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Staked Balance</Label>
            <p className="text-2xl font-bold">{userInfo ? formatAmount(userInfo[0]) : '0'} TIP</p>
          </div>
        </div>

        {/* Rewards Display */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Pending Rewards</span>
            </div>
            <span className="text-xl font-bold text-purple-600">
              {userInfo ? formatAmount(userInfo[1]) : '0'} TIP
            </span>
          </div>
          {userInfo && userInfo[1] > 0n && canClaimRewards && (
            <Button 
              onClick={handleClaim} 
              disabled={isLoading || !canClaimRewards}
              size="sm"
              className="mt-3 w-full"
            >
              {isClaiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Claim Rewards
            </Button>
          )}
        </div>

        {/* Lock Timer */}
        {userInfo && userInfo[0] > 0n && timeRemaining > 0 && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm">
              Unlock in: <strong>{formatTimeRemaining(timeRemaining)}</strong>
            </span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex space-x-2 p-1 bg-muted rounded-lg">
          <Button
            variant={activeTab === 'stake' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('stake')}
          >
            Stake
          </Button>
          <Button
            variant={activeTab === 'unstake' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setActiveTab('unstake')}
          >
            Unstake
          </Button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="flex space-x-2">
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleMax} variant="outline" disabled={isLoading}>
              Max
            </Button>
          </div>
        </div>

        {/* Penalty Warning */}
        {activeTab === 'unstake' && !canUnstakeWithoutPenalty && penalty && penalty > 0n && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-600">Early withdrawal penalty</p>
              <p className="text-red-600/80">
                You will lose {formatAmount(penalty)} TIP (1% penalty)
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {activeTab === 'stake' ? (
            needsApproval ? (
              <Button 
                onClick={handleApprove} 
                disabled={isLoading || !amount}
                className="w-full"
                size="lg"
              >
                {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Approve TIP
              </Button>
            ) : (
              <Button 
                onClick={handleStake} 
                disabled={isLoading || !amount}
                className="w-full"
                size="lg"
              >
                {isStaking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Stake TIP
              </Button>
            )
          ) : (
            <Button 
              onClick={handleUnstake} 
              disabled={isLoading || !amount}
              className="w-full"
              size="lg"
              variant={!canUnstakeWithoutPenalty ? 'destructive' : 'default'}
            >
              {isUnstaking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Unstake TIP
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}