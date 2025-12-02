/**
 * Generate a new TON wallet for deployment
 */

import { mnemonicNew, mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';

async function main() {
    console.log('\n🔐 Generating new TON wallet...\n');
    
    // Generate 24-word mnemonic
    const mnemonic = await mnemonicNew(24);
    
    // Get keypair from mnemonic
    const keyPair = await mnemonicToPrivateKey(mnemonic);
    
    // Create wallet contract
    const wallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0
    });
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔑 MNEMONIC (SAVE THIS SECURELY!):');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(mnemonic.join(' '));
    console.log('═══════════════════════════════════════════════════════════');
    
    console.log('\n📍 Wallet Address (Testnet & Mainnet):');
    console.log(`   ${wallet.address.toString()}`);
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Copy the mnemonic above');
    console.log('   2. Add to .env file: MNEMONIC=word1 word2 word3...');
    console.log('   3. Get test TON from: https://t.me/testgiver_ton_bot');
    console.log('   4. Send test TON to your wallet address above');
    console.log('   5. Run: npx tsx scripts/deploy.ts testnet');
    
    console.log('\n⚠️  ВАЖНО: Сохраните mnemonic в безопасном месте!');
    console.log('    Никому не показывайте эти слова!\n');
}

main().catch(console.error);
