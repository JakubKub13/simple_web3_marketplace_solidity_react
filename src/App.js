import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Web3zon from './abis/Web3zon.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [web3zon, setWeb3zon] = useState(null)
  const [electronics, setElectronics] = useState(null)
  const [clothing, setClothing] = useState(null)
  const [toys, setToys] = useState(null)
  const [product, setProduct] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (product) => {
    setProduct(product)
    toggle ? setToggle(false) : setToggle(true)
  }

  const loadBlockchainData = async () => {
    // Connect to blockchain
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()
    // Connect to smart contracts (create JS versions of smart contracts)
    const web3zon = new ethers.Contract(config[network.chainId].web3zon.address, Web3zon, provider)
    setWeb3zon(web3zon)
    // Load products
    const products = []
    
    for(var i = 0; i < 9; i++) {
      const product = await web3zon.products(i + 1)
      products.push(product)
  }

    const _electronics = products.filter((product) => product.category === "electronics")
    const _clothing = products.filter((product) => product.category === "clothing")
    const _toys = products.filter((product) => product.category === "toys")
    setElectronics(_electronics)
    setClothing(_clothing)
    setToys(_toys)

    console.log(_electronics)
   

}

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount}/>
      <h2>Web3zon best sellers</h2>
      {electronics && clothing && toys && (<div>
        <Section title={"Clothing and Jewelry"} items={clothing} togglePop={togglePop}></Section>
        <Section title={"Electronics & Gadgets"} items={electronics} togglePop={togglePop}></Section>
        <Section title={"Toys and Gaming"} items={toys} togglePop={togglePop}></Section>
        </div>
      )}

      {toggle && (
        <Product item={product} provider={provider} account={account} web3zon={web3zon} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;
