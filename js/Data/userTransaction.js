// Retrieve and parse local storage data
const userTransaction = JSON.parse(localStorage.getItem("transactions")) || [];
const user = JSON.parse(localStorage.getItem("User")) || {};

console.log(user);
console.log(userTransaction);
// Check if DOM elements exist
const contractTransactionList = document.querySelector(".dataUserTransaction");
const UserProfile = document.querySelector(".contract-user");

if (!contractTransactionList) {
    console.error("Element with class 'dataUserTransaction' not found");
}

if (!UserProfile) {
    console.error("Element with class 'contract-user' not found");
}

// Function to generate countdown
function generateCountDown() {
    let now = new Date().getTime(); // Changed to getTime for accurate milliseconds
    let minutes = Math.floor((now % (1000 * 3600)) / (1000 * 60));
    let seconds = Math.floor((now % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
}

// Generate user transaction history HTML
const userTransactionHistory = userTransaction.map((transaction, i) => `
    <div class="col-12 col-md-6 col-lg-4 item explore-item" data-groups='["ongoing", "ended"]'>
        <div class="card project-card">
            <div class="media">
                <a href="project-detail.html">
                    <img src="assets/img/content/thumb_${i + 1}.png" alt="Thumb one" class="card-img-top avatar-max-lg" />
                </a>
                <div class="media-body ml-4">
                    <a href="project-details.html">
                        <h4 class="m-0">#buchains</h4>
                    </a>
                    <div class="countdown-items">
                        <h6 class="my-2">Transaction No: ${i + 1}</h6>
                        <div class="countdown d-flex" data-date="2024-07-06"></div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="items">
                    <div class="single-item">
                        <span>${transaction.token ? "Amount" : "Claim Token"}</span><span> ${transaction.token ? (transaction.token / 10 ** 18).toFixed(2) : ""}</span>
                    </div>
                    <div class="single-item">
                        <span>Gas</span><span> ${transaction.gasUsed}</span>
                    </div>
                    <div class="single-item">
                        <span>Status</span><span> ${transaction.status}</span>
                    </div>
                </div>
            </div>
            <div class="project-footer d-flex align-items-center mt-4 mt-md-5">
                <a target="_blank" href="https://www.oklink.com/amoy/tx/${transaction.transactionHash}" class="btn btn-bordered-white btn-smaller">Transaction</a>
                <div class="social-share ml-auto">
                    <ul class="d-flex list-unstyled">
                        <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                        <li><a href="#"><i class="fab fa-telegram"></i></a></li>
                        <li><a href="#"><i class="fab fa-globe"></i></a></li>
                        <li><a href="#"><i class="fab fa-github"></i></a></li>
                    </ul>
                </div>
            </div>
            <div class="blockchain-icon">
                <img src="assets/img/content/ethereum.png" alt="Blockchain Icon" />
            </div>
        </div>
    </div>
`).join(''); // Add join here

// Check generated HTML
console.log("Generated Transaction HTML: ", userTransactionHistory);

// Generate user profile HTML
const userProfileHTML = `
    <div class="contract-user-profile">
        <img src="assets/img/content/team_1.png" alt="Team one" />
        <div class="contract-user-profile-info">
            <p><strong>Address:</strong> ${user.address ? user.address.slice(0, 25) + "..." : "N/A"}</p>
            <span class="contract-space"><strong>Stake Amount: </strong> ${user.stakeAmount ? (user.stakeAmount / 10 ** 18).toFixed(2) : "N/A"}</span>
            <span class="contract-space"><strong>Last Reward Calculation Time:</strong> ${user.lastRewardCalculationTime ? generateCountDown(user.lastRewardCalculationTime) : "N/A"}</span>
            <span class="contract-space"><strong>Last Stake Time:</strong> ${user.lastStakeTime ? generateCountDown(user.lastStakeTime) : "N/A"}</span>
            <span class="contract-space"><strong>Reward Token:</strong> ${user.rewardAmount ? (user.rewardAmount / 10 ** 18).toFixed(2) : "N/A"}</span>
            <span class="contract-space"><strong>Rewards Claimed So Far:</strong> ${user.rewardClaimerSofar ? (user.rewardClaimerSofar / 10 ** 18).toFixed(5) : "N/A"}</span>
            <p class="contract-paragraph">Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, nisi corporis debitis ex doloremque beatae voluptatibus error odit provident sequi?</p>
        </div>
    </div>
`;

// Update DOM with generated HTML
if (contractTransactionList) {
    contractTransactionList.innerHTML = userTransactionHistory;
    console.log("User transaction history updated successfully.");
} else {
    console.error("Failed to update user transaction history.");
}

if (UserProfile) {
    UserProfile.innerHTML = userProfileHTML;
    console.log("User profile updated successfully.");
} else {
    console.error("Failed to update user profile.");
}
