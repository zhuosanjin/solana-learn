import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

const address1 = 'yA9tP16C2x7VCQ3fi1GsWAB6SfALzo9mt4ncppPQper';
const address2 = '9Q7NpAnUdGswNxpRXst4kaLGUg8mFtfLDPcd1n369M4j';
const publickey1 = new PublicKey(address1);
const publickey2 = new PublicKey(address2);

const connection = new Connection(clusterApiUrl("devnet"));

const balance1 = await connection.getBalance(publickey1);
const balanceInSol1 = balance1 / LAMPORTS_PER_SOL;
const balance2 = await connection.getBalance(publickey2);
const balanceInSol2 = balance2 / LAMPORTS_PER_SOL;

console.log(`The balance of the account at ${address1} is ${balanceInSol1} lamports`); 
console.log(`The balance of the account at ${address2} is ${balanceInSol2} lamports`); 
console.log(`✅ Finished!`) 