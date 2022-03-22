import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import Notification from './components/Notification';
import MyEpicNFT from './assets/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'mjtbkh';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const GITHUB_HANDLE = 'mjtbkh';
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-j2qm73ohhe';
const TOTAL_MINT_COUNT = 50;

const App = () => {
	const [isConnected, setIsConnected] = useState(false);
	const [isNewMint, setIsNewMint] = useState(false);
	const [newMintId, setNewMintId] = useState(0);
	const [currentAccount, setCurrentAccount] = useState('');
	const [notification, setNotification] = useState('');
	const [totalMints, setTotalMints] = useState(0);
	const CONTRACT_ADDRESS = "0xd8A07E7608E805f7A395B8bb9f4c6E2D5AA53c9D";

	const checkIfWalletIsConnected = async () => {

		const { ethereum } = window;

		if(!ethereum) {
			console.log('Make sure metamsk is available');
			return;
		} else {
			console.log('ethereum object available', ethereum);
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });
		if(accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setIsConnected(true);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found!");
		}
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if(!ethereum) {
				alert('Get metamask first!');
				return;
			}
	
			const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
			const chainId= await ethereum.request({ method: 'eth_chainId'});
			console.log('Connected', accounts[0]);
			console.log('Connected to chain' + chainId);
			if(chainId !== '0x4') alert('You are on the wrong network! Switch to Renkeby testnet');
			setNotification('Wallet connected!');
			setIsConnected(true);
			setCurrentAccount(accounts[0]);
			setTimeout(() => setNotification(''), 4500);
		} catch(e) {
			console.log('Could not connect to metamask', e)
		}
	}

	const handleCopyAccount = () => {
		setNotification('Address copied to clipboard!');
		navigator.clipboard.writeText(currentAccount);

		setTimeout(() => setNotification(''), 4500);
	}

	const getTotalMintedNTFs = async () => {
		try {
			const { ethereum } = window;

			if(!ethereum) {
				console.log('Metamask not detected');
				return;
			} else {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT, signer);

				console.log('Fetching total minted NFTs count...');
				await contractInstance.getTotalMints()
				.then(totalNFTMints => setTotalMints(totalNFTMints));
			}
		} catch(e) {
			console.log('Could not read total mints number from contract!', e);
		}
	}

	const askContractToMintNFT = async () => {
		try {
			const { ethereum } = window;

			if(!ethereum) {
				console.log('Metamask not detected')
				return;
			} else {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNFT, signer);
				contractInstance.on("NewEpicNFTMinted", (sender, tokenId) => {
					console.log({'from': sender, 'tokenId': tokenId});
					setNewMintId(tokenId);
					setIsNewMint(true);
				})

				console.log("Going to pop wallet now to pay gas...")

				let mintTxn = await contractInstance.makeAnEpicNFT();
				console.log('Minting an NFT...');
				await mintTxn.wait();
				
				console.log(`Minted successfuly, see transaction: https://rinkeby.etherscan.io/tx/${mintTxn.hash}`);
				getTotalMintedNTFs();
			}
		} catch(e) {
			console.log(e);
		}
	}
	
  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
		className="cta-button connect-wallet-button"
		onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

	const MintedMessage = ({ tokenId }) => (
		<div
			style={{display: 'block', maxWidth: '500px', background: '#0d1116', lineHeight: '28px', border: '1px solid #333', boxShadow: '7px 7px 1px #171b20', borderRadius: '8px', padding: '20px'}}>
			<p className="gradient-text">
				Hey there! We've minted your NFT. It may be blank right now. It can take a max of 10 min to show up on OpenSea.<br />
			</p>
			<a
				href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`}
				target="_blank"
				rel="nofollow noopener">
				<b className="cta-button opensea-button">🌊 Here's the link</b>
			</a>
		</div>
	)


	useEffect(() => {
		checkIfWalletIsConnected();
		getTotalMintedNTFs();
	}, [])

  return (
    <div className="App">
		{notification && <Notification _message={notification} />}
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">MyEpicNFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
			<p></p>
			{!isConnected && renderNotConnectedContainer()}
			{isConnected && <div className="minter-info">
				<p
					className="gradient-bg-text text-copiable"
					onClick={handleCopyAccount}>
					Connected wallet:{' '}
					<b>
						{currentAccount.slice(0, 4)}...{currentAccount.slice(39, 43)}
					</b>
				</p>
				<button
					onClick={askContractToMintNFT}
					className="cta-button mint-button">
              		Mint NFT
            	</button>
				<span className="gradient-text">
					Total minted EpicNFTs: {totalMints}/{TOTAL_MINT_COUNT}
				</span>
				{isNewMint && <MintedMessage tokenId={newMintId} />}
			</div>}
        </div>
        <div className="footer-container">
			<ul className="footer-links">
				<li>
		          <img
					  alt="Github Logo"
					  className="github-logo"
					  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMGMtNi42MjYgMC0xMiA1LjM3My0xMiAxMiAwIDUuMzAyIDMuNDM4IDkuOCA4LjIwNyAxMS4zODcuNTk5LjExMS43OTMtLjI2MS43OTMtLjU3N3YtMi4yMzRjLTMuMzM4LjcyNi00LjAzMy0xLjQxNi00LjAzMy0xLjQxNi0uNTQ2LTEuMzg3LTEuMzMzLTEuNzU2LTEuMzMzLTEuNzU2LTEuMDg5LS43NDUuMDgzLS43MjkuMDgzLS43MjkgMS4yMDUuMDg0IDEuODM5IDEuMjM3IDEuODM5IDEuMjM3IDEuMDcgMS44MzQgMi44MDcgMS4zMDQgMy40OTIuOTk3LjEwNy0uNzc1LjQxOC0xLjMwNS43NjItMS42MDQtMi42NjUtLjMwNS01LjQ2Ny0xLjMzNC01LjQ2Ny01LjkzMSAwLTEuMzExLjQ2OS0yLjM4MSAxLjIzNi0zLjIyMS0uMTI0LS4zMDMtLjUzNS0xLjUyNC4xMTctMy4xNzYgMCAwIDEuMDA4LS4zMjIgMy4zMDEgMS4yMy45NTctLjI2NiAxLjk4My0uMzk5IDMuMDAzLS40MDQgMS4wMi4wMDUgMi4wNDcuMTM4IDMuMDA2LjQwNCAyLjI5MS0xLjU1MiAzLjI5Ny0xLjIzIDMuMjk3LTEuMjMuNjUzIDEuNjUzLjI0MiAyLjg3NC4xMTggMy4xNzYuNzcuODQgMS4yMzUgMS45MTEgMS4yMzUgMy4yMjEgMCA0LjYwOS0yLjgwNyA1LjYyNC01LjQ3OSA1LjkyMS40My4zNzIuODIzIDEuMTAyLjgyMyAyLjIyMnYzLjI5M2MwIC4zMTkuMTkyLjY5NC44MDEuNTc2IDQuNzY1LTEuNTg5IDguMTk5LTYuMDg2IDguMTk5LTExLjM4NiAwLTYuNjI3LTUuMzczLTEyLTEyLTEyeiIvPjwvc3ZnPg==" />
		          <a
		            className="footer-text"
		            href={GITHUB_LINK}
		            target="_blank"
		            rel="noreferrer"
		          >{`explore on @${GITHUB_HANDLE}`}</a>
				</li>
				<li>
		          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
		          <a
		            className="footer-text"
		            href={TWITTER_LINK}
		            target="_blank"
		            rel="noreferrer"
		          >{`built by @${TWITTER_HANDLE}`}</a>
				</li>
				<li>
					{'🌊'}
		          <a
		            className="footer-text"
		            href={OPENSEA_LINK}
		            target="_blank"
		            rel="noreferrer"
		          >{` View Collection on OpenSea`}</a>
				</li>
			</ul>
        </div>
      </div>
    </div>
  );
};

export default App;