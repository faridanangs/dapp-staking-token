// Function Call
loadInitialData("sevenDays");
connectMe("metamask_wallet");

function connectWallet() { }

function openTab(event, name) {
    console.log(name);

    contractCall = name;

    getSelectedTab(name);
    loadInitialData(name);
}

async function loadInitialData(sClass) {
    console.log(sClass, "Load initial data");

    try {
        clearInterval(countDownGlobal);

        let cObj = new web3Main.eth.Contract(
            SELECT_CONTRACT[_NETWORK_ID].STACKING.abi,
            SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address
        )

        // ID ELEMENT DATA
        let totalUsers = await cObj.methods.getTotalUsers().call();
        let cApy = await cObj.methods.getApy().call();

        // Get User
        let userDetail = await cObj.methods.getUser(currentAddress).call();

        const user = {
            stakeAmount: userDetail.stakeAmount,
            rewardAmount: userDetail.rewardAmount,
            lastStakeTime: userDetail.lastStakeTime,
            lastRewardCalculationTime: userDetail.lastRewardCalculationTime,
            rewardClaimerSofar: userDetail.rewardClaimerSofar,
            address: currentAddress
        }

        localStorage.setItem("User", JSON.stringify(user));

        let userDetailBal = userDetail.stakeAmount / 10 ** 18;

        // Element -ID
        document.getElementById("total-locked-user-token").innerHTML = `${userDetailBal}`;
        document.getElementById("num-of-stackers-value").innerHTML = `${totalUsers}`
        document.getElementById("apy-value-feature").innerHTML = `${cApy} %`

        // class element data
        let totalLockedTokens = await cObj.methods.getTotalStakedToken().call();
        let earlyUnstakeFee = await cObj.methods.getEarlyUnstkeFeePercentage().call();

        // element class
        document.getElementById("total-locked-tokens-value").innerHTML = `
        ${totalLockedTokens / 10 ** 18} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`

        document.querySelectorAll(".early-unstake-fee-value").forEach((e) => {
            e.innerHTML = `${earlyUnstakeFee / 100}%`;
        })

        let minStakeAmount = await cObj.methods.getMinimumStakingAmount().call();
        minStakeAmount = Number(minStakeAmount);
        let minA;

        if (minStakeAmount) {
            minA = `${(minStakeAmount / 10 ** 18).toLocaleString()} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;
        } else {
            minA = "N/A"
        }

        document.querySelectorAll(".Minimum-Staking-Amount").forEach((e) => {
            e.innerHTML = `${minA}`;
        })
        document.querySelectorAll(".Maximum-Staking-Amount").forEach((e) => {
            e.innerHTML = `${(10000000).toLocaleString()} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`
        })

        let isStakingPaused = await cObj.methods.getStakingStatus().call();
        let isStakingPausedText;

        let startDate = await cObj.methods.getStakeStartDate().call();

        let endDate = await cObj.methods.getStakeEndDate().call();

        let stakeDays = await cObj.methods.getStakeDays().call();

        let days = Math.floor(Number(stakeDays) / (3600 * 24));

        let dayDisplay = days > 0 ? days + (days == 1 ? "day," : "days,") : "";

        document.querySelectorAll(".Lock-period-value").forEach((e) => e.innerHTML = `${dayDisplay}`)

        let rewardBal = await cObj.methods.getUserEstimatedRewards().call({ from: currentAddress });

        document.getElementById("user-reward-balance-value").value = `Reward: ${rewardBal / 10 ** 18} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`

        // User Token Balance
        let balMainUser = currentAddress ? await cObj.methods.balanceOf(currentAddress).call() : ""

        balMainUser = Number(balMainUser) / 10 ** 18;

        document.getElementById("user-token-balance").innerHTML = `Balance: ${balMainUser}`

        let currentDate = new Date().getTime();

        if (isStakingPaused) {
            isStakingPausedText = "Paused";
        } else if (currentDate < startDate) {
            isStakingPausedText = "Locked";
        } else if (currentDate > endDate) {
            isStakingPausedText = "Ended";
        } else {
            isStakingPausedText = "Active"
        }

        document.querySelectorAll(".active-status-stacking").forEach((e) => {
            e.innerHTML = `${isStakingPausedText}`;
        });

        if (currentDate > startDate && currentDate < endDate) {
            const ele = document.getElementById("countdown-time-value");
            generateCountDown(ele, endDate);

            document.getElementById("countdown-title-value").innerHTML = "Staking Ends In";
        }

        if (currentDate < startDate) {
            const ele = document.getElementById("countdown-time-value");
            generateCountDown(ele, startDate);

            document.getElementById("countdown-title-value").innerHTML = "Staking Starts In";
        }

        document.querySelectorAll(".apy-value").forEach((e) => {
            e.innerHTML = `${cApy} %`
        })

    } catch (error) {
        console.log(error)
        notyf.error(
            `Unable to fetch data from ${SELECT_CONTRACT[_NETWORK_ID].network_name}!\n
            Please refresh this page`
        )
    }
}

function generateCountDown(ele, clainDate) {
    clearInterval(countDownGlobal);

    // set the date we're counting down to
    var countDownDate = new Date(clainDate).getTime();

    // update the count down every 1 second
    countDownGlobal = setInterval(() => {
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // display the count down is finished, write some text
        ele.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s";

        if (distance < 0) {
            clearInterval(countDownGlobal);
            ele.html("Refresh Page");
        }
    }, 1000)
}

async function connectMe(_provider) {
    try {
        let _comon_res = await commonProviderDetector(_provider);
        console.log(_comon_res, "connectMe :Common rest");
        if (!_comon_res) {
            console.log("index connectMe: Please install metamask")
        } else {
            let sClass = getSelectedTab();
            console.log(sClass, "Stake Class")
        }
    } catch (error) {
        notyf.error(error.message)
    }
}

async function stackTokens() {
    try {
        let nToken = document.getElementById("amount-to-stack-value-new").value;

        if (!nToken) {
            return;
        }

        if (isNaN(nToken) || nToken === 0 || Number(nToken) < 0) {
            console.log("Invalid Token Amount");
            return;
        }

        nToken = Number(nToken);

        let tokenToTransfer = addDecimal(nToken, 18);
        console.log("TokenToTransfer: " + tokenToTransfer);

        let balMainUser = await oContractToken.methods.balanceOf(currentAddress).call();
        balMainUser = Number(balMainUser) / 10 ** 18;

        console.log("balMainUser: " + balMainUser);

        if (balMainUser < nToken) {
            notyf.error(`Insufficient Token Amount on ${SELECT_CONTRACT[_NETWORK_ID].network_name}.\nPlease buy some tokens first`)
            return;
        }

        let sClass = getSelectedTab(contractCall);
        console.log(sClass, "Sclass");

        let balMainAllowance = await oContractToken.methods.allowance(
            currentAddress,
            SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address
        )

        if (Number(balMainAllowance) < Number(tokenToTransfer)) {
            approveTokenSpend(tokenToTransfer, sClass);
        } else {
            stackTokenMain(tokenToTransfer, sClass);
        }


    } catch (error) {
        console.log(error);
        notyf.dismiss(notification);
        notyf.error(formatEthErrorMsg(error));
    }
}

async function approveTokenSpend(_mint_fee_wei, sClass) {
    let gasEstimation;

    try {
        gasEstimation = await oContractToken.methods.approve(
            SELECT_CONTRACT[_NETWORK_ID].STAKING[sClass].address,
            _mint_fee_wei
        ).estimateGas({ from: currentAddress });
    } catch (error) {
        console.log(error)
        notyf.error(formatEthErrorMsg(error));
        return;
    }

    await oContractToken.methods.approve(
        SELECT_CONTRACT[_NETWORK_ID].STAKING[sClass].address,
        _mint_fee_wei
    ).send({
        from: currentAddress,
        gas: gasEstimation
    }).on("transactionHash", (hash) => {
        console.log(hash)
    }).on("receipt", (receipt) => {
        console.log(receipt, "receipt")
        stackTokenMain(_mint_fee_wei, sClass);
    }).catch(e => {
        console.log(e)
        notyf.error(formatEthErrorMsg(e));
        return;
    })
}

async function stackTokenMain(_amount_wei, sClass) {
    let gasEstimation;

    let oContractStaking = getContractObj(sClass);

    try {
        gasEstimation = await oContractStaking.methods.stake(
            _amount_wei
        ).estimateGas({
            from: currentAddress
        });
    } catch (error) {
        console.log(error)
        notyf.error(formatEthErrorMsg(error));
        return;
    }

    await oContractStaking.methods.stake(
        _amount_wei
    ).send({
        from: currentAddress,
        gas: gasEstimation
    }).on("Receipt", (receipt) => {
        console.log("Receipt: ", receipt);

        const receiptObj = {
            token: _amount_wei,
            from: receipt.from,
            to: receipt.to,
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            cumulativeGasUsed: receipt.cumulativeGasUsed,
            effectiveGasPrice: receipt.effectiveGasPrice,
            gasUsed: receipt.gasUsed,
            status: receipt.status,
            transactionHash: receipt.transactionHash,
            type: receipt.type
        }

        let transactionHistory = [];
        let allUserTransaction = localStorage.getItem("transactions");

        if (allUserTransaction) {
            transactionHistory = JSON.parse(localStorage.getItem("transactions"));
            transactionHistory.push(receiptObj);
            localStorage.setItem("transactions", JSON.stringify(transactionHistory));

        } else {
            transactionHistory.push(receiptObj);
            localStorage.setItem("transactions", JSON.stringify(transactionHistory));
        }

        console.log("Transaction History", transactionHistory);
        window.location.href = "http://localhost:5500/analytic.html";
    }).on("transactionHash", (hash) => {
        console.log("transactionHash", hash);
    }).catch(error => {
        console.log(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    })
}

async function unstakeTokens() {
    try {
        let nTokens = document.getElementById("amount-to-unstake-token").value;

        if (!nTokens) {
            return;
        }

        if (isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
            notyf.error("Invalid Token Amount");
            return;
        }

        nTokens = Number(nTokens);

        let tokenToTransfer = addDecimal(nTokens, 18);

        let sClass = getSelectedTab(contractCall);

        let oContractStaking = getContractObj(sClass);

        let balMainUser = await oContractStaking.methods.getUser(currentAddress).call();

        balMainUser = Number(balMainUser.stakeAmount) / 10 ** 18;

        if (balMainUser < tokenToTransfer) {
            notyf.error(`Insufficient Token Amount on ${SELECT_CONTRACT[_NETWORK_ID].network_name}.\nPlease stake some tokens first`)
            return;
        }

        unstakeTokenMain(tokenToTransfer, oContractStaking, sClass);
    } catch (error) {
        console.log(error);
        notyf.dismiss(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    }
}
async function unstakeTokenMain(_amount_wei, oContractStaking, sClass) {
    let gasEstimation;

    try {
        gasEstimation = await oContractStaking.methods.unstake(
            _amount_wei
        ).estimateGas({
            from: currentAddress,
        })
    } catch (error) {
        console.log(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    }

    await oContractStaking.methods.unstake(
        _amount_wei
    ).send({
        from: currentAddress,
        gas: gasEstimation
    }).on("receipt", (r) => {
        console.log(r);

        const receiptObj = {
            token: _amount_wei,
            from: r.from,
            to: r.to,
            blockHash: r.blockHash,
            blockNumber: r.blockNumber,
            cumulativeGasUsed: r.cumulativeGasUsed,
            effectiveGasPrice: r.effectiveGasPrice,
            gasUsed: r.gasUsed,
            status: r.status,
            transactionHash: r.transactionHash,
            type: r.type
        }

        let transactionsHistory = [];
        let allUserTransactions = localStorage.getItem("transactions");

        if (allUserTransactions) {
            transactionsHistory = JSON.parse(localStorage.getItem("transactions"));
            transactionsHistory.push(receiptObj);
            localStorage.setItem('transactions', JSON.stringify(transactionsHistory));
        } else {
            transactionsHistory.push(receiptObj);
            localStorage.setItem("transactions", JSON.stringify(transactionsHistory));
        }

        window.location.href = "http://localhost:5500/analytic.html";
    }).catch((e) => {
        console.log(e);
        notyf.error(formatEthErrorMsg(e));
        return;
    })
}

async function claimTokens() {
    try {
        let sClass = getSelectedTab(contractCall);
        let oContractStaking = getContractObj(sClass);

        let rewardMainUser = await oContractStaking.methods.getUserEstimatedRewards().call({ from: currentAddress })
        rewardMainUser = Number(rewardMainUser);

        if (!rewardMainUser) {
            notyf.dismiss(notification);
            notyf.error("No rewards available to claim.");
            return;
        }

        claimTokenMain(oContractStaking, sClass)

    } catch (error) {
        console.log(error);
        notyf.dismiss(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    }
}

async function claimTokenMain(oContractStaking, sClass) {
    let gasEstimation;

    try {
        gasEstimation = await oContractStaking.methods.claimReward().estimateGas({ from: currentAddress });
    } catch (error) {
        console.log(error);
        notyf.dismiss(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    }

    await oContractStaking.methods.claimReward().send({
        from: currentAddress,
        gas: gasEstimation
    }).on("receipt", (r) => {
        console.log(r);

        let receptObj = {
            from: r.from,
            to: r.to,
            blockHash: r.blockHash,
            blockNumber: r.blockNumber,
            cumulativeGasUsed: r.cumulativeGasUsed,
            effectiveGasPrice: r.effectiveGasPrice,
            gasUsed: r.gasUsed,
            status: r.status,
            transactionHash: r.transactionHash,
            type: r.type
        }

        let transactionHistory = [];
        let allUserTransactions = localStorage.getItem("transactions");
        if (allUserTransactions) {
            transactionHistory = JSON.parse(localStorage.getItem("transactions"))
            transactionHistory.push(receptObj);
            localStorage.setItem("transactions", JSON.stringify(transactionHistory));
        } else {
            transactionHistory.push(receptObj);
            localStorage.setItem("transactions", JSON.stringify(transactionHistory));
        }

        window.location.href = "http://localhost:5500/analytic.html";
    }).on("transactionHash", (hash) => {
        console.log("transaction Hash", hash);
    }).catch(error => {
        console.log(error);
        notyf.dismiss(error);
        notyf.error(formatEthErrorMsg(error));
        return;
    })
}
