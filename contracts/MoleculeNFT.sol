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
