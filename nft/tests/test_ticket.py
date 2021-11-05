import pytest
from brownie import accounts, Ticket


@pytest.fixture
def token(Ticket, accounts):
    return accounts[0].deploy(Ticket)

def test_token_deploys(token):
    assert token.name() == "Ticket"
    assert token.symbol() == "TK"

def test_ticketBalance(token):
    assert token.ticketLimit() == 3

def test_mint(token):
    user = token.mint("Bob")
    user2 = token.mint("Sam", {'from': accounts[1]})
    assert user.events['Transfer']['tokenId'] == 3
    assert user2.events['Transfer']['tokenId'] == 2

def test_zero_ticket(token):
    token.mint("Bob")
    token.mint("Sam", {'from': accounts[1]})
    token.mint("Tom", {'from': accounts[2]})
    emptyMint = token.mint("Eve", {'from': accounts[3]})
    if not emptyMint.events:
        emptyMint = False
    assert emptyMint == False
