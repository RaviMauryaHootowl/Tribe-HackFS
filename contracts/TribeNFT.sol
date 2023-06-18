// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TribeNFT is ERC1155, Ownable {
    
    string public name;
    string public symbol;
    uint256 private highestId;
    
    
    //mappings
    mapping(uint256 => string) private metadata;
    mapping(uint256 => uint256) private idSupply;
    
    constructor(string memory _symbol, string memory _name) public ERC1155("") {
        name = _name;
        symbol = _symbol;
        highestId = 0;
    }
    
    // TokenId - 1 will be the claimed NFT, Specify its uri also while minting the nft to prevent errors
    function mint(address account, uint256 id, uint256 amount) public onlyOwner {
        _customMint(account, id, amount);
    }

    function userMint(string memory _metadata) public {
        metadata[highestId + 1] = _metadata;
        _customMint(_msgSender(), highestId + 1, 1);
    }
    
    function _customMint(address account, uint256 id, uint256 amount) private {
        _mint(account, id, amount, "");
        if (id > highestId) { highestId = id;}
        idSupply[id]+=amount;
    }
    
    function burn(address account, uint256 id, uint256 amount) public {
        require(account == _msgSender() || isApprovedForAll(account, _msgSender()), "Need operator approval for 3rd party burns.");
        _burn(account, id, amount);
        idSupply[id]-=amount;
    }
    
    
    function setTokenUri(uint256 id, string memory _metadata) public onlyOwner {
        require(id >= 0, "Id needs be 0 or greater");
        metadata[id] = _metadata;
    }
    
    function totalSupply(uint256 id) public view returns(uint256 total_supply) {
        return idSupply[id];
    }
    
    
    function totalTypes(address _owner) public view returns(uint256) {
        uint256 count = 0;
        for (uint256 id = 0; id <= highestId; id++) {
            if (balanceOf(_owner, id) > 0) count++;
        }
        return count; 
    }

    function totalBalance(address _owner) public view returns(uint256) {
        uint256 count = 0;
        for (uint256 id = 0; id <= highestId; id++) {
             count+=balanceOf(_owner, id);
        }
        return count; 
    }

    
    function tokenTypesOf(address _owner) public view returns(uint256[] memory ids) {
        uint256[] memory result = new uint256[](totalTypes(_owner));
        uint256 c = 0;
        for (uint256 id = 0; id <= highestId; id++) {
            if (balanceOf(_owner, id) > 0) {result[c] = id;c++;}
        }
        return result;
    }
    
    function totalTokenTypes() public view returns(uint256) {
        uint256 count = 0;
        for (uint256 id = 0; id <= highestId; id++) {
            if (totalSupply(id) > 0) count++;
        }
        return count; 
    }

    function tokensOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 count = totalTypes(_owner);
        if(count == 0) return new uint256[](0);
        uint256[] memory tokens = new uint256[](count);
        uint256  i = 0;
        for (uint256 id = 0; id <= highestId; id++) {
             if(balanceOf(_owner, id) > 0 ) {
                 tokens[i] = id;
                 i++;
             }
        }
        return tokens; 
    }
    
    function uri(uint256 id) public view override returns(string memory) {
        return metadata[id];
    }
    

}
