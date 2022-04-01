window.addEventListener('DOMContentLoaded', async () => {
  let accounts;
  const onboarding = new MetaMaskOnboarding();
  const checkTokensButton = document.getElementById('checkTokens');

  // Offer to install MetaMask if it's not installed nor do we
  // detect a replacement such as Coinbase wallet
  if (!MetaMaskOnboarding.isMetaMaskInstalled() && !window.ethereum) {
    alert('This site requires a browser wallet addon, such as Coinbase wallet or MetaMask. Redirecting you to a page to download MetaMask.');
    onboarding.startOnboarding();
  } else if (accounts && accounts.length > 0) {
    onboarding.stopOnboarding();
  }

  checkTokensButton.onclick = async () => {
    checkTokensButton.innerHTML = 'Checking...this may take a while'
    await _checkTokensClaimed();
  };

  ethereum.on('accountsChanged', function (accounts) {
    window.location.href = '';
  })
});

async function _checkTokensClaimed() {
  try {
    let amt = 0;
    let unclaimedAmount = document.getElementById('unclaimedAmount');
    let tokenList = document.getElementById('tokenList');
    await switchNetwork();

    for(i=251; i<=1106; i++) {
      let _n = await checkTokenClaimed(i);
      if (_n) {
        tokenList.appendChild(_n);
        amt++
        unclaimedAmount.innerHTML = amt;
      }
    }
  } catch(e) {
    console.log(e)
    return false;
  }
}

async function getMMAccount() {
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    const account = accounts[0];
    return account;
  } catch(e) {
    updateMintMessage(`Something went wrong. Refresh and try again.`);
  }
}

async function switchNetwork(){
  await ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x1' }],
  });
}

async function checkTokenClaimed(tokenId) {
  let msg;
  let color;
  const w3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
  if (tokenId > 1106) {
    msg = `Token ${tokenId} not elligible for claiming free Nekos!`;
    color = 'fail';
  } else if (tokenId <= 250) {
    msg = `Token ${tokenId} not elligible for claiming free Nekos!`;
    color = 'warn';
  } else {
    contract = new w3.eth.Contract(abi, address);
    claimed = await contract.methods.TIMES_CLAIMED(tokenId).call();
    if (claimed == 0) {
      msg = `Token ${tokenId} not yet claimed! <a href="https://opensea.io/assets/0xc1328cf1cf8db8a5fc407cd56759007c7d20e398/${tokenId}" target=_blank>OpenSea</a>`;
      color = 'success';
    } else {
      return;
    }
  }
  let _n = document.createElement('li');
  _n.classList.add(color);
  _n.innerHTML = msg;
  return _n
}
