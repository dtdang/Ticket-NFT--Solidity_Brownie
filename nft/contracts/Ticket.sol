// SPDX-License-Identifier: MIT
pragma solidity >=0.6.6;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Ticket is ERC721 {
    uint256 public ticketLimit;
    string[] public userNames;
    mapping(address => bool) public _addressExists;
    constructor () public ERC721 ("Ticket", "TK"){
        ticketLimit = 3;
    }

    function mint(string memory _userName) public {
        if (ticketLimit != 0){
            require(!_addressExists[msg.sender]);
            userNames.push(_userName);
            uint _id = ticketLimit;
            try {
                _safeMint(msg.sender, _id);
            } catch (error){
                console.error(error).
            }
            _addressExists[msg.sender] = true;
            ticketLimit = ticketLimit - 1;
        }
    }

    function ticketBalance() public returns (uint256) {
        return ticketLimit;
    }
}
