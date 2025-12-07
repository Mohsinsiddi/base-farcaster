#!/bin/bash

mkdir -p contracts

cat > contracts/MoleculeNFT.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MoleculeNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    struct Molecule {
        string formula;
        string name;
        string rarity;
        uint256 points;
        uint256 mintedAt;
    }

    mapping(uint256 => Molecule) public molecules;
    mapping(address => uint256[]) public userTokens;

    event MoleculeMinted(
        address indexed user,
        uint256 indexed tokenId,
        string formula,
        string name,
        string rarity,
        uint256 points
    );

    constructor() ERC721("ChainReactionMolecule", "MOLECULE") Ownable(msg.sender) {}

    function mint(
        address to,
        string memory formula,
        string memory name,
        string memory rarity,
        uint256 points,
        string memory tokenURI_
    ) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        molecules[tokenId] = Molecule({
            formula: formula,
            name: name,
            rarity: rarity,
            points: points,
            mintedAt: block.timestamp
        });

        userTokens[to].push(tokenId);

        emit MoleculeMinted(to, tokenId, formula, name, rarity, points);

        return tokenId;
    }

    function getMolecule(uint256 tokenId) external view returns (Molecule memory) {
        return molecules[tokenId];
    }

    function getUserTokens(address user) external view returns (uint256[] memory) {
        return userTokens[user];
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
EOF

cat > lib/contracts/moleculeNFT.ts << 'EOF'
export const MOLECULE_NFT_ADDRESS = "0x_DEPLOY_ADDRESS_HERE" as const

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
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "formula", type: "string" },
      { indexed: false, name: "name", type: "string" },
      { indexed: false, name: "rarity", type: "string" },
      { indexed: false, name: "points", type: "uint256" }
    ],
    name: "MoleculeMinted",
    type: "event"
  }
] as const
EOF

echo "✅ Phase 2 Done - Deploy contract then update MOLECULE_NFT_ADDRESS"