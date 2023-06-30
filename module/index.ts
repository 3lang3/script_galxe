import axios from "axios";
import { ethers } from "ethers";
import { getGeetestV4Captcha } from "./geetest";
import { randomString } from "@/utils/utils";

type Captcha = Awaited<ReturnType<typeof getGeetestV4Captcha>>

// 登录
const signInQuery = (p: { address: string; message: string; signature: string }) => ({ "operationName": "SignIn", "variables": { "input": p }, "query": "mutation SignIn($input: Auth) {\n  signin(input: $input)\n}\n" })

// Claim
const prepareParticipateQuery = (p: { address: string; campaignID: string; chain: string; mintCount?: number; signature?: string; captcha: Captcha }) => ({ "operationName": "PrepareParticipate", "variables": { "input": { mintCount: 1, signature: '', ...p } }, "query": "mutation PrepareParticipate($input: PrepareParticipateInput!) {\n  prepareParticipate(input: $input) {\n    allow\n    disallowReason\n    signature\n    nonce\n    mintFuncInfo {\n      funcName\n      nftCoreAddress\n      verifyIDs\n      powahs\n      cap\n      __typename\n    }\n    extLinkResp {\n      success\n      data\n      error\n      __typename\n    }\n    metaTxResp {\n      metaSig2\n      autoTaskUrl\n      metaSpaceAddr\n      forwarderAddr\n      metaTxHash\n      reqQueueing\n      __typename\n    }\n    solanaTxResp {\n      mint\n      updateAuthority\n      explorerUrl\n      signedTx\n      verifyID\n      __typename\n    }\n    aptosTxResp {\n      signatureExpiredAt\n      tokenName\n      __typename\n    }\n    tokenRewardCampaignTxResp {\n      signatureExpiredAt\n      verifyID\n      __typename\n    }\n    loyaltyPointsTxResp {\n      TotalClaimedPoints\n      __typename\n    }\n    __typename\n  }\n}\n" })

const getOrCreateInquiryByAddress = (p: { address: string; signature: string }) => ({ "operationName": "GetOrCreateInquiryByAddress", "variables": { "input": { "address": p.address.toLocaleLowerCase(), "signature": p.signature } }, "query": "mutation GetOrCreateInquiryByAddress($input: GetOrCreateInquiryByAddressInput!) {\n  getOrCreateInquiryByAddress(input: $input) {\n    status\n    vendor\n    personaInquiry {\n      inquiryID\n      sessionToken\n      declinedReason\n      __typename\n    }\n    __typename\n  }\n}\n" })

const preparePassport = (p: { address: string; signature: string }) => ({ "operationName": "PreparePassport", "variables": { "input": p }, "query": "mutation PreparePassport($input: PreparePassportInput!) {\n  preparePassport(input: $input) {\n    data\n    __typename\n  }\n}\n" })
const savePassport = (p: { address: string; signature: string; cipher: string }) => ({ "operationName": "SavePassport", "variables": { "input": p }, "query": "mutation SavePassport($input: SavePassportInput!) {\n  savePassport(input: $input) {\n    id\n    encrytionAlgorithm\n    cipher\n    __typename\n  }\n}\n" })
const basicUserInfo = (p: { address: string; }) => ({ "operationName": "BasicUserInfo", "variables": { "address": p.address, "listSpaceInput": { "first": 30 } }, "query": "query BasicUserInfo($address: String!, $listSpaceInput: ListSpaceInput!) {\n  addressInfo(address: $address) {\n    id\n    username\n    address\n    hasEmail\n    avatar\n    solanaAddress\n    aptosAddress\n    seiAddress\n    hasEvmAddress\n    hasSolanaAddress\n    hasAptosAddress\n    hasTwitter\n    hasGithub\n    hasDiscord\n    hasTelegram\n    displayEmail\n    displayTwitter\n    displayGithub\n    displayDiscord\n    displayTelegram\n    email\n    twitterUserID\n    twitterUserName\n    githubUserID\n    githubUserName\n    passport {\n      status\n      pendingRedactAt\n      id\n      __typename\n    }\n    isVerifiedTwitterOauth2\n    isVerifiedDiscordOauth2\n    displayNamePref\n    discordUserID\n    discordUserName\n    telegramUserID\n    telegramUserName\n    subscriptions\n    isWhitelisted\n    isInvited\n    isAdmin\n    passportPendingRedactAt\n    spaces(input: $listSpaceInput) {\n      list {\n        ...SpaceBasicFrag\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment SpaceBasicFrag on Space {\n  id\n  name\n  info\n  thumbnail\n  alias\n  links\n  isVerified\n  status\n  followersCount\n  __typename\n}\n" })

export class Galex {
  public req: ReturnType<typeof axios.create>;
  public wallet: ethers.Wallet;
  public token: string;
  public proxy: any;
  public captcha_id = '244bcb8b9846215df5af4c624a750db4'

  constructor(options: { privateKey: string; token?: string; proxy?: any }) {
    this.wallet = new ethers.Wallet(options.privateKey);
    this.proxy = options.proxy;
    this.req = axios.create({
      baseURL: 'https://graphigo.prd.galaxy.eco',
      proxy: options.proxy,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        'origin': 'https://galxe.co',
        "accept-language": ":zh-CN,zh;q=0.9",
      }
    })

    if (options.token) {
      this.updateToken(options.token)
    }
  }

  private updateToken(token: string) {
    this.token = token;
    this.req.interceptors.request.use(cfg => {
      cfg.headers['authorization'] = token
      return cfg;
    })
  }

  async login() {
    const address = this.wallet.address;
    if (this.token) return this.token;
    const nonce = randomString(17);
    const issuedAt = new Date().toISOString();
    const expiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    const message = `galxe.com wants you to sign in with your Ethereum account:\n${address}\n\nSign in with Ethereum to the app.\n\nURI: https://galxe.com\nVersion: 1\nChain ID: 1\nNonce: ${nonce}\nIssued At: ${issuedAt}\nExpiration Time: ${expiredAt}`;
    const signature = await this.wallet.signMessage(message)
    const res = await this.req.post('/query', signInQuery({ address, message, signature }))
    const token = res.data.data.signin as string;
    this.updateToken(token);
    return token;
  }

  async getPrepareParticipate(p: { campaignID: string; chain: string; mintCount?: number; signature?: string }) {
    if (!this.token) {
      await this.login()
    }
    const address = this.wallet.address;
    const { ...rest } = p;
    const captcha = await getGeetestV4Captcha({
      captcha_id: this.captcha_id,
      proxy: this.proxy,
    })
    const res = await this.req.post('/query', prepareParticipateQuery({ address, captcha, ...rest }))
    return res.data.data
  }

  async getOrCreateInquiryByAddress(p: { signature: string }) {
    if (!this.token) {
      await this.login()
    }
    const address = this.wallet.address;
    const res = await this.req.post('/query', getOrCreateInquiryByAddress({ address, ...p }))
    return res.data.data
  }

  async preparePassport(p: { signature: string }) {
    if (!this.token) {
      await this.login()
    }
    const address = this.wallet.address;
    const res = await this.req.post('/query', preparePassport({ address, ...p }))
    return res.data.data
  }
  async savePassport(p: { cipher: string; signature: string; }) {
    if (!this.token) {
      await this.login()
    }
    const address = this.wallet.address;
    const res = await this.req.post('/query', savePassport({ address, ...p }))
    return res.data.data
  }
  async basicUserInfo() {
    if (!this.token) {
      await this.login()
    }
    const address = this.wallet.address;
    const res = await this.req.post('/query', basicUserInfo({ address }))
    return res.data.data
  }
}