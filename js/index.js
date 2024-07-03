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

}