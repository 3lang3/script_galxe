import crypto from 'crypto';
import { ethers } from 'ethers';
import { Galex } from './module';
const createKeccakHash = require('keccak');

const bscProvider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/bsc/a9603e82251e01bf7e40029505b09457e83ed9ceaa56043dbb9657f2b676ef05');

function encryptPassportData(data: any, password: string) {
  var e = JSON.stringify(JSON.parse(data));
  var n = createKeccakHash('keccak256').update(password).digest()
  var o = crypto.randomBytes(12)
  var r = crypto.createCipheriv("aes-256-gcm", n, o)
  var c = r.update(e);
  r.final("base64");
  return "0x" + Buffer.concat([o, c, r.getAuthTag()]).toString("hex")
}

export const claimPassport = async (wallet: ethers.Wallet, password: string) => {
  const account = new Galex({ privateKey: wallet.privateKey })

  let { addressInfo } = await account.basicUserInfo();

  if (addressInfo.passport.status === 'ISSUED_NOT_MINTED' && !addressInfo.passport.id) {
    console.log(`[${wallet.address}] ${addressInfo.passport.status} 无法Mint Passport`)
    return
  }

  if (addressInfo.passport.status === 'PENDING_PREPARE' || addressInfo.passport.status === 'PENDING_SAVE') {
    let signature = await wallet.signMessage(`prepare_address_passport:${wallet.address.toLocaleLowerCase()}`);
    const { preparePassport } = await account.preparePassport({ signature });
    signature = await wallet.signMessage(`save_address_passport:${wallet.address.toLocaleLowerCase()}`);
    const cipher = encryptPassportData(preparePassport.data, password)
    await account.savePassport({ cipher, signature });
  }

  ;({ addressInfo } = await account.basicUserInfo());

  if (!addressInfo.passport.id) {
    console.log(`[${wallet.address}] kyc认证未通过, 无法Mint Passport`)
    return
  }

  // 获取mint信息
  const { prepareParticipate } = await account.getPrepareParticipate({
    signature: '',
    campaignID: 'GCfBiUt5ye',
    chain: 'BSC',
    mintCount: 1,
  })

  const { mintFuncInfo, allow, signature } = prepareParticipate;

  if (!mintFuncInfo || !allow) {
    return console.log(`[${wallet.address}] 领取NFT/获取签名信息失败, ${prepareParticipate.disallowReason}}`)
  }

  const abi = ['function claim(uint256, address, uint256, uint256, bytes) payable']
  const ca = '0x2D18f2d27D50C9b4013DEBA3D54f60996bD8847E';
  const signer = wallet.connect(bscProvider);
  const contract = new ethers.Contract(ca, abi, signer)
  const balance = await bscProvider.getBalance(wallet.address);
  const value = ethers.utils.parseEther('0.025');
  if (balance.lt(value)) {
    return console.log(`[${wallet.address}] Mint NFT失败: 余额不足`)
  }
  console.log(`[${wallet.address}] 开始领取NFT...`)
  const tx = await contract.claim(
    mintFuncInfo.powahs[0],
    mintFuncInfo.nftCoreAddress,
    mintFuncInfo.verifyIDs[0],
    mintFuncInfo.powahs[0],
    signature,
    {
      value,
      gasPrice: ethers.utils.parseUnits('1', 'gwei'),
    }
  )
  const reicept = await tx.wait();
  console.log(`[${wallet.address}] 成功领取NFT tx: ${reicept.transactionHash}`)
}