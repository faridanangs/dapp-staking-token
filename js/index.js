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
    console.log(sClass)

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

    } catch (error) {
        console.log(error)
    }
}