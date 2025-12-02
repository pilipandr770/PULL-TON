import { TonClient, Address } from '@ton/ton';

async function check() {
    const client = new TonClient({ 
        endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC' 
    });
    
    // New contract v2
    const poolAddress = Address.parse('EQBq9-VdpNIpPICuQFC71OSMzKV3CLga6J2ZqYAZAhsYQZeI');
    
    console.log('Getting pool info from blockchain...\n');
    console.log('Contract:', poolAddress.toString());
    
    try {
        const balance = await client.getBalance(poolAddress);
        console.log('Contract Balance:', Number(balance) / 1e9, 'TON');
    } catch (e: any) {
        console.log('Error getting balance:', e.message);
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    try {
        const poolBalance = await client.runMethod(poolAddress, 'poolBalance');
        console.log('Pool Balance (getter):', Number(poolBalance.stack.readBigNumber()) / 1e9, 'TON');
    } catch (e: any) {
        console.log('Error getting poolBalance:', e.message);
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    try {
        const totalShares = await client.runMethod(poolAddress, 'totalPoolShares');
        console.log('Total Shares:', totalShares.stack.readBigNumber().toString());
    } catch (e: any) {
        console.log('Error getting totalShares:', e.message);
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    try {
        const sharePrice = await client.runMethod(poolAddress, 'sharePrice');
        console.log('Share Price:', Number(sharePrice.stack.readBigNumber()) / 1e9, 'TON per share');
    } catch (e: any) {
        console.log('Error getting sharePrice:', e.message);
    }
}

check().catch(console.error);
