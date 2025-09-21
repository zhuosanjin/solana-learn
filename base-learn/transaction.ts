import {
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";
import "dotenv/config"
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";

const myWalletAddress = 'yA9tP16C2x7VCQ3fi1GsWAB6SfALzo9mt4ncppPQper';

const senderKeypair = getKeypairFromEnvironment("SECRET_KEY");

const receive = new PublicKey(myWalletAddress);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const LAMPORTS_TO_SEND = 2 * LAMPORTS_PER_SOL;

const transaction = new Transaction();
const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: senderKeypair.publicKey,
    toPubkey: receive,
    lamports: LAMPORTS_TO_SEND
});
transaction.add(sendSolInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

console.log(`💸 Finished! Sent ${LAMPORTS_TO_SEND} to the address ${receive}. `);

console.log(`Transaction signature is ${signature}!`);
