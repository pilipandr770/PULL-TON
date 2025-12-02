/**
 * Deploy script for CommunityTonPoolMainnet
 * 
 * ВАЖНО: Этот скрипт для MAINNET!
 * Убедитесь, что:
 * 1. У вас есть реальные TON для деплоя (~0.5 TON)
 * 2. Вы указали правильный адрес Nominator Pool
 * 3. Вы готовы к работе с реальными средствами
 */

import { toNano, Address } from '@ton/core';
import { TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import * as dotenv from 'dotenv';

dotenv.config();

// ============================================================================
// КОНФИГУРАЦИЯ
// ============================================================================

// Mainnet endpoint (можно использовать toncenter или свою ноду)
const MAINNET_ENDPOINT = 'https://toncenter.com/api/v2/jsonRPC';
const MAINNET_API_KEY = process.env.TONCENTER_API_KEY || ''; // Получить на https://toncenter.com

// Официальные Nominator Pools (примеры - проверьте актуальные!)
const NOMINATOR_POOLS = {
    // TON Whales pool
    whales: 'EQCkWxfyhAkim3g2DjKQQg8T5P4g-Q1-K_jErGcDJZ4i-vqR',
    // Другие проверенные пулы можно добавить сюда
};

// ============================================================================
// СКРИПТ ДЕПЛОЯ
// ============================================================================

async function deployMainnet() {
    console.log('🚀 MAINNET DEPLOYMENT');
    console.log('⚠️  WARNING: This will deploy to MAINNET with REAL TON!');
    console.log('');
    
    // Проверяем наличие мнемоники
    if (!process.env.MAINNET_MNEMONIC) {
        console.error('❌ MAINNET_MNEMONIC not found in .env');
        console.log('');
        console.log('Add to .env:');
        console.log('MAINNET_MNEMONIC="word1 word2 word3 ... word24"');
        console.log('');
        console.log('⚠️  Use a SEPARATE wallet for mainnet deployment!');
        process.exit(1);
    }
    
    // Проверяем API key
    if (!MAINNET_API_KEY) {
        console.warn('⚠️  No TONCENTER_API_KEY - requests may be rate limited');
    }
    
    // Подключаемся к mainnet
    const client = new TonClient({
        endpoint: MAINNET_ENDPOINT,
        apiKey: MAINNET_API_KEY
    });
    
    console.log('📡 Connected to TON Mainnet');
    
    // Создаём кошелёк из мнемоники
    const mnemonic = process.env.MAINNET_MNEMONIC.split(' ');
    const keyPair = await mnemonicToPrivateKey(mnemonic);
    
    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    });
    
    const walletContract = client.open(wallet);
    const walletAddress = wallet.address.toString();
    
    console.log('👛 Wallet address:', walletAddress);
    
    // Проверяем баланс
    const balance = await walletContract.getBalance();
    console.log('💰 Wallet balance:', Number(balance) / 1e9, 'TON');
    
    if (balance < toNano('0.5')) {
        console.error('❌ Insufficient balance. Need at least 0.5 TON for deployment.');
        process.exit(1);
    }
    
    // Выбираем Nominator Pool
    const nominatorPoolAddress = process.env.NOMINATOR_POOL_ADDRESS || NOMINATOR_POOLS.whales;
    console.log('🏊 Nominator Pool:', nominatorPoolAddress);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  DEPLOYMENT PARAMETERS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Network:        MAINNET');
    console.log('  Owner:          ' + walletAddress);
    console.log('  Nominator Pool: ' + nominatorPoolAddress);
    console.log('  Version:        1');
    console.log('  Min Deposit:    1 TON');
    console.log('  Min Nominator:  10,001 TON');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Подтверждение
    console.log('⏳ Deployment will start in 10 seconds...');
    console.log('   Press Ctrl+C to cancel');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('');
    console.log('🔨 Building contract...');
    
    // Здесь нужно скомпилировать контракт
    // В реальности используется @tact-lang/compiler
    
    // Для демонстрации - выводим инструкции
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('');
    console.log('1. Compile the mainnet contract:');
    console.log('   npx tact --config tact.config.json');
    console.log('');
    console.log('2. Deploy using the compiled .boc file');
    console.log('');
    console.log('3. Update backend/.env with new contract address:');
    console.log('   MAINNET_POOL_CONTRACT_ADDRESS=<new_address>');
    console.log('');
    console.log('4. Set NETWORK=mainnet in production');
}

// ============================================================================
// ПРОВЕРКА СОСТОЯНИЯ КОНТРАКТА
// ============================================================================

async function checkMainnetPool() {
    const contractAddress = process.env.MAINNET_POOL_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
        console.error('❌ MAINNET_POOL_CONTRACT_ADDRESS not set');
        process.exit(1);
    }
    
    const client = new TonClient({
        endpoint: MAINNET_ENDPOINT,
        apiKey: MAINNET_API_KEY
    });
    
    console.log('🔍 Checking mainnet pool:', contractAddress);
    
    const address = Address.parse(contractAddress);
    
    // Проверяем существование контракта
    const contractState = await client.getContractState(address);
    
    if (contractState.state !== 'active') {
        console.log('❌ Contract is not active:', contractState.state);
        return;
    }
    
    console.log('✅ Contract is active');
    console.log('💰 Balance:', Number(contractState.balance) / 1e9, 'TON');
    
    // Получаем состояние пула
    try {
        const result = await client.runMethod(address, 'poolState');
        
        console.log('');
        console.log('📊 Pool State:');
        console.log('   Total Deposits:', Number(result.stack.readBigNumber()) / 1e9, 'TON');
        console.log('   Total Shares:', Number(result.stack.readBigNumber()) / 1e9);
        console.log('   Staked to Nominator:', Number(result.stack.readBigNumber()) / 1e9, 'TON');
        console.log('   Pending Rewards:', Number(result.stack.readBigNumber()) / 1e9, 'TON');
        console.log('   Withdraw Queue:', Number(result.stack.readBigNumber()) / 1e9, 'TON');
    } catch (e) {
        console.log('⚠️  Could not read pool state:', e);
    }
}

// ============================================================================
// CLI
// ============================================================================

const command = process.argv[2];

switch (command) {
    case 'deploy':
        deployMainnet();
        break;
    case 'check':
        checkMainnetPool();
        break;
    default:
        console.log('Usage:');
        console.log('  npx tsx scripts/deploy-mainnet.ts deploy  - Deploy to mainnet');
        console.log('  npx tsx scripts/deploy-mainnet.ts check   - Check mainnet pool');
}
