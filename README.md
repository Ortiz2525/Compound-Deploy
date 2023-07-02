# Hardhat-Compound example

#### The sample Hardhat project using [@hardhat-compound-plugin](https://github.com/thenextblock/hardhat-compound)

### Instalation

```
npm install
yarn install
```

### Running test

```
npx hardhat test
```

code sample
Source : [./test/index.ts](https://github.com/thenextblock/hardhat-compound-example/blob/main/test/index.ts)

```
import hre, { ethers } from "hardhat";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { assert } from "chai";
import { deployErc20Token, Erc20Token } from "@thenextblock/hardhat-erc20";
import {
  CTokenDeployArg,
  deployCompoundV2,
  Comptroller,
} from "@thenextblock/hardhat-compound";

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

    const { comptroller, cTokens, priceOracle, interestRateModels }
        = await deployCompoundV2(ctokenArgs, deployer);

    await comptroller._setCloseFactor(parseUnits("0.5", 18).toString());
    await comptroller._setLiquidationIncentive(parseUnits("1.08", 18));

    const { cUNI, cUSDC } = cTokens;
    .....
```

## Script Sample

```
npx hardhat run npx hardhat run ./scripts/sample.ts
```

Source: [./script/sample.ts](https://github.com/thenextblock/hardhat-compound-example/blob/main/scripts/sample.ts)

## Smartcontracts:

[.../contracts/Compound.sol](https://github.com/thenextblock/hardhat-compound-example/blob/main/contracts/Compound.sol)
Deploy Lcal contract and interact with Compound protocol

```
  const Compound = await ethers.getContractFactory("Compound");
  const compound = await Compound.deploy(comptroller.address);
  await compound.deployed();
  console.log("Compound deployed to:", compound.address);
  // Call public view function
  await compound.cTokens();
```
