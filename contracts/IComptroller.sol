//SPDX-License-Identifier: MIT
import "@thenextblock/hardhat-compound/dist/contracts/compound/ComptrollerInterface.sol";

contract IComptroller is ComptrollerInterface {
     function getAllMarkets() external view returns (address[] memory);
}


