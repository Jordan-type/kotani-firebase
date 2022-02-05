const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require('express');
const cors = require('cors');
const Tx = require('ethereumjs-tx').Transaction
const Web3 = require('web3');
require('dotenv').config();

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

const PRIVATE_KEY='0xe5e5aa6562d90f542d5d4f24244b228cc365797ed5c1a4a8eea5b623231c6bb9'
const accounts = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);

console.log(accounts)


// database
// admin.initializeApp(functions.config().firebase);
// const db = admin.firestore();



// etherscan api
function sendRaw(rawTx, key) {
	const privateKey = new Buffer(key, 'hex');
	const tx = new Tx(rawTx);
	tx.sign(privateKey);
	const serializedTx = tx.serialize();
	web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, txHash) {
		if (err) {
			console.error('sendRawTransaction failed.');
			console.error(err);
			return;
		}

		console.log(txHash);
		setTimeout(() => {
			const transaction = web3.eth.getTransaction(txHash);
			console.log(transaction);
		}, 5 * 60 * 1000);
	});
};

const sendEther = async (sender, privatekey, receiver, ethamout) => {
    const tx = {
        from: sender,
        to: receiver,
        value: 0,
        nonce: web3.eth.getTransactionCount(sender),
        gasLimit: 21000,
        gasPrice: web3.eth.gasPrice
    }
    // const signed = await web3.eth.accounts.signTransaction(tx, privatekey);
    // const result = await web3.eth.sendSignedTransaction(signed.rawTransaction);
	if (ethamout.toString().toUpperCase() === 'ALL') {
		const gasPrice = web3.eth.gasPrice.toString(10);
		const gasVlaue = 21000 * gasPrice;
		const totalBalance = web3.eth.getBalance(sender).toNumber();
		tx.value = totalBalance - gasVlaue;
	} else {
		tx.value = web3.utils.toWei(ethamout, 'ether');
	}

	sendRaw(tx, privatekey);

}

console.log(sendEther(accounts.address, accounts.privateKey, process.env.RECEIVER_ADDRESS, '0.1'));


const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const login = (req, res, next) => {
    //authentication code goes here
    next();
}

app.use(login);

app.get('/', (req, res) => {
    let response = 'Kotani Project';
    res.send(response);
});

app.post('/api_v1/createUser', (req, res) => {
    let response = 'Kotani Project';
    res.send(response);
});

exports.endpoints = functions.https.onRequest(app);


