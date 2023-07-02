import hre, { ethers } from "hardhat";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { assert } from "chai";
import { deployErc20Token, Erc20Token } from "@thenextblock/hardhat-erc20";
import {
  CTokenDeployArg,
  deployCompoundV2,
  Comptroller,
} from "@thenextblock/hardhat-compound";
import "colors";

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

const UNI_PRICE = "25022748000000000000";
const USDC_PRICE = "1000000000000000000000000000000";

/**
 * Get Account Liquidity
 * @param accountAddress
 * @param comptroller
 */

async function printAccountLiquidity(
  accountAddress: string,
  comptroller: Comptroller
) {
  const [_, collateral, shortfall] = await comptroller.getAccountLiquidity(
    accountAddress
  );

  if (shortfall.isZero()) {
    console.log(
      "Healthy".green,
      "collateral=",
      collateral.toString().green,
      "shortfall=",
      shortfall.toString().green
    );
  } else {
    console.log(
      "Underwalter !!!".red,
      "collateral=",
      collateral.toString().red,
      "shortfall=",
      shortfall.toString().red
    );
  }
}

describe("Compound contract", function () {
  it("Test Markets", async function () {
    const [deployer, userA, userB, userC] = await ethers.getSigners();

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

    await comptroller.connect(userA).enterMarkets([cUNI.address]);
    await comptroller.connect(userB).enterMarkets([cUSDC.address]);

    await UNI.mint(userA.address, parseUnits("100", 18));
    await USDC.mint(userB.address, parseUnits("1500", 6));

    // userA: Supply UNI to cUNI
    const uniMintAmount = parseUnits("10", 18); // supply 4 UNI
    await UNI.connect(userA).approve(cUNI.address, uniMintAmount);
    await cUNI.connect(userA).mint(uniMintAmount);

    // userB: Supply USDC to cUSDC
    const usdcMintAmount = parseUnits("1500", 6);
    await USDC.connect(userB).approve(cUSDC.address, usdcMintAmount);
    await cUSDC.connect(userB).mint(usdcMintAmount);

    await printAccountLiquidity(userA.address, comptroller);

    // userA: borrow USDC
    await cUSDC.connect(userA).borrow(parseUnits("123", 6));
    const userAUsdcBalance = await USDC.balanceOf(userA.address);
    console.log(
      "userA USDC balance: ",
      formatUnits(userAUsdcBalance.toString(), 6).yellow
    );

    // Print Account Liquidity
    await printAccountLiquidity(userA.address, comptroller);

    console.log(`*DROP UNI PRICE*`.bgRed);

    const newPrice = ethers.BigNumber.from(UNI_PRICE).mul(80).div(100);
    await priceOracle.setUnderlyingPrice(cUNI.address, newPrice.toString());

    console.log(
      `Updated Price:  ${await priceOracle.getUnderlyingPrice(cUNI.address)} `
        .cyan
    );

    await printAccountLiquidity(userA.address, comptroller);

    console.log(`*Liquidate UserA loans*`.green);

    // Deposit userC USDC balance

    await USDC.mint(userC.address, parseUnits("200", 6).toString());
    await USDC.connect(userC).approve(cUSDC.address, parseUnits("80", 6));

    const amountToLiquidate = parseUnits("60", 6);

    await cUSDC
      .connect(userC)
      .liquidateBorrow(
        userA.address,
        amountToLiquidate.toString(),
        cUNI.address
      );

    const userCcUniBalance = await cUNI.balanceOf(userC.address);
    console.log("userC cUNI Balabce : ", userCcUniBalance.toString());

    await cUNI.connect(userC).redeem(userCcUniBalance.toString());
    // const userUNIBalance = await UNI.balanceOf(userC.address);

    console.log(
      "userC UNI Balance = ",
      formatUnits(await UNI.balanceOf(userC.address), 18)
    );

    await printAccountLiquidity(userA.address, comptroller);

    assert(true);
  });
});
