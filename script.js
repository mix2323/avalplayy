let web3;
let nftContract;
let tokenContract;
const nftAddress = "0xa1d482f27b4c10aab960c2927965e1beceead456";
const tokenAddress = "0x4c71fb79cdc312ffc504960fbb0248d0fb9255fb";

async function connectWallet() {
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = new Web3(window.ethereum);
    const nftABI = await (await fetch('abi/AvalPlayNFT.json')).json();
    const tokenABI = await (await fetch('abi/AVPLAYToken.json')).json();
    nftContract = new web3.eth.Contract(nftABI, nftAddress);
    tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

    const accounts = await web3.eth.getAccounts();
    document.getElementById("walletAddress").innerText = "Carteira: " + accounts[0];

    const balance = await tokenContract.methods.balanceOf(accounts[0]).call();
    document.getElementById("tokenBalance").innerText = "Saldo AVPLAY: " + web3.utils.fromWei(balance, 'ether');

    loadNFTs(accounts[0]);
  } else {
    alert("MetaMask não encontrada.");
  }
}

async function claimTokens() {
  const accounts = await web3.eth.getAccounts();
  await tokenContract.methods.claim().send({ from: accounts[0] });
  document.getElementById("status").innerText = "Tokens AVPLAY recebidos!";
}

async function mintNFT() {
  const uri = document.getElementById("nftURI").value;
  if (!uri) return alert("Insira uma URI para a imagem!");
  const accounts = await web3.eth.getAccounts();
  await nftContract.methods.mintNFT(uri).send({ from: accounts[0] });
  document.getElementById("status").innerText = "NFT mintado com sucesso!";
  loadNFTs(accounts[0]);
}

async function loadNFTs(owner) {
  const total = await nftContract.methods.balanceOf(owner).call();
  const gallery = document.getElementById("nftGallery");
  gallery.innerHTML = "";

  for (let i = 0; i < total; i++) {
    const tokenId = await nftContract.methods.tokenOfOwnerByIndex(owner, i).call();
    const uri = await nftContract.methods.tokenURI(tokenId).call();
    const img = document.createElement("img");
    img.src = uri;
    gallery.appendChild(img);
  }
}
