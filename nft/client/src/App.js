import React, {Component} from "react"
import './App.css'
import {getWeb3} from "./getWeb3"
import {getEthereum} from "./getEthereum"
import Ticket from "../Ticket.json"

class App extends Component {

    state = {
        web3: null,
        accounts: null,
        chainid: null,
        vyperStorage: null,
        vyperValue: 0,
        vyperInput: 0,
        solidityStorage: null,
        solidityValue: 0,
        solidityInput: 0,
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


    }



    mint = (name) => {
        this.state.contract.methods.mint(name).send({ from: this.state.account })
        .once('receipt', (receipt) => {
          this.setState({
            names: [...this.state.names, name]
          })
        })
      }

    constructor(props) {
        this.state = {
          account: '',
          contract: null,
          totalSupply: 0,
          names: []
        }
      }

    render() {
        const {
            web3, accounts, chainid,
        } = this.state

        if (!web3) {
            return <div>Loading Web3, accounts, and contracts...</div>
        }

        // <=42 to exclude Kovan, <42 to include Kovan
        if (isNaN(chainid) || chainid < 42) {
            return <div>Wrong Network! Switch to your local RPC "Localhost: 8545" in your Web3 provider (e.g. Metamask)</div>
        }

        if (!vyperStorage || !solidityStorage) {
            return <div>Could not find a deployed contract. Check console for details.</div>
        }

        const isAccountsUnlocked = accounts ? accounts.length > 0 : false

        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <a
                    className="navbar-brand col-sm-3 col-md-2 mr-0"
                    target="_blank"
                >
                    Grab a Ticket
                </a>
                <ul className="navbar-nav px-3">
                    <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                    <small className="text-white"><span id="account">{this.state.account}</span></small>
                    </li>
                </ul>
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
                            />
                            </form>
                        </div>
                        </main>
                    </div>
                    <hr/>
                    <div className="row text-center">
                        { this.state.names.map((name, key) => {
                        return(
                            <div key={key} className="col-md-3 mb-3">
                            <div className="token"></div>
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
