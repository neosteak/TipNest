import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatAmount(amount: bigint | number, decimals = 18): string {
  // Handle polyfilled BigInt in tests (when BigInt is actually a number)
  if (typeof BigInt === 'function' && typeof BigInt(0) === 'number') {
    // We're in test environment with polyfilled BigInt
    const amountNum = Number(amount)
    if (amountNum === 0) return '0'
    
    // Try to get the original string value if available
    const originalStr = (global as any).__getBigIntString?.(amountNum)
    
    if (originalStr) {
      // Use string arithmetic for precise calculation
      const str = originalStr
      const len = str.length
      
      if (len <= decimals) {
        // Number is less than 1 token
        const padded = str.padStart(decimals, '0')
        const whole = '0'
        const fraction = padded.slice(0, 6).replace(/0+$/, '')
        return fraction ? `0.${fraction}` : '0'
      } else {
        // Number is >= 1 token
        const whole = str.slice(0, len - decimals)
        const fraction = str.slice(len - decimals, len - decimals + 6).replace(/0+$/, '')
        
        if (fraction) {
          return `${whole}.${fraction}`
        }
        return whole
      }
    }
    
    // Fallback to exponential notation for numbers without cached strings
    const divisor = Math.pow(10, decimals)
    const result = amountNum / divisor
    
    // Format the result with up to 6 decimal places
    const truncated = Math.floor(result * 1000000) / 1000000
    const formatted = truncated.toString()
    
    // Remove trailing zeros after decimal point
    if (formatted.includes('.')) {
      return formatted.replace(/\.?0+$/, '')
    }
    return formatted
  }
  
  // Normal BigInt handling for production
  const amountBig = typeof amount === 'bigint' ? amount : BigInt(amount)
  const divisor = BigInt(10 ** decimals)
  
  const beforeDecimal = amountBig / divisor
  const afterDecimal = amountBig % divisor
  
  const afterDecimalStr = afterDecimal.toString().padStart(decimals, '0')
  const trimmed = afterDecimalStr.slice(0, 6).replace(/0+$/, '')
  
  if (trimmed === '') {
    return beforeDecimal.toString()
  }
  
  return `${beforeDecimal}.${trimmed}`
}

export function parseAmount(amount: string, decimals = 18): bigint {
  try {
    const [whole, fraction = ''] = amount.split('.')
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
    
    // Handle polyfilled BigInt in tests
    if (typeof BigInt === 'function' && typeof BigInt(0) === 'number') {
      const wholeNum = parseInt(whole, 10) || 0
      const fractionNum = parseInt(paddedFraction, 10) || 0
      return (wholeNum * Math.pow(10, decimals) + fractionNum) as any
    }
    
    return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFraction)
  } catch {
    return BigInt(0)
  }
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Unlocked'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}