const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const PRICE = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Web3zone", () => {
  let web3zone;
  let deployer;
  let acc1;
  let acc2;
  let acc3;

  beforeEach(async () => {
    [deployer, acc1, acc2, acc3] = await ethers.getSigners()
    const Web3zone = await ethers.getContractFactory("Web3zon")
    web3zone = await Web3zone.deploy()
    web3zone.deployed()
  });

  describe("Deployment", () => {

    it("Owner should have same address as deployer", async () => {
      expect(await web3zone.owner()).to.equal(deployer.address)
    })
  });

  describe("Listing", () => {
    let tx;
    
    beforeEach(async () => {
      tx = await web3zone.listProducts(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        PRICE,
        RATING,
        STOCK
      )

      await tx.wait()
    })

    it("Returns product attributes", async () => {
      const product = await web3zone.products(1)
      expect(product.id).to.equal(ID)
      expect(product.name).to.equal(NAME)
      expect(product.category).to.equal(CATEGORY)
      expect(product.img).to.equal(IMAGE)
      expect(product.price).to.equal(PRICE)
      expect(product.rating).to.equal(RATING)
      expect(product.stock).to.equal(STOCK)
    })

    it("Emits ProductListed event", async () => {
      expect(tx).to.emit(web3zone, "ProductListed")
    })
  });

  describe("Buying", () => {
    let tx;
    let txBuy;

    beforeEach(async () => {
      tx = await web3zone.listProducts(
        ID,
        NAME,
        CATEGORY,
        IMAGE,
        PRICE,
        RATING,
        STOCK
      )
      await tx.wait()
      
      txBuy = await web3zone.connect(acc1).buyProducts(ID, {value: PRICE})
      await txBuy.wait()
    })

    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(web3zone.address)
      expect(result).to.equal(PRICE)
    })
      
    it("Updates buyer's order count", async () => {
      const result = await web3zone.orderCount(acc1.address)
      expect(result).to.equal(1)
    })

    it("Adds the order", async () => {
      const order = await web3zone.orders(acc1.address, 1)
      expect(order.time).to.be.greaterThan(0)
      expect(order.product.name).to.equal(NAME)
    })

    it("Emits Buy event", async () => {
      expect(txBuy).to.emit(web3zone, "Buy")
    })

    it("Should withdraw ethers for owner", async () => {
      const ownerBalanceBefore = await ethers.provider.getBalance(deployer.address)
      const txWithdraw = await web3zone.withdraw()
      await txWithdraw.wait()
      const ownerBalanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(ownerBalanceAfter).to.be.greaterThan(ownerBalanceBefore)
    })
  })
})
