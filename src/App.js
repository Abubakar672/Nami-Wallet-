import React, { useEffect, useState } from 'react';
import './App.css';

import NamiWalletApi, { Cardano } from './nami-js';
import blockfrostApiKey from '../config.js'; 
let nami;


export default function App() {
    const [connected, setConnected] = useState()
    const [address, setAddress] = useState()
    const [nfts, setNfts] = useState([])
    const [balance, setBalance] = useState()
    const [transaction, setTransaction] = useState()
    const [amount, setAmount] = useState("10")
    const [txHash, setTxHash] = useState()
    const [recipientAddress, setRecipientAddress] = useState()
    const [witnesses, setWitnesses] = useState()

    useEffect(() => {
        async function t() {

            const S = await Cardano();
            nami = new NamiWalletApi(
                S,
                window.cardano,
               blockfrostApiKey
            )


            if (await nami.isInstalled()) {
                await nami.isEnabled().then(result => { setConnected(result) })

            }
        }

        t()
    }, [])

    //CONNECT BUTTON HERE 
    const connect = async () => {
        await nami.enable()
            .then(result => setConnected(result))
            .catch(e => console.log(e))
    }

    // WALLET ADDRESS GETTING HERE
    const getAddress = async () => {
        if (!connected) {
            await connect()
        }
        await nami.getAddress().then((newAddress) => { console.log(newAddress); setAddress(newAddress) })
    }

    //GETTING THE BALANCE OF THE NAMI WALLET
    const getBalance = async () => {
        if (!connected) {
            await connect()
        }
        await nami.getBalance().then(result => { console.log(result); setNfts(result.assets); setBalance(result.lovelace) })
    }

    //BUILDING A TRANSACTION HERE 
    const buildTransaction = async () => {
        if (!connected) {
            await connect()
        }
        const recipients = [{ "address": recipientAddress, "amount": amount }]
        let utxos = await nami.getUtxosHex();
        const myAddress = await nami.getAddress();
        
        let netId = await nami.getNetworkId();
        const t = await nami.transaction({
            PaymentAddress: myAddress,
            recipients: recipients,
            metadata: null,
            utxosRaw: utxos,
            networkId: netId.id,
            ttl: 3600,
            multiSig: null
        })
        console.log(t)
        setTransaction(t)
    }



    const buildFullTransaction = async () => {
        if (!connected) {
            await connect()
        }
        try {
        const recipients = complexTransaction.recipients
        const metadataTransaction = complexTransaction.metadata
        console.log(metadataTransaction)
        let utxos = await nami.getUtxosHex();
        
        const myAddress = await nami.getAddress();
        console.log(myAddress)
        let netId = await nami.getNetworkId();

        const t = await nami.transaction({
            PaymentAddress: myAddress,
            recipients: recipients,
            metadata: metadataTransaction,
            utxosRaw: utxos,
            networkId: netId.id,
            ttl: 3600,
            multiSig: null
        })
        setBuiltTransaction(t)
        const signature = await nami.signTx(t)
        console.log(t, signature, netId.id)
        const txHash = await nami.submitTx({
            transactionRaw: t,
            witnesses: [signature],

            networkId: netId.id
        })
        console.log(txHash)
        setComplextxHash(txHash)
    } catch (e){
        console.log(e)
    }
    }


    
    const signTransaction = async () => {
        if (!connected) {
            await connect()
        }

        const witnesses = await nami.signTx(transaction)
        setWitnesses(witnesses)
    }

    const submitTransaction = async () => {
        let netId = await nami.getNetworkId();
        const txHash = await nami.submitTx({
            transactionRaw: transaction,
            witnesses: [witnesses],

            networkId: netId.id
        })
        setTxHash(txHash)

    }
    return (<>
        
            <h1 style={{ textAlign: "center" }}>************ NAMI WALLET FOR NOOR NFT ************</h1>
            <div className="container">
                <div className="column" >
                    <button className={`button ${connected ? "success" : ""}`} onClick={connect} > {connected ? "Connected" : "Connect to Nami"} </button>
                </div>
                <div className="row" >
                    <button className={`button ${address ? "success" : ""}`} onClick={getAddress}> Get Your Address </button>
                    {address && <div className="item address">
                        <p>My Address:  {address} </p>
                    </div>}
                </div>
                <div className="row" >
                    <button className={`button ${balance ? "success" : ""}`} onClick={getBalance}> Get Your Balance and NFTs </button>
                    {balance && <> <div className="column" >
                        <div className="item balance"><p>Balance ₳:  {balance / 1000000.} </p>
                        </div>
                        {nfts.map((nft) => {
                            return <><div className="item nft"><p>unit: {nft.unit}</p>
                                <p>quantity: {nft.quantity}</p>
                                <p>policy: {nft.policy}</p>
                                <p>name: {nft.name}</p>
                                <p>fingerprint: {nft.fingerprint}</p>
                            </div>
                            </>

                        })}
                    </div>
                    </>
                    }
                </div>
            
   
                <div className="row" >
                    <button className={`button ${(transaction) ? "success" : ""}`} onClick={() => { if (amount && recipientAddress) buildTransaction() }}> Build Transaction</button>
                    <div className="column" >
                        <div className="item address"><p> Amount</p><input style={{ width: "100px", height: "30px", }}
                            value={amount}
                            onChange={(event) => setAmount(event.target.value.toString())} /></div>

                        <div className="item address"><p> Recipient Address</p>
                            <input style={{ width: "400px", height: "30px" }}
                                value={recipientAddress}
                                onChange={(event) => setRecipientAddress(event.target.value.toString())} /></div>
                    </div>
                </div>
                </div>
                <div className="container">
                <div className="row" >
                    <button className={`button ${(witnesses) ? "success" : ""}`} onClick={() => { if (transaction) signTransaction() }}> Sign Transaction</button>
                    <div className="column" >
                    </div>
                </div>
                <div className="row" >
                    <button className={`button ${(txHash) ? "success" : ""}`} onClick={() => { console.log(witnesses); if (witnesses) submitTransaction() }}> Submit Transaction</button>

                    <div className="column" >
                        <div className="item address">
                            <p>TxHash:  {txHash} </p>
                        </div>
                    </div>

                </div>
 
                </div>

    </>
    )
}



    