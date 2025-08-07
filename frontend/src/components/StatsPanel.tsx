'use client'

import { useReadContract } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { stakingAbi } from '@/abi/stakingAbi'
import { formatAmount } from '@/lib/utils'
import { TrendingUp, Users, Lock, Wallet } from 'lucide-react'

const STAKING_ADDRESS = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}`

export default function StatsPanel() {
  const { data: stats } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingAbi,
    functionName: 'getStats',
  })

  const statItems = [
    {
      label: 'Total Value Locked',
      value: stats ? `${formatAmount(stats[0])} TIP` : '0 TIP',
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'APR',
      value: stats ? `${stats[1].toString()}%` : '10%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: 'Min Lock Period',
      value: stats ? `${Number(stats[2]) / 86400} days` : '7 days',
      icon: Lock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Penalty Rate',
      value: '1%',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Protocol Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-xl font-bold">{item.value}</p>
              </div>
            </div>
          )
        })}

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">How it works</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Stake TIP tokens to earn 10% APR</li>
              <li>• Minimum lock period of 7 days</li>
              <li>• 1% penalty for early withdrawal</li>
              <li>• Claim rewards anytime</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}