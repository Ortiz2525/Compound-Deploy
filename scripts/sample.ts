import { ethers } from "hardhat";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { assert } from "chai";
import { deployErc20Token, Erc20Token } from "@thenextblock/hardhat-erc20";
import {
  CTokenDeployArg,
  deployCompoundV2,
  Comptroller,
} from "@thenextblock/hardhat-compound";

async function main() {
  const [deployer] = await ethers.getSigners();
  const UNI_PRICE = "25022748000000000000";
  const USDC_PRICE = "1000000000000000000000000000000";

  // Deploy USDC ERC20
  const USDC: Erc20Token = await deployErc20Token(
    {
      name: "USDC",
      symbol: "USDC",
      decimals: 6,
    },
    deployer
  );

  // Deploy UNI ERC20
  const UNI: Erc20Token = await deployErc20Token(
    {
      name: "UNI",
      symbol: "UNI",
      decimals: 18,
    },
    deployer
  );

  const ctokenArgs: CTokenDeployArg[] = [
    {
      cToken: "cUNI",
      underlying: UNI.address,
      underlyingPrice: UNI_PRICE,
      collateralFactor: "500000000000000000", // 50%
    },
    {
      cToken: "cUSDC",
      underlying: USDC.address,
      underlyingPrice: USDC_PRICE,
      collateralFactor: "500000000000000000", // 50%
    },
  ];

  const { comptroller, cTokens, priceOracle, interestRateModels } =
    await deployCompoundV2(ctokenArgs, deployer);

  await comptroller._setCloseFactor(parseUnits("0.5", 18).toString());
  await comptroller._setLiquidationIncentive(parseUnits("1.08", 18));

  const { cUNI, cUSDC } = cTokens;

  console.log("Comptroller: ", comptroller.address);
  console.log("SimplePriceOralce: ", await comptroller.oracle());
  console.log("cUNI: ", cUNI.address);
  console.log("cUSDC: ", cUSDC.address);

  // Deploy Smartcontract
  const Compound = await ethers.getContractFactory("Compound");
  const compound = await Compound.deploy(comptroller.address);
  await compound.deployed();
  console.log("Compound deployed to:", compound.address);

  // Call public view function
  await compound.cTokens();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
