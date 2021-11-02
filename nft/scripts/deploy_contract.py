from brownie import Ticket, accounts, network

def main():
	if network.show_active()=='development':
        # add these accounts to metamask by importing private key
		owner = accounts[0]
		Ticket.deploy({'from':accounts[0]})
	elif network.show_active=="kovan":
		owner= accounts.load("main")
		Ticket.deploy({'from':owner})

