import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";

const address = "6vGDEa55pmfLxAHFXZuYFcJhrm6QrCQLKqop4skhsRsx";
const publickey = new PublicKey(address);

const connection = new Connection("http://localhost:8899", "confirmed");

const balance = await connection.getBalance(publickey);
const balanceInSol = balance / LAMPORTS_PER_SOL;

console.log(`The balance of the account at ${address} is ${balanceInSol} lamports`); 
console.log(`✅ Finished!`)
