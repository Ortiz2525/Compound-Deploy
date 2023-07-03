//SPDX-License-Identifier: MIT
import "./compound/ComptrollerInterface.sol";

contract IComptroller is ComptrollerInterface {
     function getAllMarkets() external view returns (address[] memory);
}


