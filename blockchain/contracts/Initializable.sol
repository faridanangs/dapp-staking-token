// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// IMPORTING CONTRACT
import "./Address.sol";

abstract contract Initializable {
    uint8 private _initialized;

    bool private _initializing;

    event Initialized(uint8 version);


    modifier initializer() {
        bool isTopLevelCall = !_initializing;

        require(
            (isTopLevelCall && _initialized < 1) ||
                (!Address.isContract(address(this)) && _initialized == 1),
            "Initializable: contract is ready initialized"
        );

        _initialized = 1;

        if (isTopLevelCall) {
            _initializing = true;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }

    modifier reinitializer(uint8 version) {
        require(
            !_initializing && _initialized < version,
            "Initialized: contract is already initialized"
        );
        _initializing = true;
        _initialized = version;
        _;
        _initializing = false;
        emit Initialized(version);
    }

    modifier onlyInitializing() {
        require(_initializing, "Initializable: contract in not initialized");
        _;
    }

    function _disableInitializers() internal virtual {
        require(!_initializing, "Initializable: contract is initializing");
        if (_initialized < type(uint8).max) {
            _initialized = type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }
}
