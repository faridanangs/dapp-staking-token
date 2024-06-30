async function commonProviderDetector(_provider) {
    if (_provider == "metamask_wallet") {
        if (window.ethereum && window.ethereum.providers) {
            const metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);
            if (metamaskProvider) {
                window.ethereum.providers = [metamaskProvider];
                return await commonInjectedConnect(metamaskProvider, _provider);
            } else {
                console.log("metamask wallet not found");

                window.open("https://metamask.io/download/", "_blank").focus();

                return false;
            }
        } else if (window.ethereum) {
            return await commonInjectedConnect(window.ethereum, _provider);
        } else {
            console.log("metamask wallet not found");

            try {
                window.open("https://metamask.io/download/", "_blank").focus();
            } catch (error) {
                console.log(error)
            }

            return false;

        }

    }
}

async function commonInjectedConnect(_provider, _providerName) {
    await _provider.enable();

    setWeb3Events(_provider);

    web3 = new Web3(_provider);

    // get connected chain id from ethereum node
    let currentNetworkId = await web3.eth.getChainId();
    currentNetworkId = currentNetworkId.toString();
    console.log("network: ", currentNetworkId);

    const accounts = await web3.eth.getAccounts();
}