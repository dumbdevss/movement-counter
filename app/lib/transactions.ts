import {
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';
import { aptos, CONTRACT_ADDRESS, toHex } from './aptos';

export type CounterAction = 'increment' | 'decrement';

export interface CounterTransaction {
  action: CounterAction;
  amount: number;
}

export interface SignRawHashFunction {
  (params: { address: string; chainType: 'aptos'; hash: `0x${string}` }): Promise<{
    signature: string;
  }>;
}

/**
 * Get the contract function name for a counter action
 */
export const getCounterFunction = (action: CounterAction): `${string}::${string}::${string}` => {
  const functionName = action === 'increment' ? 'add_counter' : 'subtract_counter';
  return `${CONTRACT_ADDRESS}::counter::${functionName}` as `${string}::${string}::${string}`;
};

/**
 * Build and submit a single counter transaction with gas sponsorship
 */
export const submitCounterTransaction = async (
  action: CounterAction,
  amount: number,
  walletAddress: string,
  publicKeyHex: string,
  signRawHash: SignRawHashFunction
): Promise<string> => {
  try {
    // Build the transaction with feePayer enabled (for sponsored transactions)
    const rawTxn = await aptos.transaction.build.simple({
      sender: walletAddress,
      withFeePayer: true,
      data: {
        function: getCounterFunction(action),
        typeArguments: [],
        functionArguments: [amount],
      },
    });

    // Generate signing message
    const message = generateSigningMessageForTransaction(rawTxn);

    // Sign with Privy wallet
    const { signature: rawSignature } = await signRawHash({
      address: walletAddress,
      chainType: 'aptos',
      hash: `0x${toHex(message)}`,
    });

    // Create authenticator
    // Ensure publicKeyHex is properly formatted (remove 0x prefix and any leading bytes)
    let cleanPublicKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;

    // If public key is 66 characters (33 bytes), remove the first byte (00 prefix)
    if (cleanPublicKey.length === 66) {
      cleanPublicKey = cleanPublicKey.slice(2);
    }

    const senderAuthenticator = new AccountAuthenticatorEd25519(
      new Ed25519PublicKey(cleanPublicKey),
      new Ed25519Signature(rawSignature.startsWith('0x') ? rawSignature.slice(2) : rawSignature)
    );

    // Create SimpleTransaction object for serialization
    // For feePayer transactions, we pass undefined as feePayerAddress since it will be added by the backend
    const simpleTransaction = new SimpleTransaction(rawTxn.rawTransaction);

    // Serialize transaction and signature for backend sponsorship
    const serializedTransaction = simpleTransaction.bcsToHex().toString();
    const serializedSignature = senderAuthenticator.bcsToHex().toString();

    // Send to backend for gas sponsorship
    const response = await fetch('/api/sponsor-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serializedTransaction,
        senderSignature: serializedSignature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to sponsor transaction');
    }

    const result = await response.json();

    // Wait for confirmation
    const executed = await aptos.waitForTransaction({
      transactionHash: result.transactionHash,
    });

    if (!executed.success) {
      throw new Error('Transaction failed');
    }

    return result.transactionHash;
  } catch (error) {
    console.error(`Error submitting ${action} transaction:`, error);
    throw error;
  }
};

/**
 * Fetch current counter value from blockchain
 */
export const fetchCounterValue = async (address: string): Promise<number | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::counter::get_counter`,
        typeArguments: [],
        functionArguments: [address],
      },
    });

    return Number(result[0]);
  } catch (error) {
    console.error('Error fetching counter value:', error);
    return null;
  }
};
