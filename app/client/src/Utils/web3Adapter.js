const Web3 = require('web3');
const ABI = require('./ABI.js');

const reqContracts = ["staking", "validators", "deposit", "stakingToken", "utilityToken"]

// CHANGE OR PUT IN SETTINGS
const REGISTRY_VERSION = "/v1";

class Web3Adapter {
    constructor(settings, cb) {
        // Web3 provider to use
        this.provider = settings && settings.ethereumProvider ? settings.ethereumProvider : false;
        // Registry contract address
        this.registryContract = settings && settings.registryContract ? settings.registryContract : false;
        // Callback to a component
        this.cb = cb;
        // Curated ABI for contract functions
        this.ABIs = ABI;
        // Web3 instance for Ethereum interaction
        this.web3 = false;
        // Connection status of the provider
        this.connected = false;
        this.failed = false;
        // Registry contract Web3 instance
        this.registry = false;
        // Array of web3 contract instances (Staking, Validators, UtilityToken, StakingToken, Deposit)
        this.contracts = [];
        // Timeout for connection attempt
        this.timeout = 5000;
        // Currently selected address
        this.selectedAddress = false;
        // Account information from the contracts
        this.info = {}
        this.account = {
            "balances": {
                "token": {}
            },
            "validatorInfo": {}
        };
    }

    /**
     * Connect Web3 to this.provider
     * Call registry contract to get other contract addresses
     * Create Web3 instances of the other contracts
     * Attempt this process twice, afterwards fail
     */
    async init() {
        if (!this.provider) {
            this.cb.call(this, "error", "No Ethereum provider given.");
            return;
        }
        if (!this.registryContract) {
            this.cb.call(this, "error", "No registry contract found.");
            return;
        }
        try {
            this.web3 = new Web3(new Web3.providers.HttpProvider(this.provider, {timeout: this.timeout}));
            this.registry = new this.web3.eth.Contract(this.ABIs["registry"], this.registryContract);
            for await (let contract of reqContracts) {
                let contractAddr = await this.registry.methods.lookup(contract + REGISTRY_VERSION).call();
                let currentContract = new this.web3.eth.Contract(this.ABIs[contract], contractAddr);
                let info = {}
                info["name"] = contract;
                info["instance"] = currentContract;
                this.contracts.push(info);
            }
            await this.getInfo()
            this.failed = false
            this.connected = true;
        } catch (ex) {
            this.failed = true
            this.cb.call(this, "error", String("Could not connect. Check your Registry Address or RPC provider in the settings."))
        }
        this.cb.call(this, "success");
    }

    // Add account to the web3, set as selectedAddress, retrieve address information from contracts
    async useAccount(privK) {
        try {
            let account = await this.web3.eth.accounts.privateKeyToAccount("0x" + privK);
            await this.web3.eth.accounts.wallet.add(account);
            this.selectedAddress = account["address"];
            await this.updateAccount()
            await this.cb.call(this, "success")
        } catch (ex) {
            await this.cb.call(this, "error", String(ex))
        }
    }

    // retrieve address information from contracts, Can force update without callbacks
    async updateAccount(force) {
        if (force) {
            await this.cb.call(this, "wait", "Updating account");
        }
        try {
            let ethBalance = await this.getEthBalance(this.selectedAddress);
            let [stakingBalance, stakingAllowance, utilityBalance, utilityAllowance] = await this.getTokenBalances(this.selectedAddress);
            this.getEpoch();
            let validatorInfo = await this.getValidatorInfo();
            let balances = {
                "eth": ethBalance,
                "stakingToken": {
                    "balance": stakingBalance,
                    "allowance": stakingAllowance
                },
                "utilityToken": {
                    "balance": utilityBalance,
                    "allowance": utilityAllowance
                }
            };
            this.account = {
                balances,
                "validatorInfo": validatorInfo
            };
            if (force) {
                await this.cb.call(this, "success");
            }
        } catch (ex) {
            if (force) {
                await this.cb.call(this, "error", String(ex));
            } else {
                throw ex;
            }
        }
    }

    // Get the contract instance by contract name
    async getContract(name) {
        try {
            let contract = await this.contracts.find(e => e["name"] === name);
            if (!contract) {
                throw new Error({
                    "argument": "Invalid contract"
                });
            }
            return contract["instance"];
        } catch (ex) {
            throw ex;
        }
    }

    // Get the abi method object from contract and method name
    async getMethod(contract, fn) {
        try {
            let method = await this.ABIs[contract].find(e => e["name"] === fn);
            if (!method) {
                throw new Error({
                    "arguemnt": "Invalid Method"
                });
            }
            return method;
        } catch (ex) {
            throw ex;
        }
    }

    // same as method but with return and no callback
    async internalMethod(c, m, data) {
        if (!c || !m) {
            throw new Error({
                "arguments": "Invalid arguments"
            });
        }
        try {
            let contract = await this.getContract(c);
            let method = await this.getMethod(c, m);
            let args = []
            for (let i = 0; i < method.inputs.length; i++) {
                if (data[method.inputs[i].name]) {
                    args.push(data[method.inputs[i].name]);
                }
            }
            if (args.length !== method.inputs.length) {
                throw new Error({
                    "arguments": "Method arguments do not match given arguments"
                })
            }
            let ret;
            let [gasPrice, gasEst] = await this.getGas(contract, method, args);
            if (method.stateMutability === 'view') {
                if (args && args.length > 0) {
                    ret = await contract.methods[method.name](...args).call({
                        from: this.selectedAddress
                    });
                } else {
                    ret = await contract.methods[method.name]().call({
                        from: this.selectedAddress
                    });
                }
            } else {
                if (args && args.length > 0) {
                    await contract.methods[method.name](...args).send({
                        from: this.selectedAddress,
                        gasPrice: gasPrice,
                        gas: gasEst
                    });
                } else {
                    await contract.methods[method.name]().send({
                        from: this.selectedAddress,
                        gasPrice: gasPrice,
                        gas: gasEst
                    });
                }
                await this.updateAccount();
            }
            return ret;
        } catch (ex) {
            throw ex;
        }
    }

    // Do a contract method based on contract name, method name, and method argument data {argument: data}
    async method(c, m, data) {
        await this.cb.call(this, "wait", "Preparing transaction");
        if (!c || !m) {
            this.cb.call(this, "error", "Missing contract or method")
            return;
        }
        try {
            let contract = await this.getContract(c);
            let method = await this.getMethod(c, m);
            let args = []
            for (let i = 0; i < method.inputs.length; i++) {
                if (data[method.inputs[i].name]) {
                    args.push(data[method.inputs[i].name]);
                }
            }
            if (args.length !== method.inputs.length) {
                this.cb.call(this, "error", "Arguments given do not match contract method arguments")
                return;
            }
            if (method.stateMutability === 'view') {
                await this.call(contract, method, args);
            } else {
                await this.send(contract, method, args);
            }
        } catch (ex) {
            this.cb.call(this, "error", String(ex));
        }
    }

    // Call a contract method
    async call(contract, fn, args) {
        await this.cb.call(this, "wait", "Calling " + contract["_address"].substring(0, 6) + "..." + contract["_address"].substring(contract["_address"].length - 6));
        try {
            let [gasPrice, gasEst] = await this.getGas(contract, fn, args);
            if (args && args.length > 0) {
                await contract.methods[fn.name](...args).call({
                    from: this.selectedAddress,
                    gasPrice: gasPrice,
                    gas: gasEst
                });
            } else {
                await contract.methods[fn.name]().call({
                    from: this.selectedAddress,
                    gasPrice: gasPrice,
                    gas: gasEst
                });
            }
        } catch (ex) {
            await this.cb.call(this, "error", String(ex))
            return;
        }
        await this.cb.call(this, "success");
    }

    // Send a transaction to a coontract method
    async send(contract, fn, args) {
        await this.cb.call(this, "wait", "Sending transaction to " + contract["_address"].substring(0, 6) + "..." + contract["_address"].substring(contract["_address"].length - 6));
        let tx;
        try {
            let [gasPrice, gasEst] = await this.getGas(contract, fn, args);
            if (args && args.length > 0) {
                tx = await contract.methods[fn.name](...args).send({
                    from: this.selectedAddress,
                    gasPrice: gasPrice,
                    gas: gasEst
                });
            } else {
                tx = await contract.methods[fn.name]().send({
                    from: this.selectedAddress,
                    gasPrice: gasPrice,
                    gas: gasEst
                });
            }
            await this.updateAccount();
        } catch (ex) {
            await this.cb.call(this, "error", String(ex));
            return;
        }
        await this.cb.call(this, "success", {
            "msg": "Tx Hash: " + this.trimTxHash(tx.transactionHash),
            "type": "success"
        });
    }

    async getInfo() {
        try {
            let validatorCount = await this.internalMethod("validators", "validatorCount");
            let validatorMax = await this.internalMethod("validators", "validatorMaxCount");
            await this.getEpoch();
            this.info = {
                "validators": String(validatorCount) + "/" + String(validatorMax),
                "epoch": String(this.currentEpoch)
            }
        } catch (ex) {
            await this.cb.call(this, "error", String("Could not get validator info."));
        }
    }

    // Get Staking and Validator information for the selectedAddress
    async getValidatorInfo() {
        try {
            let isValidator = await this.internalMethod("validators", "isValidator", {
                "validator": this.selectedAddress
            });
            let stakingBalance = await this.internalMethod("staking", "balanceStake");
            let isStaking, rewardBalance, unlockedBalance = false;
            if (stakingBalance && stakingBalance !== "0") {
                isStaking = true;
                rewardBalance = await this.internalMethod("staking", "balanceReward");
                unlockedBalance = await this.internalMethod("staking", "balanceUnlocked");
            } else {
                isStaking = false;
            }
            let validatorCount = await this.internalMethod("validators", "validatorCount");
            let validatorMax = await this.internalMethod("validators", "validatorMaxCount");
            let minStake = await this.internalMethod("validators", "minimumStake");
            return {
                "isValidator": isValidator,
                "isStaking": isStaking,
                "rewardBalance": rewardBalance,
                "stakingBalance": stakingBalance,
                "unlockedBalance": unlockedBalance,
                "validatorCount": validatorCount,
                "validatorMax": validatorMax,
                "minStake": minStake
            };
        } catch (ex) {
            throw ex;
        }
    }

    // Get Ethereum balance in "Ether"
    async getEthBalance(address) {
        try {
            let balance = await this.web3.utils.fromWei(await this.web3.eth.getBalance(address ? address : this.selectedAddress), 'ether');
            return balance.substring(0, 12);
        } catch (ex) {
            throw ex;
        }
    }

    // Get token balances - 0 decimals
    async getTokenBalances(address) {
        try {
            let stakingToken = await this.getContract("stakingToken");
            let stakingBalance = await stakingToken.methods.balanceOf(address ? address : this.selectedAddress).call();
            let staking = await this.getContract("staking");
            let stakingAllowance = await stakingToken.methods.allowance(this.selectedAddress, staking["_address"]).call();

            let utilityToken = await this.getContract("utilityToken");
            let utilityBalance = await utilityToken.methods.balanceOf(address ? address : this.selectedAddress).call();
            let utility = await this.getContract("deposit");
            let utilityAllowance = await utilityToken.methods.allowance(this.selectedAddress, utility["_address"]).call();

            return [stakingBalance, stakingAllowance, utilityBalance, utilityAllowance];
        } catch (ex) {
            throw ex;
        }
    }

    // Get gas price and contract method gas cost estimate
    async getGas(contract, fn, args) {
        let gasPrice, gasEst = false;
        try {
            gasPrice = await this.web3.eth.getGasPrice();
            if (args && args.length > 0) {
                gasEst = await contract.methods[fn.name](...args).estimateGas({
                    from: this.selectedAddress
                });
            } else {
                gasEst = await contract.methods[fn.name]().estimateGas({
                    from: this.selectedAddress
                });
            }
        } catch (ex) {
            throw ex;
        }
        return [gasPrice, gasEst]
    }

    // Deposit utility tokens to MadNet
    async deposit(amount) {
        try {
            await this.method("deposit", "deposit", {
                "amount": amount
            });
        } catch (ex) {
            await this.cb.call(this, "error", String(ex))
        }
    }

    // Approve staking token spending allowance of staking token from staking contract
    async approveStakingAllowance(amount) {
        try {
            let data = {}
            let staking = await this.getContract("staking")
            data["guy"] = staking["_address"];
            data["wad"] = amount;
            await this.method("stakingToken", "approve", data);
        } catch (ex) {
            await this.cb.call(this, "error", String(ex))
        }
    }

    // Approve utility token spending allowance of utility token from staking contract
    async approveUtilityAllowance(amount) {
        try {
            let data = {}
            let deposit = await this.getContract("deposit")
            data["guy"] = deposit["_address"];
            data["wad"] = amount;
            await this.method("utilityToken", "approve", data);
        } catch (ex) {
            await this.cb.call(this, "error", String(ex))
        }
    }

    // Add or Remove selected address as a validator
    async addRemoveValidator(fn) {
        try {
            let data = {}
            data["_validator"] = this.selectedAddress;
            data["_madID"] = [];
            data["_madID"].push(String("1"));
            data["_madID"].push(String("2"));
            await this.method("validators", fn, data);
        } catch (ex) {
            await this.cb.call(this, "error", String(ex))
        }
    }

    // Lock or Unlock staking balance
    async lockUnlockStake(amount, fn) {
        try {
            let data = {}
            data["amount"] = amount;
            await this.method("staking", fn, data);
        } catch (ex) {
            await this.cb.call(this, "error", String(ex))
        }
    }

    // Get the current validator epoch
    async getEpoch() {
        try {
            let epoch = await this.internalMethod("staking", "currentEpoch");
            this.currentEpoch = epoch;
        } catch (ex) {
            this.currentEpoch = false;
        }
    }

    // Trim txHash for readability
    trimTxHash(txHash) {
        try {
            let trimmed = "0x" + txHash.substring(0, 6) + "..." + txHash.substring(txHash.length - 6)
            return trimmed
        } catch (ex) {
            throw String(ex)
        }
    }
}
export default Web3Adapter;