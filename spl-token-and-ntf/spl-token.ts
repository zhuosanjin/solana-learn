import * as token from '@solana/spl-token'
import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { getKeypairFromEnvironment } from "@solana-developers/node-helpers";
import "dotenv/config"

// 创建一个铸币厂
async function createNewMint(
    connection: Connection,
    payer: Keypair,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    decimals: number
): Promise<PublicKey> {
    const mint = await token.createMint(
        connection,
        payer,
        mintAuthority,
        freezeAuthority,
        decimals
    );

    console.log(`Token Mint: https://explorer.solana.com/address/${mint}?cluster=devnet`);
    return mint;
}

// 创建一个代币账户
async function createTokenAccount(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
    owner: PublicKey
) {
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        owner
    );

    console.log(`Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`);
    return tokenAccount;
}

// 铸造代币
async function mintTokens(
    connection: Connection,
    payer: Keypair,
    mint: PublicKey,
    destination: PublicKey,
    authority: Keypair,
    amount: number
) {
    const transactionSignature = await token.mintTo(
        connection,
        payer,
        mint,
        destination,
        authority,
        amount
    );

    console.log(`Minted ${amount} tokens to ${destination.toBase58()}`);
    console.log(`Transaction Signature: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
}

// 交易代币
async function transferTokens(
    connection: Connection,
    payer: Keypair,
    source: PublicKey,
    destination: PublicKey,
    owner: Keypair,
    amount: number
) {
    const transactionSignature = await token.transfer(
        connection,
        payer,
        source,
        destination,
        owner,
        amount
    );

    console.log(`Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`);
}

async function main() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const user = getKeypairFromEnvironment("SECRET_KEY");
    // 创建一个新的铸币厂，6位小数
    const mint = await createNewMint(
        connection,
        user,
        user.publicKey,
        user.publicKey,
        6
    );

    // 获取铸币厂信息
    const mintInfo = await token.getMint(connection, mint);
    console.log(mintInfo);

    // 创建一个代币账户
    const tokenAccount = await createTokenAccount(
        connection,
        user,
        mint,
        user.publicKey
    );
    console.log(`代币账户: ${tokenAccount.address.toBase58()}`);

    // 铸造代币到代币账户
    await mintTokens(
        connection,
        user,
        mint,
        tokenAccount.address,
        user,
        1000 * 10 ** mintInfo.decimals
    );
    console.log('铸造 1000 代币到账户 ' + tokenAccount.address.toBase58());

    // 创建交易代币账户
    const receiver = Keypair.generate().publicKey;
    const receiverTokenAccount = await createTokenAccount(
        connection,
        user,
        mint,
        receiver
    );
    console.log(`账户: ${receiverTokenAccount.address.toBase58()}`);

    // 交易代币
    await transferTokens(
        connection,
        user,
        tokenAccount.address,
        receiverTokenAccount.address,
        user,
        100 * 10 ** 6
    );
    console.log(`从 ${tokenAccount.address} 交易 100 代币到账户 ${receiverTokenAccount.address}`);
    console.log("Done.");
}

await main()