import { useSendTransaction, useWaitForTransactionReceipt, useReadContract, useAccount } from 'wagmi'
import { encodeFunctionData } from 'viem'
import { useState, useCallback, useEffect } from 'react'

export const MOLECULE_NFT_ADDRESS = "0xb0a61F0dB0a24393DaaF5DE9A4164A22f79c49d6" as const

export const MOLECULE_NFT_ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "formula", type: "string" },
      { name: "name", type: "string" },
      { name: "rarity", type: "string" },
      { name: "points", type: "uint256" },
      { name: "tokenURI_", type: "string" }
    ],
    name: "mint",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getMolecule",
    outputs: [
      {
        components: [
          { name: "formula", type: "string" },
          { name: "name", type: "string" },
          { name: "rarity", type: "string" },
          { name: "points", type: "uint256" },
          { name: "mintedAt", type: "uint256" }
        ],
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserTokens",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const

// ====================================
// FARCASTER-SAFE MINT HOOK
// Uses useSendTransaction instead of useWriteContract
// to avoid origin mismatch in frame context
// ====================================
export function useMintMolecule() {
  const { address } = useAccount()
  const [hash, setHash] = useState<`0x${string}` | undefined>()
  const [error, setError] = useState<Error | null>(null)
  
  const { sendTransaction, isPending } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash })

  const mint = useCallback(async (
    formula: string,
    name: string,
    rarity: string,
    points: number,
    tokenURI: string
  ) => {
    if (!address) {
      setError(new Error('Wallet not connected'))
      return
    }

    try {
      setError(null)
      
      // Encode the mint function call
      const data = encodeFunctionData({
        abi: MOLECULE_NFT_ABI,
        functionName: 'mint',
        args: [address, formula, name, rarity, BigInt(points), tokenURI]
      })

      // Send transaction using Farcaster-compatible method
      sendTransaction(
        {
          to: MOLECULE_NFT_ADDRESS,
          data,
        },
        {
          onSuccess: (txHash) => {
            setHash(txHash)
          },
          onError: (err) => {
            setError(err as Error)
          }
        }
      )
    } catch (err) {
      setError(err as Error)
    }
  }, [address, sendTransaction])

  const reset = useCallback(() => {
    setHash(undefined)
    setError(null)
  }, [])

  return { 
    mint, 
    hash, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error,
    receipt,
    reset 
  }
}

// Get User Tokens Hook
export function useUserTokens(address: `0x${string}` | undefined) {
  return useReadContract({
    address: MOLECULE_NFT_ADDRESS,
    abi: MOLECULE_NFT_ABI,
    functionName: 'getUserTokens',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })
}

// Get Molecule Data Hook
export function useMolecule(tokenId: bigint | undefined) {
  return useReadContract({
    address: MOLECULE_NFT_ADDRESS,
    abi: MOLECULE_NFT_ABI,
    functionName: 'getMolecule',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: { enabled: tokenId !== undefined }
  })
}

// Get Total Supply Hook
export function useTotalSupply() {
  return useReadContract({
    address: MOLECULE_NFT_ADDRESS,
    abi: MOLECULE_NFT_ABI,
    functionName: 'totalSupply',
  })
}
