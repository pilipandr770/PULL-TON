import "@stdlib/deploy";

// Message for withdrawing shares
message Withdraw {
    shares: Int as uint128;
}

// Custom error codes
const ERR_MIN_DEPOSIT: Int = 1001;
const ERR_ZERO_SHARES: Int = 1002;
const ERR_TOO_MANY_SHARES: Int = 1003;
const ERR_NO_LIQUIDITY: Int = 1004;
const ERR_PAYOUT_ZERO: Int = 1005;

// Main pool contract
contract CommunityTonPool with Deployable {

    // ===============================
    // STATE VARIABLES
    // ===============================

    // Total shares in the pool
    totalShares: Int as uint128;

    // Shares of each participant
    shares: map<Address, Int as uint128>;

    // Minimum deposit (1 TON)
    minDeposit: Int as coins;

    // Minimum TON reserve for storage rent
    minTonsForStorage: Int as coins;

    // ===============================
    // INITIALIZATION
    // ===============================

    // Version counter to create unique contract address
    version: Int as uint8;

    init(version: Int) {
        self.totalShares = 0;
        self.shares = emptyMap();

        // 1 TON minimum deposit
        self.minDeposit = ton("1");      // 1 TON = 1_000_000_000 nanoTON

        // Reserve for storage rent (0.05 TON)
        self.minTonsForStorage = ton("0.05");
        
        // Version 2 - auto-deposit on any transfer
        self.version = version;
    }

    // ===============================
    // INTERNAL HELPER FUNCTIONS
    // ===============================

    // Current pool balance (including msg.value) in nanoTON
    fun poolBalanceNow(): Int {
        return myBalance();
    }

    // Pool balance before the current message
    fun poolBalanceBeforeMsg(): Int {
        // myBalance() includes the incoming message value
        // so we subtract context().value to get the balance "before".
        let ctx: Context = context();
        let msgValue: Int = ctx.value;
        return myBalance() - msgValue;
    }

    // Get user shares
    fun getUserSharesInternal(user: Address): Int {
        let sOpt: Int? = self.shares.get(user);
        if (sOpt == null) {
            return 0;
        } else {
            return sOpt!!;
        }
    }

    // Set user shares
    fun setUserShares(user: Address, newShares: Int) {
        if (newShares <= 0) {
            // remove entry to save storage
            self.shares.set(user, null);
        } else {
            self.shares.set(user, newShares);
        }
    }

    // ===============================
    // GETTERS (off-chain reading)
    // ===============================

    // Total contract balance in nanoTON
    get fun poolBalance(): Int {
        return self.poolBalanceNow();
    }

    // Total shares
    get fun totalPoolShares(): Int {
        return self.totalShares;
    }

    // Shares of a specific user
    get fun userShares(user: Address): Int {
        return self.getUserSharesInternal(user);
    }

    // Approximate "price" of one share in nanoTON
    get fun sharePrice(): Int {
        if (self.totalShares == 0) {
            return 0;
        }
        // using current balance
        return self.poolBalanceNow() / self.totalShares;
    }

    // ===============================
    // DEPOSIT LOGIC
    // ===============================

    // Simplified: any internal message with text comment "deposit"
    receive("deposit") {
        let ctx: Context = context();
        let from: Address = sender();
        let msgValue: Int = ctx.value;

        // Check minimum deposit
        throwUnless(ERR_MIN_DEPOSIT, msgValue >= self.minDeposit);

        // Pool balance before message
        let poolBefore: Int = self.poolBalanceBeforeMsg();

        // Calculate shares to mint
        let mintedShares: Int = 0;

        if (self.totalShares == 0 || poolBefore == 0) {
            // first depositor: 1 share = 1 nanoTON
            mintedShares = msgValue;
        } else {
            // classic pool formula:
            // newShares = amount * totalShares / poolBalanceBefore
            mintedShares = (msgValue * self.totalShares) / poolBefore;
        }

        throwUnless(ERR_ZERO_SHARES, mintedShares > 0);

        // Update total shares
        self.totalShares = self.totalShares + mintedShares;

        // Update user shares
        let userPrev: Int = self.getUserSharesInternal(from);
        self.setUserShares(from, userPrev + mintedShares);

        // NO fees: entire msgValue stays in the pool.
    }

    // ===============================
    // WITHDRAW LOGIC (REDEEM SHARES)
    // ===============================

    receive(msg: Withdraw) {
        let ctx: Context = context();
        let from: Address = sender();

        let requestedShares: Int = msg.shares;

        throwUnless(ERR_ZERO_SHARES, requestedShares > 0);

        let userPrev: Int = self.getUserSharesInternal(from);
        throwUnless(ERR_TOO_MANY_SHARES, requestedShares <= userPrev);

        // Pool balance before message
        let poolBefore: Int = self.poolBalanceBeforeMsg();

        // Leave reserve for storage
        let liquidBalance: Int = poolBefore - self.minTonsForStorage;
        throwUnless(ERR_NO_LIQUIDITY, liquidBalance > 0);

        // Calculate payout
        let payout: Int = (liquidBalance * requestedShares) / self.totalShares;
        throwUnless(ERR_PAYOUT_ZERO, payout > 0);

        // Update total shares
        self.totalShares = self.totalShares - requestedShares;

        // Update user shares
        let remaining: Int = userPrev - requestedShares;
        self.setUserShares(from, remaining);

        // Send TON to user
        send(SendParameters{
            to: from,
            value: payout,
            mode: SendIgnoreErrors,
            bounce: true
        });
    }

    // ===============================
    // RECEIVE OTHER PAYMENTS (REWARDS/DONATIONS)
    // ===============================

    // Handle empty messages (simple transfers) as deposits
    receive() {
        let ctx: Context = context();
        let from: Address = sender();
        let msgValue: Int = ctx.value;

        // If amount >= minDeposit, treat as deposit
        if (msgValue >= self.minDeposit) {
            // Pool balance before message
            let poolBefore: Int = self.poolBalanceBeforeMsg();

            // Calculate shares to mint
            let mintedShares: Int = 0;

            if (self.totalShares == 0 || poolBefore == 0) {
                // first depositor: 1 share = 1 nanoTON
                mintedShares = msgValue;
            } else {
                // classic pool formula
                mintedShares = (msgValue * self.totalShares) / poolBefore;
            }

            if (mintedShares > 0) {
                // Update total shares
                self.totalShares = self.totalShares + mintedShares;

                // Update user shares
                let userPrev: Int = self.getUserSharesInternal(from);
                self.setUserShares(from, userPrev + mintedShares);
            }
        }
        // Otherwise, funds just stay as rewards/donations
    }

    receive(msg: Slice) {
        // Handle any text message - try to parse as deposit
        let ctx: Context = context();
        let from: Address = sender();
        let msgValue: Int = ctx.value;

        // If amount >= minDeposit, treat as deposit
        if (msgValue >= self.minDeposit) {
            // Pool balance before message
            let poolBefore: Int = self.poolBalanceBeforeMsg();

            // Calculate shares to mint
            let mintedShares: Int = 0;

            if (self.totalShares == 0 || poolBefore == 0) {
                mintedShares = msgValue;
            } else {
                mintedShares = (msgValue * self.totalShares) / poolBefore;
            }

            if (mintedShares > 0) {
                self.totalShares = self.totalShares + mintedShares;
                let userPrev: Int = self.getUserSharesInternal(from);
                self.setUserShares(from, userPrev + mintedShares);
            }
        }
        // Otherwise, funds stay as rewards
    }
}
