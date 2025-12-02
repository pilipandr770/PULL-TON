import "@stdlib/deploy";
import "@stdlib/ownable";

// ============================================================================
// COMMUNITY TON POOL - MAINNET VERSION
// Интеграция с официальным Nominator Pool для реального стейкинга
// ============================================================================

// Сообщения для взаимодействия с контрактом
message Withdraw {
    amount: Int as coins;
}

message WithdrawAll {}

message ClaimRewards {}

message StakeToNominator {}

message WithdrawFromNominator {}

message UpdateNominatorPool {
    newPool: Address;
}

message SetMinStake {
    amount: Int as coins;
}

message EmergencyWithdraw {
    to: Address;
}

// ============================================================================
// ОСНОВНОЙ КОНТРАКТ
// ============================================================================

contract CommunityTonPoolMainnet with Deployable, Ownable {
    // Владелец контракта (для административных функций)
    owner: Address;
    
    // Версия контракта
    version: Int as uint32;
    
    // Адрес Nominator Pool для стейкинга
    nominatorPool: Address;
    
    // Общий баланс пула (депозиты пользователей)
    totalDeposits: Int as coins;
    
    // Общее количество shares
    totalShares: Int as coins;
    
    // Минимальный депозит (1 TON)
    minDeposit: Int as coins;
    
    // Сколько TON отправлено в Nominator Pool
    stakedToNominator: Int as coins;
    
    // Накопленные награды (для распределения)
    pendingRewards: Int as coins;
    
    // Минимум для отправки в Nominator (10,001 TON - с учётом комиссии)
    minNominatorStake: Int as coins;
    
    // Флаг: ожидаем возврат из Nominator Pool
    withdrawPending: Bool;
    
    // Shares каждого пользователя
    shares: map<Address, Int>;
    
    // Депозиты пользователей (для расчёта прибыли)
    deposits: map<Address, Int>;
    
    // Очередь на вывод (адрес -> сумма)
    withdrawQueue: map<Address, Int>;
    
    // Общая сумма в очереди на вывод
    totalWithdrawQueue: Int as coins;

    // ========================================================================
    // ИНИЦИАЛИЗАЦИЯ
    // ========================================================================
    
    init(owner: Address, nominatorPool: Address, version: Int) {
        self.owner = owner;
        self.nominatorPool = nominatorPool;
        self.version = version;
        self.totalDeposits = 0;
        self.totalShares = 0;
        self.minDeposit = ton("1");
        self.stakedToNominator = 0;
        self.pendingRewards = 0;
        self.minNominatorStake = ton("10001"); // 10,000 + 1 TON комиссия
        self.withdrawPending = false;
        self.totalWithdrawQueue = 0;
    }

    // ========================================================================
    // ДЕПОЗИТ - принимаем любые переводы >= 1 TON
    // ========================================================================
    
    receive() {
        self.processDeposit();
    }
    
    receive(msg: Slice) {
        self.processDeposit();
    }
    
    // Обработка депозита с комментарием "deposit"
    receive("deposit") {
        self.processDeposit();
    }
    
    fun processDeposit() {
        let ctx: Context = context();
        let amount: Int = ctx.value;
        let sender: Address = ctx.sender;
        
        // Проверяем минимальный депозит
        require(amount >= self.minDeposit, "Minimum deposit is 1 TON");
        
        // Вычитаем комиссию за газ (0.05 TON)
        let depositAmount: Int = amount - ton("0.05");
        
        // Рассчитываем shares
        let newShares: Int = 0;
        if (self.totalShares == 0) {
            newShares = depositAmount;
        } else {
            // shares = (depositAmount * totalShares) / totalDeposits
            newShares = (depositAmount * self.totalShares) / self.totalDeposits;
        }
        
        // Обновляем баланс пользователя
        let currentShares: Int = self.shares.get(sender) != null ? self.shares.get(sender)!! : 0;
        let currentDeposit: Int = self.deposits.get(sender) != null ? self.deposits.get(sender)!! : 0;
        
        self.shares.set(sender, currentShares + newShares);
        self.deposits.set(sender, currentDeposit + depositAmount);
        
        // Обновляем общие показатели
        self.totalShares = self.totalShares + newShares;
        self.totalDeposits = self.totalDeposits + depositAmount;
    }

    // ========================================================================
    // СТЕЙКИНГ В NOMINATOR POOL
    // ========================================================================
    
    // Отправить накопленные средства в Nominator Pool
    // Может вызвать только owner или когда накопилось достаточно средств
    receive(msg: StakeToNominator) {
        let ctx: Context = context();
        
        // Только owner может инициировать стейкинг
        require(ctx.sender == self.owner, "Only owner can stake");
        
        // Проверяем, что есть достаточно средств
        let availableBalance: Int = self.totalDeposits - self.stakedToNominator - self.totalWithdrawQueue;
        require(availableBalance >= self.minNominatorStake, "Not enough balance for nominator stake");
        require(!self.withdrawPending, "Withdraw from nominator is pending");
        
        // Отправляем в Nominator Pool с комментарием "d" (deposit)
        send(SendParameters{
            to: self.nominatorPool,
            value: availableBalance,
            mode: SendPayGasSeparately,
            bounce: true,
            body: "d".asComment() // Команда депозита для Nominator Pool
        });
        
        self.stakedToNominator = self.stakedToNominator + availableBalance;
    }
    
    // Запросить вывод из Nominator Pool
    receive(msg: WithdrawFromNominator) {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Only owner can withdraw from nominator");
        require(self.stakedToNominator > 0, "Nothing staked to nominator");
        require(!self.withdrawPending, "Withdraw already pending");
        
        // Отправляем запрос на вывод с комментарием "w" (withdraw)
        send(SendParameters{
            to: self.nominatorPool,
            value: ton("1"), // Комиссия за операцию
            mode: SendPayGasSeparately,
            bounce: true,
            body: "w".asComment() // Команда вывода для Nominator Pool
        });
        
        self.withdrawPending = true;
    }
    
    // Получение средств обратно из Nominator Pool (с наградами!)
    receive("nominator_return") {
        let ctx: Context = context();
        
        // Проверяем, что отправитель - это Nominator Pool
        require(ctx.sender == self.nominatorPool, "Only nominator pool can return funds");
        
        let returnedAmount: Int = ctx.value;
        
        // Рассчитываем награды
        if (returnedAmount > self.stakedToNominator) {
            self.pendingRewards = self.pendingRewards + (returnedAmount - self.stakedToNominator);
        }
        
        // Добавляем награды к общим депозитам (автоматический compound)
        self.totalDeposits = self.totalDeposits + self.pendingRewards;
        self.pendingRewards = 0;
        
        // Сбрасываем счётчик застейканных средств
        self.stakedToNominator = 0;
        self.withdrawPending = false;
    }
    
    // Альтернативный способ получения средств (bounced или прямой перевод)
    receive(msg: Slice) {
        let ctx: Context = context();
        
        // Если пришло от Nominator Pool - это возврат средств
        if (ctx.sender == self.nominatorPool) {
            let returnedAmount: Int = ctx.value;
            
            if (returnedAmount > self.stakedToNominator && self.stakedToNominator > 0) {
                self.pendingRewards = self.pendingRewards + (returnedAmount - self.stakedToNominator);
            }
            
            self.totalDeposits = self.totalDeposits + self.pendingRewards;
            self.pendingRewards = 0;
            self.stakedToNominator = 0;
            self.withdrawPending = false;
        } else {
            // Иначе - это депозит от пользователя
            self.processDeposit();
        }
    }

    // ========================================================================
    // ВЫВОД СРЕДСТВ ПОЛЬЗОВАТЕЛЯМИ
    // ========================================================================
    
    // Запрос на вывод всех средств
    receive(msg: WithdrawAll) {
        let ctx: Context = context();
        let sender: Address = ctx.sender;
        
        let userShares: Int = self.shares.get(sender) != null ? self.shares.get(sender)!! : 0;
        require(userShares > 0, "No shares to withdraw");
        
        // Рассчитываем сумму к выводу
        let withdrawAmount: Int = (userShares * self.totalDeposits) / self.totalShares;
        
        // Проверяем доступный баланс (не застейканный)
        let availableBalance: Int = myBalance() - ton("1"); // Оставляем 1 TON на газ
        
        if (availableBalance >= withdrawAmount) {
            // Мгновенный вывод
            self.totalShares = self.totalShares - userShares;
            self.totalDeposits = self.totalDeposits - withdrawAmount;
            self.shares.set(sender, 0);
            self.deposits.set(sender, 0);
            
            send(SendParameters{
                to: sender,
                value: withdrawAmount,
                mode: SendPayGasSeparately,
                bounce: false,
                body: "Withdrawal from TON Pool".asComment()
            });
        } else {
            // Добавляем в очередь на вывод
            let currentQueue: Int = self.withdrawQueue.get(sender) != null ? self.withdrawQueue.get(sender)!! : 0;
            self.withdrawQueue.set(sender, currentQueue + withdrawAmount);
            self.totalWithdrawQueue = self.totalWithdrawQueue + withdrawAmount;
            
            // Уменьшаем shares и deposits
            self.totalShares = self.totalShares - userShares;
            self.totalDeposits = self.totalDeposits - withdrawAmount;
            self.shares.set(sender, 0);
            self.deposits.set(sender, 0);
        }
    }
    
    // Частичный вывод
    receive(msg: Withdraw) {
        let ctx: Context = context();
        let sender: Address = ctx.sender;
        
        let userShares: Int = self.shares.get(sender) != null ? self.shares.get(sender)!! : 0;
        require(userShares > 0, "No shares to withdraw");
        
        // Рассчитываем текущую стоимость shares пользователя
        let userValue: Int = (userShares * self.totalDeposits) / self.totalShares;
        require(msg.amount <= userValue, "Insufficient balance");
        require(msg.amount >= ton("1"), "Minimum withdrawal is 1 TON");
        
        // Рассчитываем сколько shares нужно списать
        let sharesToBurn: Int = (msg.amount * self.totalShares) / self.totalDeposits;
        
        let availableBalance: Int = myBalance() - ton("1");
        
        if (availableBalance >= msg.amount) {
            // Мгновенный вывод
            self.totalShares = self.totalShares - sharesToBurn;
            self.totalDeposits = self.totalDeposits - msg.amount;
            self.shares.set(sender, userShares - sharesToBurn);
            
            let userDeposit: Int = self.deposits.get(sender) != null ? self.deposits.get(sender)!! : 0;
            let depositToRemove: Int = (msg.amount * userDeposit) / userValue;
            self.deposits.set(sender, userDeposit - depositToRemove);
            
            send(SendParameters{
                to: sender,
                value: msg.amount,
                mode: SendPayGasSeparately,
                bounce: false,
                body: "Partial withdrawal from TON Pool".asComment()
            });
        } else {
            // Добавляем в очередь
            let currentQueue: Int = self.withdrawQueue.get(sender) != null ? self.withdrawQueue.get(sender)!! : 0;
            self.withdrawQueue.set(sender, currentQueue + msg.amount);
            self.totalWithdrawQueue = self.totalWithdrawQueue + msg.amount;
            
            self.totalShares = self.totalShares - sharesToBurn;
            self.totalDeposits = self.totalDeposits - msg.amount;
            self.shares.set(sender, userShares - sharesToBurn);
        }
    }
    
    // Обработка очереди выводов (вызывается после возврата из Nominator)
    receive("process_withdrawals") {
        let ctx: Context = context();
        require(ctx.sender == self.owner, "Only owner can process withdrawals");
        
        // Здесь нужна итерация по очереди - в Tact это сложнее
        // Для MVP можно обрабатывать выводы индивидуально
    }

    // ========================================================================
    // АДМИНИСТРАТИВНЫЕ ФУНКЦИИ
    // ========================================================================
    
    // Обновить адрес Nominator Pool
    receive(msg: UpdateNominatorPool) {
        self.requireOwner();
        require(self.stakedToNominator == 0, "Cannot change pool while staking");
        self.nominatorPool = msg.newPool;
    }
    
    // Установить минимальный депозит
    receive(msg: SetMinStake) {
        self.requireOwner();
        require(msg.amount >= ton("1"), "Minimum stake cannot be less than 1 TON");
        self.minDeposit = msg.amount;
    }
    
    // Экстренный вывод всех средств (только owner)
    receive(msg: EmergencyWithdraw) {
        self.requireOwner();
        require(self.stakedToNominator == 0, "Cannot emergency withdraw while staking");
        
        let balance: Int = myBalance() - ton("0.1");
        
        send(SendParameters{
            to: msg.to,
            value: balance,
            mode: SendRemainingBalance,
            bounce: false,
            body: "Emergency withdrawal".asComment()
        });
    }

    // ========================================================================
    // GETTER ФУНКЦИИ
    // ========================================================================
    
    get fun poolState(): map<Int, Int> {
        let state: map<Int, Int> = emptyMap();
        state.set(0, self.totalDeposits);
        state.set(1, self.totalShares);
        state.set(2, self.stakedToNominator);
        state.set(3, self.pendingRewards);
        state.set(4, self.totalWithdrawQueue);
        state.set(5, self.withdrawPending ? 1 : 0);
        state.set(6, self.minDeposit);
        state.set(7, self.version);
        return state;
    }
    
    get fun userShares(user: Address): Int {
        let shares: Int = self.shares.get(user) != null ? self.shares.get(user)!! : 0;
        return shares;
    }
    
    get fun userDeposit(user: Address): Int {
        let deposit: Int = self.deposits.get(user) != null ? self.deposits.get(user)!! : 0;
        return deposit;
    }
    
    get fun userValue(user: Address): Int {
        let userShares: Int = self.shares.get(user) != null ? self.shares.get(user)!! : 0;
        if (userShares == 0 || self.totalShares == 0) {
            return 0;
        }
        return (userShares * self.totalDeposits) / self.totalShares;
    }
    
    get fun userProfit(user: Address): Int {
        let userVal: Int = self.userValue(user);
        let userDep: Int = self.userDeposit(user);
        if (userVal > userDep) {
            return userVal - userDep;
        }
        return 0;
    }
    
    get fun userWithdrawQueue(user: Address): Int {
        let queue: Int = self.withdrawQueue.get(user) != null ? self.withdrawQueue.get(user)!! : 0;
        return queue;
    }
    
    get fun nominatorPoolAddress(): Address {
        return self.nominatorPool;
    }
    
    get fun availableForStaking(): Int {
        return self.totalDeposits - self.stakedToNominator - self.totalWithdrawQueue;
    }
    
    get fun isReadyForNominatorStake(): Bool {
        let available: Int = self.availableForStaking();
        return available >= self.minNominatorStake && !self.withdrawPending;
    }
    
    get fun estimatedAPY(): Int {
        // Возвращаем примерный APY в базисных пунктах (350 = 3.5%)
        // Реальный APY зависит от сети
        return 350;
    }
    
    get fun contractVersion(): Int {
        return self.version;
    }
}
