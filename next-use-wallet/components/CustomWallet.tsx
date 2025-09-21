'use client'

import { FC, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const MyWalletButton: FC = () => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div>
            {isClient && <WalletMultiButton />}
        </div>
    );
}

export const BalanceDisplay: FC = () => {
    const [balance, setBalance] = useState(0);
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (!connection || !publicKey) {
            return;
        }

        connection.getAccountInfo(publicKey).then((info) => {
            if (info) {
                setBalance(info.lamports / LAMPORTS_PER_SOL);
            }
        });

        const accountChangeId = connection.onAccountChange(
            publicKey,
            (updateAccountInfo, context) => {
                setBalance(updateAccountInfo.lamports / LAMPORTS_PER_SOL);
                console.log("Account changed at slot:", context.slot);
            }
        );

        return () => {
            connection.removeAccountChangeListener(accountChangeId);
        };
    }, [connection, publicKey])

    return (
        <div>
            <p>{publicKey ? `Balance: ${balance} SOL` : ""}</p>
        </div>
    );
}

export const SendSol = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [recipient, setRecipient] = useState('');
    const [solAmount, setSolAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const send = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        if (!connection || !publicKey) {
            alert("Please connection wallet !");
            return;
        }

        try {
            let recipientPublicKey: PublicKey;
            try {
                recipientPublicKey = new PublicKey(recipient);
            } catch (error) {
                alert("Error Solana Address !");
                setIsLoading(false);
                return;
            }

            const amountInSol = parseFloat(solAmount);
            if (isNaN(amountInSol) || amountInSol <= 0) {
                alert("请输入有效的 SOL 数量!");
                setIsLoading(false);
                return;
            }
            const lamportsToSend = amountInSol * LAMPORTS_PER_SOL;

            const sendInstruction = SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: recipientPublicKey,
                lamports: lamportsToSend
            });

            const transaction = new Transaction().add(sendInstruction);

            const latestBlockHash = await connection.getLatestBlockhash();
            transaction.recentBlockhash = latestBlockHash.blockhash;

            const signature = await sendTransaction(transaction, connection);

            await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signature
            });

            setIsLoading(false);
            console.log("Transaction success ! signature: " + signature);
            alert("Transaction success ! https://solscan.io/tx/" + signature + "?cluster=devnet");
        } catch (error) {
            console.log("Transaction error !");
            alert("Transaction error !" + (error as Error).message);
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={send} className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-gray-800">发送 SOL</h2>
            <Input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="接收地址"
                required
            />
            <Input
                type="number"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                placeholder="SOL 数量"
                step="any"
                required
            />
            <Button
                type="submit"
                disabled={!publicKey || isLoading}
                style={{ cursor: 'pointer' }}
            >
                {isLoading ? '发送中...' : '发送 SOL'}
            </Button>
        </form>
    );
}