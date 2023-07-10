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
const campaignInfo = (p: { id: string; address?: string; }) => ({"operationName":"CampaignInfo","variables":{"address": p.address || "","id": p.id},"query":"query CampaignInfo($id: ID!, $address: String!) {\n  campaign(id: $id) {\n    ...CampaignDetailFrag\n    space {\n      ...SpaceDetail\n      isAdmin(address: $address)\n      __typename\n    }\n    isBookmarked(address: $address)\n    claimedLoyaltyPoints(address: $address)\n    parentCampaign {\n      id\n      isSequencial\n      __typename\n    }\n    isSequencial\n    childrenCampaigns {\n      ...CampaignDetailFrag\n      parentCampaign {\n        id\n        isSequencial\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment CampaignDetailFrag on Campaign {\n  id\n  ...CampaignMedia\n  name\n  numberID\n  type\n  cap\n  info\n  useCred\n  formula\n  status\n  creator\n  thumbnail\n  gasType\n  isPrivate\n  createdAt\n  requirementInfo\n  description\n  enableWhitelist\n  chain\n  startTime\n  endTime\n  requireEmail\n  requireUsername\n  blacklistCountryCodes\n  whitelistRegions\n  rewardType\n  distributionType\n  rewardName\n  claimEndTime\n  loyaltyPoints\n  tokenRewardContract {\n    id\n    address\n    chain\n    __typename\n  }\n  tokenReward {\n    userTokenAmount\n    tokenAddress\n    depositedTokenAmount\n    tokenRewardId\n    __typename\n  }\n  nftHolderSnapshot {\n    holderSnapshotBlock\n    __typename\n  }\n  spaceStation {\n    id\n    address\n    chain\n    __typename\n  }\n  ...WhitelistInfoFrag\n  ...WhitelistSubgraphFrag\n  gamification {\n    ...GamificationDetailFrag\n    __typename\n  }\n  creds {\n    ...CredForAddress\n    __typename\n  }\n  credentialGroups(address: $address) {\n    ...CredentialGroupForAddress\n    __typename\n  }\n  dao {\n    ...DaoSnap\n    nftCores {\n      list {\n        capable\n        marketLink\n        contractAddress\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  rewardInfo {\n    discordRole {\n      guildId\n      guildName\n      roleId\n      roleName\n      inviteLink\n      __typename\n    }\n    premint {\n      startTime\n      endTime\n      chain\n      price\n      totalSupply\n      contractAddress\n      banner\n      __typename\n    }\n    loyaltyPoints {\n      points\n      __typename\n    }\n    loyaltyPointsMysteryBox {\n      points\n      weight\n      __typename\n    }\n    __typename\n  }\n  participants {\n    participantsCount\n    bountyWinnersCount\n    __typename\n  }\n  taskConfig(address: $address) {\n    participateCondition {\n      conditions {\n        ...ExpressionEntity\n        __typename\n      }\n      conditionalFormula\n      eligible\n      __typename\n    }\n    rewardConfigs {\n      conditions {\n        ...ExpressionEntity\n        __typename\n      }\n      conditionalFormula\n      description\n      rewards {\n        ...ExpressionReward\n        __typename\n      }\n      eligible\n      rewardAttrVals {\n        attrName\n        attrTitle\n        attrVal\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  recurringType\n  latestRecurringTime\n  __typename\n}\n\nfragment DaoSnap on DAO {\n  id\n  name\n  logo\n  alias\n  isVerified\n  __typename\n}\n\nfragment CampaignMedia on Campaign {\n  thumbnail\n  rewardName\n  type\n  gamification {\n    id\n    type\n    __typename\n  }\n  __typename\n}\n\nfragment CredForAddress on Cred {\n  id\n  name\n  type\n  credType\n  credSource\n  referenceLink\n  description\n  lastUpdate\n  credContractNFTHolder {\n    timestamp\n    __typename\n  }\n  chain\n  eligible(address: $address)\n  subgraph {\n    endpoint\n    query\n    expression\n    __typename\n  }\n  metadata {\n    ...CredMetaData\n    __typename\n  }\n  value {\n    gitcoinPassport {\n      score\n      lastScoreTimestamp\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment CredMetaData on CredMetadata {\n  visitLink {\n    link\n    __typename\n  }\n  gitcoinPassport {\n    score {\n      title\n      type\n      description\n      config\n      __typename\n    }\n    lastScoreTimestamp {\n      title\n      type\n      description\n      config\n      __typename\n    }\n    __typename\n  }\n  restApi {\n    url\n    method\n    headers {\n      key\n      value\n      __typename\n    }\n    postBody\n    expression\n    __typename\n  }\n  __typename\n}\n\nfragment CredentialGroupForAddress on CredentialGroup {\n  id\n  description\n  credentials {\n    ...CredForAddress\n    __typename\n  }\n  conditionRelation\n  conditions {\n    expression\n    eligible\n    __typename\n  }\n  rewards {\n    expression\n    eligible\n    rewardCount\n    rewardType\n    __typename\n  }\n  rewardAttrVals {\n    attrName\n    attrTitle\n    attrVal\n    __typename\n  }\n  claimedLoyaltyPoints\n  __typename\n}\n\nfragment WhitelistInfoFrag on Campaign {\n  id\n  whitelistInfo(address: $address) {\n    address\n    maxCount\n    usedCount\n    claimedLoyaltyPoints\n    currentPeriodClaimedLoyaltyPoints\n    currentPeriodMaxLoyaltyPoints\n    __typename\n  }\n  __typename\n}\n\nfragment WhitelistSubgraphFrag on Campaign {\n  id\n  whitelistSubgraph {\n    query\n    endpoint\n    expression\n    variable\n    __typename\n  }\n  __typename\n}\n\nfragment GamificationDetailFrag on Gamification {\n  id\n  type\n  nfts {\n    nft {\n      id\n      animationURL\n      category\n      powah\n      image\n      name\n      treasureBack\n      nftCore {\n        ...NftCoreInfoFrag\n        __typename\n      }\n      traits {\n        name\n        value\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  airdrop {\n    name\n    contractAddress\n    token {\n      address\n      icon\n      symbol\n      __typename\n    }\n    merkleTreeUrl\n    addressInfo(address: $address) {\n      index\n      amount {\n        amount\n        ether\n        __typename\n      }\n      proofs\n      __typename\n    }\n    __typename\n  }\n  forgeConfig {\n    minNFTCount\n    maxNFTCount\n    requiredNFTs {\n      nft {\n        category\n        powah\n        image\n        name\n        nftCore {\n          capable\n          contractAddress\n          __typename\n        }\n        __typename\n      }\n      count\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment NftCoreInfoFrag on NFTCore {\n  id\n  capable\n  chain\n  contractAddress\n  name\n  symbol\n  dao {\n    id\n    name\n    logo\n    alias\n    __typename\n  }\n  __typename\n}\n\nfragment ExpressionEntity on ExprEntity {\n  cred {\n    id\n    name\n    type\n    credType\n    credSource\n    referenceLink\n    description\n    lastUpdate\n    chain\n    eligible(address: $address)\n    metadata {\n      visitLink {\n        link\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  attrs {\n    attrName\n    operatorSymbol\n    targetValue\n    __typename\n  }\n  attrFormula\n  eligible\n  __typename\n}\n\nfragment ExpressionReward on ExprReward {\n  arithmetics {\n    ...ExpressionEntity\n    __typename\n  }\n  arithmeticFormula\n  rewardType\n  rewardCount\n  rewardVal\n  __typename\n}\n\nfragment SpaceDetail on Space {\n  id\n  name\n  info\n  thumbnail\n  alias\n  links\n  isVerified\n  discordGuildID\n  followersCount\n  __typename\n}\n"})

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
  async campaignInfo(p: { id: string }) {
    const address = this.wallet.address;
    const res = await this.req.post('/query', campaignInfo({ ...p }))
    return res.data.data
  }
}