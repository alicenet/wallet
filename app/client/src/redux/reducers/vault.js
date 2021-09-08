import { VAULT_ACTION_TYPES  } from '../constants/_constants';

// The user reducer contains all information regarding the user and their wallets state
const initialVaultState = {
    wallets: {
        internal: [],
        external: [],
    }
}

/* User Reducer */
export default function vaultReducer(state = initialVaultState, action) {

    switch (action.type) {

        case VAULT_ACTION_TYPES.ADD_EXTERNAL_WALLET:
            return Object.assign({}, state, {
                wallets: { internal: state.wallets.internal, external: [...state.wallets.external, action.payload] }
            })

        case VAULT_ACTION_TYPES.ADD_INTERNAL_WALLET:
            return Object.assign({}, state, {
                wallets: { internal: [...state.wallets.internal, action.payload], external: state.wallets.external }
            })

        default: return state;

    }

}