import store from '../redux/store/store';
import Web3 from 'web3';
import ABI from './abi.js';
import { ADAPTER_ACTIONS } from 'redux/actions/_actions';

import { SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';
import { SyncToastMessageWarning } from 'components/customToasts/CustomToasts';
import { toast } from 'react-toastify';

const reqContracts = ["staking", "validators", "deposit", "stakingToken", "utilityToken"]
const REGISTRY_VERSION = "/v1"; // CHANGE OR PUT IN SETTINGS

/**
 * Web3Adapter that provides ethereum access acrosss the application 
 * Note: Core state that may need to propagate UI changes has been moved to the redux state 
 * It is advised to export a singleton instance of this class, as it will monitor for state updates and adjust accordingly after initiation
 * 
 * After instancing the Web3Adapter it must be initiated prior to use -- Once initiated it will remain available until close
*/
class Web3Adapter {

    constructor() {
        this.__initialStateSet();
    }

    __initialStateSet() {
        this.web3 = [];
        this.contracts = [];
        this.info = {};
        // Set initial instance state
        this.selectedAddress = false; // Currently selected address
        this.account = { // Account information from the contracts
            "address": "",
            "balances": {
                "token": {}
            },
            "validatorInfo": {}
        };
    }

    /**
     * Initialize the current instance by setting up store listen and getting uptoDateContracts and information
     * @param {Object} config - Prevent toast from popping?
     * @property { Bool } config.preventToast - Should the toast be prevented?
     */
    async __init(config = {}) {
        // Set up subscribe and listen to store events
        await this._listenToStore();
        // Set the latest contracts
        let connected = await this._setAndGetUptoDateContracts();
        if (connected.error) {
            toast.error(<SyncToastMessageWarning basic title="Error" message="Web3 Connection Error - Verify Settings" />, { className: "basic", "autoClose": 2400 })
            return { error: connected.error }
        }
        // Set and get the latest contract info
        await this._setAndGetInfo();
        // Verify that both provider and registry contract are available
        if (!this._getEthereumProviderFromStore()) {
            toast.error(<SyncToastMessageWarning basic title="Error" message="Web3 Connection Error - Verify Settings" />, { className: "basic", "autoClose": 2400 })
            return { error: "No Ethereum provider found in state." };
        }
        if (!this._getRegistryContractFromStore()) {
            toast.error(<SyncToastMessageWarning basic title="Error" message="Web3 Connection Error - Verify Settings" />, { className: "basic", "autoClose": 2400 })
            return { error: "No registry contract found in state." };
        }
        // If all of this passes, note that the instance is connected
        store.dispatch(ADAPTER_ACTIONS.setWeb3Connected(true));
        if (!config.preventToast) {
            toast.success(<SyncToastMessageSuccess basic title="Success" message="Web3 Connected" />, { className: "basic", "autoClose": 2400 })
        }
        return { success: true };
    }

    // Set adapter default state -- for disconnecting
    setDefaultState() {
        this.__initialStateSet();
    }

    /**
     * Setup listeners on the redux store for configuration changes -- This may not be needed at the moment 
     */
    async _listenToStore() {
        // TBD: On store changes for any configuration settings rerun:
        // await this._setAndGetUptoDateContracts();
        // await this._setAndGetInfo();
    }

    /**
     * @returns { String } Registry contract from the Redux store
     */
    _getRegistryContractFromStore() {
        return store.getState().config.registry_contract_address;
    }

    /**
     * @returns { String } - Ethereum Provider address from the Redux store
     */
    _getEthereumProviderFromStore() {
        return store.getState().config.ethereum_provider;
    }

    /** 
     * Sets and returns a new web3 instance for this adapter referencing the current state's provider and registry contracts
     * @returns { Web3 } - Web3 Instance referencing latest ethereum provider from state
     */
    _setAndGetUptoDateWeb3Instance() {
        try {
            let newWeb3 = new Web3(new Web3.providers.HttpProvider(this._getEthereumProviderFromStore(), { timeout: 5000 }));
            this.web3 = newWeb3;
            return this.web3;
        } catch (ex) {
            throw new Error(ex);
        }
    }

    /**
     * Sets current contract list on instance, and returns the latest contracts
     * @returns { Array[Web3.Contract] } - Array of contract objects
     */
    async _setAndGetUptoDateContracts() {
        try {
            let web3 = this._setAndGetUptoDateWeb3Instance(); // Get an uptoDate web3 instance
            let registryContract = new web3.eth.Contract(ABI["registry"], this._getRegistryContractFromStore()); // Note the current registry address from config
            let contractList = []; // Array to push contracts to and return
            for await (let contract of reqContracts) {
                let contractAddr = await registryContract.methods.lookup(contract + REGISTRY_VERSION).call();
                let newContract = new this.web3.eth.Contract(ABI[contract], contractAddr);
                let info = {}
                info["name"] = contract;
                info["instance"] = newContract;
                contractList.push(info);
            }
            this.contracts = contractList;
            return this.contracts;
        } catch (ex) {
            return { error: ex }
        }
    }

    /** Sets the current information to redux state regarding validators and epoch time */
    async _setAndGetInfo() {
        try {
            let validatorCount = await this.internalMethod("validators", "validatorCount");
            let validatorMax = await this.internalMethod("validators", "validatorMaxCount");
            let epoch = await this.getEpoch();
            store.dispatch(ADAPTER_ACTIONS.setWeb3Info(epoch, validatorCount, validatorMax));
        } catch (ex) {
            console.error("Could not get validator info.", ex);
            throw new Error(ex);
        }
    }

    /**
     * Add an account to the adapter/web3 instance and retrieve latest info for it.
     * Upon getting the latest information, return that as well.
     * @param { String } privK - Private key for the account to add. 
     * @returns 
     */
    async useAccount(privK) {
        try {
            let account = await this.web3.eth.accounts.privateKeyToAccount("0x" + privK);
            await this.web3.eth.accounts.wallet.add(account);
            this.selectedAddress = account["address"];
            let accountInfo = await this.updateAccount()
            return accountInfo;
        } catch (ex) {
            return { error: ex }
        }
    }

    /**
     * Retrieve account information from contracts
     * Additionally update redux balance state anytime account information is pulled
     * @returns { Object } - Returns object with balances and validatorInfo
     */
    async updateAccount() {
        try {
            let balances = await this.getAccountBalances(this.selectedAddress);
            this.getEpoch(); // Fire off an epoch update
            // Get the latest validator information on account updates
            let validatorInfo = await this.getValidatorInfo();
            // Update the balances in the redux store
            this.account = {
                address: this.selectedAddress,
                balances,
                "validatorInfo": validatorInfo
            };
            return this.account;
        } catch (ex) {
            return { error: ex }
        }
    }

    /**
     * Get ETH, Staking, and Utility account balances for a specified address
     * @param { String } address 
     * @returns { Object } - Object containing balance keys: "eth", "stakingToken", and "utilityToken" 
     */
    async getAccountBalances(address) {
        try {
            let ethBalance = await this.getEthBalance(address);
            let [stakingBalance, stakingAllowance, utilityBalance, utilityAllowance] = await this.getTokenBalances(address);
            this.getEpoch(); // Fire off an epoch update
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
            return balances;
        } catch (ex) {
            return { error: ex }
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
            let method = await ABI[contract].find(e => e["name"] === fn);
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
        if (!c || !m) {
            return { error: "Missing contract or method" }
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
                return { error: "Arguments given do not match contract method arguments" }
            }
            if (method.stateMutability === 'view') {
                await this.call(contract, method, args);
            } else {
                await this.send(contract, method, args);
            }
        } catch (ex) {
            return { error: ex }
        }
    }

    // Call a contract method
    async call(contract, fn, args) {
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
            return { error: ex };
        }
        return true;
    }

    // Send a transaction to a contract method
    async send(contract, fn, args) {
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
            return { error: ex.message }
        }
        return {
            "msg": "Tx Hash: " + this.trimTxHash(tx.transactionHash),
            "type": "success"
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

    /**
     * Get Ethereum balance in "Ether"
     * @param { String } address 
     * @returns { String } - Balance
     */
    async getEthBalance(address) {
        try {
            let balance = await this.web3.utils.fromWei(await this.web3.eth.getBalance(address ? address : this.selectedAddress), 'ether');
            return balance.substring(0, 12);
        } catch (ex) {
            return { error: ex }
        }
    }

    /**
     * Fetch STAKE and UTIL token balances
     * @param { String } address - Addres to fetch the balances for 
     * @returns 
     */
    async getTokenBalances(address) {
        try {
            let stakingToken = await this.getContract("stakingToken");
            let stakingBalance = await stakingToken.methods.balanceOf(address ? address : this.selectedAddress).call();
            let staking = await this.getContract("staking");
            let stakingAllowance = await stakingToken.methods.allowance(address ? address : this.selectedAddress, staking["_address"]).call();

            let utilityToken = await this.getContract("utilityToken");
            let utilityBalance = await utilityToken.methods.balanceOf(address ? address : this.selectedAddress).call();
            let utility = await this.getContract("deposit");
            let utilityAllowance = await utilityToken.methods.allowance(address ? address : this.selectedAddress, utility["_address"]).call();

            return [stakingBalance, stakingAllowance, utilityBalance, utilityAllowance];
        } catch (ex) {
            return [{ error: ex }]
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
            return ({ error: ex.message })
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
            return { error: ex.message }
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
            return ({ error: ex.message })
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
            return ({ error: ex.message })
        }
    }

    // Lock or Unlock staking balance
    async lockUnlockStake(amount, fn) {
        try {
            let data = {}
            data["amount"] = amount;
            await this.method("staking", fn, data);
        } catch (ex) {
            return ({ error: ex.message })
        }
    }

    /**
     * Get the current validator epoch and set to redux store -- Set to "" if not available
     */
    async getEpoch() {
        try {
            let epoch = await this.internalMethod("staking", "currentEpoch");
            store.dispatch(ADAPTER_ACTIONS.setWeb3Epoch(epoch))
            return epoch;
        } catch (ex) {
            store.dispatch(ADAPTER_ACTIONS.setWeb3Epoch(""))
            return { error: ex }
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

// Singleton Adapter to use throughout the application
const web3Adapter = new Web3Adapter();

export default web3Adapter;