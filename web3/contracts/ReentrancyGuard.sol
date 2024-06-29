// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

abstract contract ReentrancyGuard {
    bool private _status;

    modifier nonReentrant {
        require(!_status, "ReentrancyGuard: reentrant call");
        _status = true;
        
        _;

        _status = false;
    }
}
