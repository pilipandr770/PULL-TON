/**
 * CommunityTonPool Interaction Script
 * 
 * This script allows you to interact with a deployed CommunityTonPool contract.
 * 
 * Usage:
 *   npx ts-node scripts/interact.ts testnet info                    # View pool info
 *   npx ts-node scripts/interact.ts testnet deposit 5               # Deposit 5 TON
 *   npx ts-node scripts/interact.ts testnet withdraw 1000000000000  # Withdraw shares
 *   npx ts-node scripts/interact.ts testnet balance <address>       # Check user balance
 */

import { TonClient, WalletContractV4, internal, toNano, fromNano, Address, beginCell } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { CommunityTonPool, Withdraw } from '../build/CommunityTonPool.tact_CommunityTonPool';
import * as dotenv from 'dotenv';

dotenv.config();

// Contract address - update this after deployment!
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';

async function main() {
    const args = process.argv.slice(2);
    const network = args[0] || 'testnet';
    const command = args[1] || 'info';
    const param = args[2];

    const isTestnet = network !== 'mainnet';

    // Setup client
    const endpoint = isTestnet 
        ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
        : 'https://toncenter.com/api/v2/jsonRPC';

    const client = new TonClient({ endpoint });

    // Get contract address
    let poolAddress: Address;
    if (CONTRACT_ADDRESS) {
        poolAddress = Address.parse(CONTRACT_ADDRESS);
    } else {
        // Compute address from init
        const pool = await CommunityTonPool.fromInit();
        poolAddress = pool.address;
    }

    console.log(`\n📍 Pool Address: ${poolAddress.toString()}`);
    console.log(`🌐 Network: ${isTestnet ? 'TESTNET' : 'MAINNET'}\n`);

    const poolContract = client.open(CommunityTonPool.fromAddress(poolAddress));

    switch (command) {
        case 'info':
            await showPoolInfo(poolContract);
            break;

        case 'deposit':
            await deposit(client, poolContract, param);
            break;

        case 'withdraw':
            await withdraw(client, poolContract, param);
            break;

        case 'balance':
            await checkBalance(poolContract, param);
            break;

        default:
            console.log('Unknown command. Available commands:');
            console.log('  info                    - Show pool information');
            console.log('  deposit <amount>        - Deposit TON to pool');
            console.log('  withdraw <shares>       - Withdraw shares from pool');
            console.log('  balance <address>       - Check user shares');
    }
}

async function showPoolInfo(poolContract: any) {
    console.log('📊 Pool Information:');
    console.log('─'.repeat(40));

    try {
        const poolBalance = await poolContract.getPoolBalance();
        const totalShares = await poolContract.getTotalPoolShares();
        const sharePrice = await poolContract.getSharePrice();

        console.log(`   Pool Balance:  ${fromNano(poolBalance)} TON`);
        console.log(`   Total Shares:  ${totalShares.toString()}`);
        console.log(`   Share Price:   ${sharePrice > 0 ? fromNano(sharePrice) : '0'} TON`);
        console.log(`   Min Deposit:   1 TON`);
        console.log('─'.repeat(40));
    } catch (e: any) {
        console.log(`❌ Error: ${e.message}`);
        console.log('   Contract may not be deployed yet.');
    }
}

async function deposit(client: TonClient, poolContract: any, amountStr?: string) {
    if (!amountStr) {
        console.log('❌ Please specify amount in TON');
        console.log('   Example: npx ts-node scripts/interact.ts testnet deposit 5');
        return;
    }

    const amount = parseFloat(amountStr);
    if (amount < 1) {
        console.log('❌ Minimum deposit is 1 TON');
        return;
    }

    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.log('❌ MNEMONIC not found in .env file');
        return;
    }

    console.log(`💰 Depositing ${amount} TON...`);

    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0
    });

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    // Check balance before
    const userSharesBefore = await poolContract.getUserShares(wallet.address);
    console.log(`   Your shares before: ${userSharesBefore.toString()}`);

    await walletContract.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: poolContract.address,
                value: toNano(amount.toString()),
                body: beginCell().storeUint(0, 32).storeStringTail('deposit').endCell()
            })
        ]
    });

    console.log('⏳ Transaction sent. Waiting for confirmation...');
    await sleep(10000);

    const userSharesAfter = await poolContract.getUserShares(wallet.address);
    console.log(`   Your shares after: ${userSharesAfter.toString()}`);
    console.log(`   Shares received: ${(userSharesAfter - userSharesBefore).toString()}`);
    console.log('✅ Deposit successful!');
}

async function withdraw(client: TonClient, poolContract: any, sharesStr?: string) {
    if (!sharesStr) {
        console.log('❌ Please specify number of shares to withdraw');
        console.log('   Example: npx ts-node scripts/interact.ts testnet withdraw 1000000000000');
        return;
    }

    const shares = BigInt(sharesStr);
    if (shares <= 0) {
        console.log('❌ Shares must be greater than 0');
        return;
    }

    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.log('❌ MNEMONIC not found in .env file');
        return;
    }

    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0
    });

    const walletContract = client.open(wallet);

    // Check user shares
    const userShares = await poolContract.getUserShares(wallet.address);
    console.log(`   Your current shares: ${userShares.toString()}`);

    if (shares > userShares) {
        console.log('❌ Not enough shares');
        return;
    }

    console.log(`💸 Withdrawing ${shares.toString()} shares...`);

    const seqno = await walletContract.getSeqno();

    const withdrawMsg: Withdraw = {
        $$type: 'Withdraw',
        shares: shares
    };

    await poolContract.send(
        walletContract.sender(keyPair.secretKey),
        { value: toNano('0.05') },
        withdrawMsg
    );

    console.log('⏳ Transaction sent. Waiting for confirmation...');
    await sleep(10000);

    const userSharesAfter = await poolContract.getUserShares(wallet.address);
    console.log(`   Your shares after: ${userSharesAfter.toString()}`);
    console.log('✅ Withdrawal successful!');
}

async function checkBalance(poolContract: any, addressStr?: string) {
    if (!addressStr) {
        // Check own balance
        const mnemonic = process.env.MNEMONIC;
        if (!mnemonic) {
            console.log('❌ Please specify an address or set MNEMONIC in .env');
            return;
        }

        const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
        const wallet = WalletContractV4.create({
            publicKey: keyPair.publicKey,
            workchain: 0
        });

        addressStr = wallet.address.toString();
    }

    try {
        const address = Address.parse(addressStr);
        const userShares = await poolContract.getUserShares(address);
        const totalShares = await poolContract.getTotalPoolShares();
        const poolBalance = await poolContract.getPoolBalance();

        console.log(`📊 Balance for ${addressStr}:`);
        console.log('─'.repeat(50));
        console.log(`   Shares: ${userShares.toString()}`);
        
        if (totalShares > 0) {
            const percentage = (Number(userShares) / Number(totalShares) * 100).toFixed(4);
            const estimatedValue = (Number(poolBalance) * Number(userShares) / Number(totalShares));
            console.log(`   Pool %: ${percentage}%`);
            console.log(`   Estimated value: ${fromNano(BigInt(Math.floor(estimatedValue)))} TON`);
        }
        console.log('─'.repeat(50));
    } catch (e: any) {
        console.log(`❌ Error: ${e.message}`);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
