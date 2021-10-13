import pytest
from brownie import accounts


def test_token_deploys(Ticket):
    token = accounts[0].deploy(Ticket)
    assert token.name() == "Ticket"
    assert token.symbol() == "TK"

def test_mint(Ticket):
    token = accounts[0].deploy(Ticket)
    user = token.mint("Bob")
    user2 = token.mint("Sam", {'from': accounts[1]})
    print(user.events)
    print('__________________')
    print(user2.events)
    assert user.events['Transfer']['tokenId'] == 3
    assert user2.events['Transfer']['tokenId'] == 2
