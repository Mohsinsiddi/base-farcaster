import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { base } from 'viem/chains'

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

// Mint NFT Hook
export function useMintMolecule() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const mint = async (
    to: `0x${string}`,
    formula: string,
    name: string,
    rarity: string,
    points: number,
    tokenURI: string
  ) => {
    writeContract({
      address: MOLECULE_NFT_ADDRESS,
      abi: MOLECULE_NFT_ABI,
      functionName: 'mint',
      args: [to, formula, name, rarity, BigInt(points), tokenURI],
      chain: base,
    })
  }

  return { mint, hash, isPending, isConfirming, isSuccess, error }
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
