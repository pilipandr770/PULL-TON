/**
 * CommunityTonPool Deployment Script
 * 
 * This script deploys the CommunityTonPool contract to the TON testnet or mainnet.
 * 
 * Prerequisites:
 * 1. Create a .env file with your wallet mnemonic:
 *    MNEMONIC=word1 word2 word3 ... word24
 * 
 * 2. For testnet, get test TON from https://t.me/testgiver_ton_bot
 * 
 * Usage:
 *   npx ts-node scripts/deploy.ts testnet   # Deploy to testnet
 *   npx ts-node scripts/deploy.ts mainnet   # Deploy to mainnet
 */

import { TonClient, WalletContractV4, internal, toNano, fromNano } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { CommunityTonPool } from '../build/CommunityTonPool.tact_CommunityTonPool';
import * as dotenv from 'dotenv';

dotenv.config();

// Retry helper for rate-limited requests
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5, baseDelay = 3000): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            if (error?.response?.status === 429 && attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`   ⏳ Rate limited, waiting ${delay/1000}s... (attempt ${attempt + 1}/${maxRetries})`);
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded');
}

async function main() {
    // Determine network from command line args
    const network = process.argv[2] || 'testnet';
    const isTestnet = network !== 'mainnet';

    console.log(`\n🚀 Deploying CommunityTonPool to ${isTestnet ? 'TESTNET' : 'MAINNET'}...\n`);

    // Check mnemonic
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.error('❌ Error: MNEMONIC not found in .env file');
        console.log('\nPlease create a .env file with your wallet mnemonic:');
        console.log('MNEMONIC=word1 word2 word3 ... word24');
        process.exit(1);
    }

    // API key for higher rate limits (optional)
    const apiKey = process.env.TONCENTER_API_KEY;

    // Setup client
    const endpoint = isTestnet 
        ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
        : 'https://toncenter.com/api/v2/jsonRPC';

    const client = new TonClient({ 
        endpoint,
        apiKey // Will be undefined if not set, which is fine
    });

    // Setup wallet
    const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0
    });

    const walletContract = client.open(wallet);
    const balance = await withRetry(() => walletContract.getBalance());

    console.log(`📝 Deployer wallet: ${wallet.address.toString()}`);
    console.log(`💰 Wallet balance: ${fromNano(balance)} TON`);

    // Check minimum balance
    if (balance < toNano('0.5')) {
        console.error('\n❌ Error: Insufficient balance. Need at least 0.5 TON for deployment.');
        if (isTestnet) {
            console.log('Get test TON from: https://t.me/testgiver_ton_bot');
        }
        process.exit(1);
    }

    // Initialize contract with version 2 (auto-deposit)
    const POOL_VERSION = 2n;
    const pool = await CommunityTonPool.fromInit(POOL_VERSION);
    const poolContract = client.open(pool);

    console.log(`\n📍 Contract address: ${pool.address.toString()}`);
    console.log(`📦 Pool version: ${POOL_VERSION}`);

    // Check if already deployed
    const deployedCode = await withRetry(() => client.getContractState(pool.address));
    if (deployedCode.state === 'active') {
        console.log('\n✅ Contract is already deployed!');
        await printPoolInfo(poolContract);
        return;
    }

    // Deploy
    console.log('\n⏳ Deploying contract...');
    
    const seqno = await withRetry(() => walletContract.getSeqno());
    
    await sleep(2000); // Small delay before sending tx
    
    await walletContract.sendTransfer({
        secretKey: keyPair.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: pool.address,
                value: toNano('0.5'), // Deploy amount (will stay in contract)
                init: pool.init,
                body: pool.init ? undefined : undefined // Empty body for initial deployment
            })
        ]
    });

    // Wait for deployment
    console.log('⏳ Waiting for deployment confirmation...');
    
    let attempts = 0;
    while (attempts < 30) {
        await sleep(3000);
        try {
            const state = await withRetry(() => client.getContractState(pool.address));
            if (state.state === 'active') {
                console.log('\n✅ Contract deployed successfully!');
                break;
            }
        } catch (e) {
            // Continue trying
        }
        attempts++;
        process.stdout.write('.');
    }

    if (attempts >= 30) {
        console.log('\n⚠️ Deployment may still be in progress. Check address manually.');
    }

    await printPoolInfo(poolContract);

    console.log('\n📋 Contract Links:');
    const explorerBase = isTestnet 
        ? 'https://testnet.tonviewer.com/' 
        : 'https://tonviewer.com/';
    console.log(`   Explorer: ${explorerBase}${pool.address.toString()}`);
    
    console.log('\n🎉 Deployment complete!');
}

async function printPoolInfo(poolContract: any) {
    try {
        console.log('\n📊 Pool Info:');
        const poolBalance = await poolContract.getPoolBalance();
        const totalShares = await poolContract.getTotalPoolShares();
        const sharePrice = await poolContract.getSharePrice();

        console.log(`   Pool Balance: ${fromNano(poolBalance)} TON`);
        console.log(`   Total Shares: ${totalShares.toString()}`);
        console.log(`   Share Price: ${sharePrice > 0 ? fromNano(sharePrice) : 0} TON`);
    } catch (e) {
        console.log('   (Unable to fetch pool info - contract may not be fully initialized)');
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);
