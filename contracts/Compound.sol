//SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

import "@thenextblock/hardhat-compound/dist/contracts/compound/CTokenInterfaces.sol";

import "./IComptroller.sol";

import "hardhat/console.sol";

contract Compound {
    
    IComptroller private comptroller;

    constructor(address  _comptroller) public {
        console.log(">>>> Deploying Local Contract");
        comptroller = IComptroller(_comptroller);
        console.log(">>>> is Comptroller ? %s", comptroller.isComptroller());
    }

    function cTokens() public view returns (string memory) {
        address[] memory cTokens = comptroller.getAllMarkets();
        uint len = cTokens.length;
        for (uint i = 0; i < len; i++) {
            CTokenInterface cToken = CTokenInterface(cTokens[i]);
            console.log('>>>> cToken Name : %s', cToken.name());
        }
    }

    // TODO: write Add composite:  liquidity & borrow function
}
