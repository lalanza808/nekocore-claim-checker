window.addEventListener('DOMContentLoaded', async () => {
  let accounts;
  const onboarding = new MetaMaskOnboarding();
  const checkTokenClaimedButton = document.getElementById('checkTokenClaimed');
  const tokenIdInput = document.getElementById('tokenId');

  // Offer to install MetaMask if it's not installed nor do we
  // detect a replacement such as Coinbase wallet
  if (!MetaMaskOnboarding.isMetaMaskInstalled() && !window.ethereum) {
    alert('This site requires a browser wallet addon, such as Coinbase wallet or MetaMask. Redirecting you to a page to download MetaMask.');
    onboarding.startOnboarding();
  } else if (accounts && accounts.length > 0) {
    onboarding.stopOnboarding();
  }

  checkTokenClaimedButton.onclick = async () => {
    await _checkTokenClaimed();
  };

  tokenIdInput.onkeyup = async (e) => {
    if (e.key == 'Enter') {
      await _checkTokenClaimed();
    }
  }

  ethereum.on('accountsChanged', function (accounts) {
    window.location.href = '';
  })
});

async function _checkTokenClaimed() {
  try {
    await switchNetwork();
    await checkTokenClaimed();
  } catch(e) {
    console.log(e)
    if (e.message = 'Invalid JSON RPC response: ""') {
      let res = document.getElementById('claimedResult');
      res.innerHTML = `You do not need to connect it, but you at least need Metamask or Coinbase wallet browser extension installed to use this.`;
      res.classList.add('fail');
      res.classList.remove('success');
      return;
    }
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
  // don't do this if no metamask (errors on coinbase wallet)
  if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
    return false;
  }
  await ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x1' }],
  });
}

async function checkTokenClaimed() {
  const w3 = new Web3(Web3.givenProvider || "http://127.0.0.1:7545");
  let res = document.getElementById('claimedResult');
  let tokenId = document.getElementById('tokenId').value;
  if (tokenId <= 0 || tokenId > 9999 || isNaN(tokenId)) {
    alert('Invalid token ID supplied. Try again (1-9999)');
  }

  if (tokenId > 1106) {
    res.innerHTML = `Token ${tokenId} not elligible for claiming free Nekos!`;
    res.classList.add('fail');
    res.classList.remove('success');
    return;
  }

  const contract = new w3.eth.Contract(abi, address);
  const claimed = await contract.methods.TIMES_CLAIMED(tokenId).call();

  if (claimed == 0) {
    res.innerHTML = `Token ${tokenId} not yet claimed!`;
    res.classList.add('fail');
    res.classList.remove('success');
  } else {
    res.innerHTML = `Token ${tokenId} already claimed!`;
    res.classList.add('success');
    res.classList.remove('fail');
  }
}
