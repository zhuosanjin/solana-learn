import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SplToken } from "../target/types/spl_token";
import { Mint, TOKEN_2022_PROGRAM_ID, getMint, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction } from "@solana/spl-token";


describe("spl-token", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.splToken as Program<SplToken>;
  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );

  const payer = program.provider.wallet.publicKey;

  const senderKeypair = anchor.web3.Keypair.generate();
  const sender = senderKeypair.publicKey;
  const recipientKeypair = anchor.web3.Keypair.generate();
  const recipient = recipientKeypair.publicKey;

  let mintAccount: Mint;
  let tokenAccount: anchor.web3.PublicKey;
  let senderTokenAccount: anchor.web3.PublicKey;
  let recipientTokenAccount: anchor.web3.PublicKey;

  it("Create Mint...", async () => {
    const tx = await program.methods.createMint()
      .accounts({
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc({ commitment: "confirmed" });
    console.log("Your transaction signature", tx);

    mintAccount = await getMint(
      program.provider.connection,
      mint,
      "confirmed",
      TOKEN_2022_PROGRAM_ID
    );

    console.log("Mint Account: ", mintAccount);
  });

  it("Create Token Account...", async () => {
    const tx = await program.methods.createTokenAccount()
      .accounts({
        mint: mintAccount.address,
        tokenProgram: TOKEN_2022_PROGRAM_ID
      })
      .rpc({ commitment: "confirmed" });
    console.log("Your transaction signature", tx);

    tokenAccount = await getAssociatedTokenAddressSync(
      mintAccount.address,
      program.provider.wallet.publicKey,
      true,
      TOKEN_2022_PROGRAM_ID
    );
    console.log("Created Token Account Address:", tokenAccount.toBase58());

    senderTokenAccount = await getAssociatedTokenAddressSync(
      mintAccount.address,
      sender,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    recipientTokenAccount = await getAssociatedTokenAddressSync(
      mintAccount.address,
      recipient,
      false,
      TOKEN_2022_PROGRAM_ID
    );
    const createATAsTx = new anchor.web3.Transaction();
    createATAsTx.add(
      createAssociatedTokenAccountInstruction(
        payer,
        senderTokenAccount,
        sender,
        mintAccount.address,
        TOKEN_2022_PROGRAM_ID
      )
    )
    createATAsTx.add(
        createAssociatedTokenAccountInstruction(
            payer,
            recipientTokenAccount,
            recipient,
            mintAccount.address,
            TOKEN_2022_PROGRAM_ID
        )
    );
    const tx_add = await program.provider.sendAndConfirm(createATAsTx, []);
    console.log("Sender/Recipient Token Accounts creation signature:", tx_add);
    console.log("SenderTokenAccount: " + senderTokenAccount.toBase58());
    console.log("RecipientTokenAccount: " + recipientTokenAccount.toBase58());
  });

  it("Mint Tokens To TokenAccount...", async () => {
    const amount = new anchor.BN(1000 * 10 ** mintAccount.decimals);
    const tx = await program.methods.mintTokens(amount)
      .accounts({
        mint: mintAccount.address,
        tokenAccount: tokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID
      })
      .rpc({ commitment: "confirmed" });
    console.log("Your transaction signature ", tx);
  });

  it("Transfer Tokens one...", async () => {
    const tx_one = await program.methods.transferTokens(new anchor.BN(600 * 10 ** mintAccount.decimals))
      .accounts({
        mint: mintAccount.address,
        sendTokenAccount: tokenAccount,
        recipientTokenAccount: senderTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID
      })
      .rpc({ commitment: "confirmed" });
    console.log("One transaction signature ", tx_one);
  });

  it("Transfer Tokens two...", async () => {
    const tx_two = await program.methods.transferTokens(new anchor.BN(400 * 10 ** mintAccount.decimals))
      .accounts({
        signer: sender,
        mint: mintAccount.address,
        sendTokenAccount: senderTokenAccount,
        recipientTokenAccount: recipientTokenAccount,
        tokenProgram: TOKEN_2022_PROGRAM_ID
      })
      .signers([senderKeypair])
      .rpc({ commitment: "confirmed" });
    console.log("Two transaction signature ", tx_two);
  });
});
