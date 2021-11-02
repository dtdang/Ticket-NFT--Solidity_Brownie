import React, {Component} from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import map from "./artifacts/deployments/map.json"
import {getEthereum} from "./getEthereum"

class App extends Component {

    state = {
        web3: null,
        accounts: null,
        chainid: null,
    }

    constructor(props) {
        super(props)
        this.state = {
          account: '',
          contract: null,
          totalSupply: 0,
          names: [],
          ticketsLeft: 0
        }
      }

    componentDidMount = async () => {

        // Get network provider and web3 instance.
        const web3 = await getWeb3()

        // Try and enable accounts (connect metamask)
        try {
            const ethereum = await getEthereum()
            ethereum.enable()
        } catch (e) {
            console.log(`Could not enable accounts. Interaction with contracts not available.
            Use a modern browser with a Web3 plugin to fix this issue.`)
            console.log(e)
        }

        // Use web3 to get the user's accounts
        const accounts = await web3.eth.getAccounts()
        this.setState({account: accounts[0]})
        console.log(this.state.account)

        // Get the current chain id
        const chainid = parseInt(await web3.eth.getChainId())

        this.setState({
            web3,
            accounts,
            chainid
        }, await this.loadInitialContracts)

    }

    loadInitialContracts = async () => {
        // <=42 to exclude Kovan, <42 to include kovan
        if (this.state.chainid < 42) {
            // Wrong Network!
            return
        }
        console.log(this.state.chainid)

        var _chainID = 0;
        if (this.state.chainid === 42){
            _chainID = 42;
        }
        if (this.state.chainid === 1337){
            _chainID = "dev"
        }
        console.log(_chainID)
        const contract = await this.loadContract(_chainID, "Ticket")

        if (!contract){
            return
        }
        this.setState({contract})
        const totalSupply = await contract.methods.totalSupply().call()
        this.setState({totalSupply})
        const ticketsLeft = await contract.methods.ticketLimit().call()
        this.setState({ticketsLeft})
        //Load Names
        for (var i = 1; i <= totalSupply; i++){
            const name = await contract.methods.userNames(i - 1).call()
            this.setState({
                names: [...this.state.names, name]
            })
        }
    }

    loadContract = async (chain, contractName) => {
        // Load a deployed contract instance into a web3 contract object
        const {web3} = this.state

        // Get the address of the most recent deployment from the deployment map
        let address
        try {
            address = map[chain][contractName][0]
        } catch (e) {
            console.log(`Couldn't find any deployed contract "${contractName}" on the chain "${chain}".`)
            return undefined
        }

        // Load the artifact with the specified address
        let contractArtifact
        try {
            contractArtifact = await import(`./artifacts/deployments/${chain}/${address}.json`)
        } catch (e) {
            console.log(`Failed to load contract artifact "./artifacts/deployments/${chain}/${address}.json"`)
            return undefined
        }

        return new web3.eth.Contract(contractArtifact.abi, address)
    }

    mint = (name) => {
        this.state.contract.methods.mint(name).send({ from: this.state.account })
        .once('receipt', (receipt) => {
          this.setState({
            names: [...this.state.names, name]
          })
        })
      }

    isDisabled(){
        if (this.state.ticketsLeft == 0){
            return true;
        }
    }

    render() {
        const {
            web3, chainid, contract
        } = this.state

        if (!web3) {
            return <div>Loading Web3, accounts, and contract...</div>
        }

        // <=42 to exclude Kovan, <42 to include Kovan
        if (isNaN(chainid) || chainid < 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (!contract) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }


        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a className="navbar-brand col-sm-3 col-md-2 mr-0"> Tickets</a>
                </nav>
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                        <div className="content mr-auto ml-auto">
                            <h1>Issue Ticket</h1>
                            <form onSubmit={(event) => {
                            event.preventDefault()
                            const name = this.name.value
                            this.mint(name)
                            }}>
                            <input
                                type='text'
                                className='form-control mb-1'
                                placeholder='e.g. Sam'
                                ref={(input) => { this.name = input }}
                            />
                            <input
                                type='submit'
                                className='btn btn-block btn-primary'
                                value='MINT'
                                disabled={this.isDisabled()}
                            />
                            </form>
                        </div>
                        </main>
                    </div>
                    <hr/>
                    <div className="row text-center">
                        <div>Tickets Left: {this.state.ticketsLeft}</div>
                    </div>
                    <hr/>
                    <div className="row text-center">
                        { this.state.names.map((name, key) => {
                        return(
                            <div key={key} className="col-md-3 mb-3">
                            <div>{name}</div>
                            </div>
                        )
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default App
