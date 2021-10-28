export const transactionTypes = {
    DATA_STORE: 1,
    VALUE_STORE: 2,
}

export const transactionStatus = {
    CREATION: 1,
    LOADING: 2,
    INSPECTION: 3,
}

const transactionStatusProgression = [transactionStatus.CREATION, transactionStatus.LOADING, transactionStatus.INSPECTION];

export const getNextTransactionStatus = (status) => transactionStatusProgression[status % transactionStatusProgression.length];